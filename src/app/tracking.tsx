import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus,
  Activity,
  Sparkles,
  Calendar,
} from 'lucide-react-native';
import { supabase } from '../utils/supabase';
import { localStore } from '../utils/localStore';

interface TrackerItem {
  id: string;
  title: string;
  count: number;
  date: string;
  created_at: string;
}

const DEFAULT_TRACKERS = [
  'Overthinking Loop',
  'Anxious / Racing Thought',
  'Negative Self-Talk',
  'Restless Urge',
];

export default function TrackingScreen() {
  const [trackers, setTrackers] = useState<TrackerItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getTodayISO = () => new Date().toISOString().split('T')[0];

  const loadTrackers = useCallback(async () => {
    const today = getTodayISO();

    // 1. FAST LOCAL-FIRST LOAD (Never reset to 0)
    const localCached = await localStore.getTrackers(today);
    if (localCached && localCached.length > 0) {
      setTrackers(localCached);
      setIsLoading(false);
    }

    // 2. SUPABASE SYNC
    try {
      const { data, error } = await supabase
        .from('trackers')
        .select('*')
        .eq('date', today)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        // Merge with local higher counts to ensure zero-reset never occurs
        const merged = data.map((remoteItem: TrackerItem) => {
          const localItem = localCached?.find((l) => l.id === remoteItem.id || l.title === remoteItem.title);
          const highestCount = Math.max(remoteItem.count, localItem?.count || 0);
          return { ...remoteItem, count: highestCount };
        });

        setTrackers(merged);
        await localStore.setTrackers(today, merged);
      } else if (!localCached || localCached.length === 0) {
        // Seed default trackers for today if none exist anywhere
        const initial = DEFAULT_TRACKERS.map((title) => ({
          title,
          count: 0,
          date: today,
        }));

        const { data: inserted, error: insertErr } = await supabase
          .from('trackers')
          .insert(initial)
          .select();

        if (!insertErr && inserted) {
          setTrackers(inserted);
          await localStore.setTrackers(today, inserted);
        }
      }
    } catch (e) {
      console.warn('Trackers sync error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrackers();
  }, [loadTrackers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrackers();
    setRefreshing(false);
  };

  // Add custom tracker - No haptics / beeps
  const handleAddTracker = async () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    setIsAdding(true);
    const today = getTodayISO();
    const tempId = 'temp-' + Date.now();

    const newTracker: TrackerItem = {
      id: tempId,
      title: trimmed,
      count: 0,
      date: today,
      created_at: new Date().toISOString(),
    };

    const updatedTrackers = [...trackers, newTracker];
    setTrackers(updatedTrackers);
    await localStore.setTrackers(today, updatedTrackers);
    setNewTitle('');

    try {
      const { data, error } = await supabase
        .from('trackers')
        .insert([
          {
            title: trimmed,
            count: 0,
            date: today,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        const finalized = updatedTrackers.map((t) => (t.id === tempId ? data : t));
        setTrackers(finalized);
        await localStore.setTrackers(today, finalized);
      }
    } catch (e: any) {
      console.warn('Error syncing new tracker to DB:', e);
    } finally {
      setIsAdding(false);
    }
  };

  // Increment counter (+1) - No haptics / beeps
  const handleIncrement = async (tracker: TrackerItem) => {
    const today = getTodayISO();
    const newCount = tracker.count + 1;

    // Instant local state update
    const updated = trackers.map((t) =>
      t.id === tracker.id ? { ...t, count: newCount } : t
    );
    setTrackers(updated);
    await localStore.setTrackers(today, updated);

    // Sync to Supabase if not a temporary ID
    if (!tracker.id.startsWith('temp-')) {
      try {
        await supabase
          .from('trackers')
          .update({
            count: newCount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', tracker.id);
      } catch (e) {
        console.warn('Error updating tracker count in DB:', e);
      }
    }
  };

  const formatItemDate = (isoString?: string) => {
    if (!isoString) return 'Today';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Today';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Sparkles size={14} color="#2D6A4F" />
          <Text style={styles.badgeText}>OSAMA • MINDFUL TRACKING</Text>
        </View>
        <Text style={styles.title}>Habit & Thought Counters</Text>
        <Text style={styles.subtitle}>
          Track urges, thoughts, or custom habits. Tap +1 to increment count smoothly.
        </Text>
      </View>

      {/* Add New Custom Tracker Input Card */}
      <View style={styles.inputCard}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Add new habit or thought (e.g. Hello, Urge)..."
            placeholderTextColor="#758C81"
            value={newTitle}
            onChangeText={setNewTitle}
            maxLength={60}
          />
          <TouchableOpacity
            style={[styles.addBtn, !newTitle.trim() && styles.addBtnDisabled]}
            onPress={handleAddTracker}
            disabled={!newTitle.trim() || isAdding}
            activeOpacity={0.8}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Plus size={18} color="#FFFFFF" />
                <Text style={styles.addBtnText}>Add</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* List of Trackers */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2D6A4F" />
        </View>
      ) : (
        <FlatList
          data={trackers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D6A4F" />
          }
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.trackerCard}>
              <View style={styles.trackerInfo}>
                <View style={styles.iconTag}>
                  <Activity size={18} color="#2D6A4F" />
                </View>
                <View style={styles.textDetails}>
                  <Text style={styles.trackerTitle}>{item.title}</Text>
                  <Text style={styles.trackerCountSub}>
                    Observed <Text style={styles.boldCount}>{item.count}</Text> times
                  </Text>
                  {/* Small Two Days / Today & Date Tag */}
                  <View style={styles.metaRow}>
                    <Text style={styles.smallMetaBadge}>Two days</Text>
                    <Text style={styles.dotSeparator}>•</Text>
                    <Calendar size={11} color="#758C81" />
                    <Text style={styles.metaDate}>
                      Today ({formatItemDate(item.created_at)})
                    </Text>
                  </View>
                </View>
              </View>

              {/* +1 Increment Button */}
              <TouchableOpacity
                style={styles.incrementBtn}
                onPress={() => handleIncrement(item)}
                activeOpacity={0.75}
              >
                <Plus size={18} color="#FFFFFF" strokeWidth={3} />
                <Text style={styles.incrementBtnText}>+1</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8F4',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2D6A4F',
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#16231E',
  },
  subtitle: {
    fontSize: 13,
    color: '#758C81',
    marginTop: 4,
    lineHeight: 18,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E3E8DF',
    shadowColor: '#16231E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#16231E',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2D6A4F',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  addBtnDisabled: {
    backgroundColor: '#C7E1D2',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  trackerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3E8DF',
    shadowColor: '#16231E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  trackerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  iconTag: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E4F0E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textDetails: {
    flex: 1,
  },
  trackerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16231E',
  },
  trackerCountSub: {
    fontSize: 13,
    color: '#758C81',
    marginTop: 2,
  },
  boldCount: {
    color: '#2D6A4F',
    fontWeight: '800',
    fontSize: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  smallMetaBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2D6A4F',
    backgroundColor: '#E4F0E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dotSeparator: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  metaDate: {
    fontSize: 11,
    color: '#758C81',
    fontWeight: '500',
  },
  incrementBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#2D6A4F',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    minWidth: 76,
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  incrementBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
