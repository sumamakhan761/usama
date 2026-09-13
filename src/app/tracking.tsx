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
  Trash2,
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

    // 1. FAST LOCAL-FIRST LOAD (Permanent counters across all dates)
    const localCached = await localStore.getTrackers();
    if (localCached && localCached.length > 0) {
      setTrackers(localCached);
      setIsLoading(false);
    }

    // 2. SUPABASE SYNC (Permanent cumulative list)
    try {
      const { data, error } = await supabase
        .from('trackers')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        // Merge with local higher counts to ensure zero-reset never occurs
        const merged = data.map((remoteItem: TrackerItem) => {
          const localItem = localCached?.find((l) => l.id === remoteItem.id || l.title === remoteItem.title);
          const highestCount = Math.max(remoteItem.count, localItem?.count || 0);
          return { ...remoteItem, count: highestCount };
        });

        // Retain any locally added unsynced items
        if (localCached) {
          for (const localItem of localCached) {
            if (!merged.some((m) => m.id === localItem.id || m.title === localItem.title)) {
              merged.push(localItem);
            }
          }
        }

        setTrackers(merged);
        await localStore.setTrackers(merged);
      } else if (!localCached || localCached.length === 0) {
        // Seed default trackers once if none exist anywhere
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
          await localStore.setTrackers(inserted);
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
    await localStore.setTrackers(updatedTrackers);
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
        await localStore.setTrackers(finalized);
      }
    } catch (e: any) {
      console.warn('Error syncing new tracker to DB:', e);
    } finally {
      setIsAdding(false);
    }
  };

  // Increment counter (+1) - No haptics / beeps, permanent cumulative
  const handleIncrement = async (tracker: TrackerItem) => {
    const newCount = tracker.count + 1;

    // Instant local state update
    const updated = trackers.map((t) =>
      t.id === tracker.id ? { ...t, count: newCount } : t
    );
    setTrackers(updated);
    await localStore.setTrackers(updated);

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

  const confirmDeleteTracker = (tracker: TrackerItem) => {
    Alert.alert(
      'Delete Tracker',
      `Are you sure you want to remove "${tracker.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeleteTracker(tracker),
        },
      ]
    );
  };

  const handleDeleteTracker = async (tracker: TrackerItem) => {
    // 1. Instant local removal
    const updated = trackers.filter((t) => t.id !== tracker.id);
    setTrackers(updated);
    await localStore.setTrackers(updated);

    // 2. Supabase deletion
    if (!tracker.id.startsWith('temp-')) {
      try {
        await supabase.from('trackers').delete().eq('id', tracker.id);
      } catch (e) {
        console.warn('Error deleting tracker from DB:', e);
      }
    }
  };

  const formatItemDate = (isoString?: string) => {
    if (!isoString) return 'Active';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Active';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Sparkles size={14} color="#2D6A4F" />
          <Text style={styles.badgeText}>USAMA • HABIT TRACKING</Text>
        </View>
        <Text style={styles.title}>Habit & Thought Counters</Text>
        <Text style={styles.subtitle}>
          Track urges, thoughts, or custom habits. Counters are permanent and keep accumulating.
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
                  {/* Cumulative Permanent Tag */}
                  <View style={styles.metaRow}>
                    <Text style={styles.smallMetaBadge}>Cumulative</Text>
                    <Text style={styles.dotSeparator}>•</Text>
                    <Calendar size={11} color="#758C81" />
                    <Text style={styles.metaDate}>
                      Started {formatItemDate(item.created_at)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons: Delete + Increment */}
              <View style={styles.trackerActions}>
                <TouchableOpacity
                  style={styles.deleteTrackerBtn}
                  onPress={() => confirmDeleteTracker(item)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2 size={16} color="#E07A5F" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.incrementBtn}
                  onPress={() => handleIncrement(item)}
                  activeOpacity={0.75}
                >
                  <Plus size={22} color="#FFFFFF" strokeWidth={2.8} />
                </TouchableOpacity>
              </View>
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
  trackerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteTrackerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FDF2F0',
    borderWidth: 1,
    borderColor: '#FBD5D0',
  },
  incrementBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D6A4F',
    width: 44,
    height: 44,
    borderRadius: 14,
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
