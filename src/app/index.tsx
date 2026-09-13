import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Sparkles,
  Plus,
  Wind,
  CheckCircle2,
  Calendar,
  Heart,
  TrendingDown,
  Pill,
  Flame,
  Smile,
  Check,
} from 'lucide-react-native';
import { supabase } from '../utils/supabase';
import { localStore } from '../utils/localStore';
import BreathingModal from '../components/BreathingModal';
import PushupModal from '../components/PushupModal';
import { DAILY_AFFIRMATIONS } from '../constants/azkar';

const MOOD_OPTIONS = [
  { label: 'Excellent', emoji: '😊', color: '#2D6A4F' },
  { label: 'Good', emoji: '🙂', color: '#52B788' },
  { label: 'Okay', emoji: '😐', color: '#D97706' },
  { label: 'Anxious', emoji: '😟', color: '#E07A5F' },
  { label: 'Low', emoji: '😞', color: '#B91C1C' },
];

export default function DashboardScreen() {
  const [todayDate, setTodayDate] = useState('');
  const [gutkaCount, setGutkaCount] = useState(0);
  const [prayersDone, setPrayersDone] = useState(0);
  const [breathingDone, setBreathingDone] = useState(false);
  const [pushupsDone, setPushupsDone] = useState(false);
  const [medicineDone, setMedicineDone] = useState(false);
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const [history7Days, setHistory7Days] = useState<{ date: string; count: number }[]>([]);
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);
  const [isPushupModalOpen, setIsPushupModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dailyQuote, setDailyQuote] = useState('');

  const getTodayISO = () => new Date().toISOString().split('T')[0];

  const loadDashboardData = useCallback(async () => {
    const today = getTodayISO();

    // Friendly date string
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    };
    setTodayDate(new Date().toLocaleDateString(undefined, options));

    // Daily affirmation
    const quoteIndex = new Date().getDate() % DAILY_AFFIRMATIONS.length;
    setDailyQuote(DAILY_AFFIRMATIONS[quoteIndex]);

    // 1. FAST LOCAL-FIRST LOAD (Never reset to 0)
    const localGutka = await localStore.getGutkaCount(today);
    setGutkaCount(localGutka);

    const localMed = await localStore.getMedicineDone(today);
    setMedicineDone(localMed);

    const localPush = await localStore.getPushupsDone(today);
    setPushupsDone(localPush);

    const localBreath = await localStore.getBreathingDone(today);
    setBreathingDone(localBreath);

    const localM = await localStore.getTodayMood(today);
    if (localM) setTodayMood(localM);

    // 2. SUPABASE SYNC (Enhance with DB state if online)
    try {
      // Gutka Count
      const { data: gutkaData } = await supabase
        .from('daily_gutka')
        .select('count')
        .eq('date', today)
        .maybeSingle();

      if (gutkaData && typeof gutkaData.count === 'number') {
        const higherCount = Math.max(localGutka, gutkaData.count);
        setGutkaCount(higherCount);
        await localStore.setGutkaCount(today, higherCount);
      }

      // 7 Days History
      const { data: historyData } = await supabase
        .from('daily_gutka')
        .select('date, count')
        .order('date', { ascending: false })
        .limit(7);

      if (historyData) {
        setHistory7Days(historyData);
      }

      // Prayers Done
      const { data: prayersData } = await supabase
        .from('daily_namaz')
        .select('id')
        .eq('date', today)
        .eq('is_done', true);

      if (prayersData) {
        setPrayersDone(prayersData.length);
      }

      // Breathing Sessions
      const { data: breathData } = await supabase
        .from('breathing_sessions')
        .select('id')
        .eq('date', today)
        .limit(1);

      if (breathData && breathData.length > 0) {
        setBreathingDone(true);
        await localStore.setBreathingDone(today, true);
      }

      // Pushups Session
      const { data: pushData } = await supabase
        .from('daily_pushups')
        .select('id, completed')
        .eq('date', today)
        .maybeSingle();

      if (pushData?.completed) {
        setPushupsDone(true);
        await localStore.setPushupsDone(today, true);
      }

      // Medicine Status
      const { data: medData } = await supabase
        .from('daily_medicine')
        .select('is_done')
        .eq('date', today)
        .maybeSingle();

      if (medData?.is_done) {
        setMedicineDone(true);
        await localStore.setMedicineDone(today, true);
      }

      // Mood
      const { data: moodData } = await supabase
        .from('daily_mood')
        .select('mood')
        .eq('date', today)
        .maybeSingle();

      if (moodData?.mood) {
        setTodayMood(moodData.mood);
        await localStore.setTodayMood(today, moodData.mood);
      }
    } catch (err) {
      console.warn('Dashboard online sync note:', err);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Increment Gutka count (+1) - No haptics / beeps
  const handleIncrementGutka = async () => {
    const today = getTodayISO();
    const newCount = gutkaCount + 1;
    setGutkaCount(newCount);
    await localStore.setGutkaCount(today, newCount);

    try {
      await supabase.from('daily_gutka').upsert(
        {
          date: today,
          count: newCount,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'date' }
      );
      loadDashboardData();
    } catch (e) {
      console.warn('Error syncing gutka to Supabase:', e);
    }
  };

  // Toggle Medicine - No haptics / beeps
  const handleToggleMedicine = async () => {
    const today = getTodayISO();
    const newStatus = !medicineDone;
    setMedicineDone(newStatus);
    await localStore.setMedicineDone(today, newStatus);

    try {
      await supabase.from('daily_medicine').upsert(
        {
          date: today,
          is_done: newStatus,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'date' }
      );
    } catch (e) {
      console.warn('Error syncing medicine status:', e);
    }
  };

  // Select Mood - No haptics / beeps
  const handleSelectMood = async (moodLabel: string) => {
    const today = getTodayISO();
    setTodayMood(moodLabel);
    await localStore.setTodayMood(today, moodLabel);

    try {
      await supabase.from('daily_mood').upsert(
        {
          date: today,
          mood: moodLabel,
        },
        { onConflict: 'date' }
      );
    } catch (e) {
      console.warn('Error syncing mood:', e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D6A4F" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Bar */}
        <View style={styles.header}>
          <View>
            <View style={styles.badgeRow}>
              <Sparkles size={14} color="#2D6A4F" />
              <Text style={styles.badgeText}>OSAMA</Text>
            </View>
            <Text style={styles.greetingTitle}>Assalamu Alaikum</Text>
            <View style={styles.dateRow}>
              <Calendar size={14} color="#52665D" />
              <Text style={styles.dateText}>{todayDate}</Text>
            </View>
          </View>
        </View>

        {/* Mindful Anchor Affirmation Card */}
        <View style={styles.affirmationCard}>
          <View style={styles.affirmationHeader}>
            <Heart size={16} color="#D97706" />
            <Text style={styles.affirmationLabel}>Daily Mindful Anchor</Text>
          </View>
          <Text style={styles.affirmationText}>"{dailyQuote}"</Text>
        </View>

        {/* Today's Goals Section (5 Core Goals) */}
        <View style={styles.goalsHeader}>
          <Text style={styles.sectionTitle}>Today's Goals</Text>
          <Text style={styles.goalsSubtitle}>Your daily discipline & mindfulness</Text>
        </View>

        <View style={styles.goalsGrid}>
          {/* 1. Salah */}
          <View style={[styles.goalPill, prayersDone === 5 && styles.goalPillDone]}>
            <Text style={styles.goalPillEmoji}>🕌</Text>
            <View style={styles.goalPillContent}>
              <Text style={styles.goalPillTitle}>5 Salah</Text>
              <Text style={styles.goalPillStatus}>
                {prayersDone === 5 ? '5/5 Done ✅' : `${prayersDone}/5 Done`}
              </Text>
            </View>
          </View>

          {/* 2. Inhale / Exhale Breathing */}
          <TouchableOpacity
            style={[styles.goalPill, breathingDone && styles.goalPillDone]}
            onPress={() => setIsBreathingModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.goalPillEmoji}>🌬️</Text>
            <View style={styles.goalPillContent}>
              <Text style={styles.goalPillTitle}>Breathing</Text>
              <Text style={styles.goalPillStatus}>
                {breathingDone ? 'Complete ✅' : 'Tap to Start'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* 3. Push-ups */}
          <TouchableOpacity
            style={[styles.goalPill, pushupsDone && styles.goalPillDone]}
            onPress={() => setIsPushupModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.goalPillEmoji}>💪</Text>
            <View style={styles.goalPillContent}>
              <Text style={styles.goalPillTitle}>Push-ups</Text>
              <Text style={styles.goalPillStatus}>
                {pushupsDone ? 'Complete ✅' : '60s Challenge'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* 4. Medicine */}
          <TouchableOpacity
            style={[styles.goalPill, medicineDone && styles.goalPillDone]}
            onPress={handleToggleMedicine}
            activeOpacity={0.8}
          >
            <Text style={styles.goalPillEmoji}>💊</Text>
            <View style={styles.goalPillContent}>
              <Text style={styles.goalPillTitle}>Medicine</Text>
              <Text style={styles.goalPillStatus}>
                {medicineDone ? 'Taken ✅' : 'Mark Done'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* 5. Mood Check */}
          <View style={[styles.goalPill, todayMood && styles.goalPillDone]}>
            <Text style={styles.goalPillEmoji}>
              {todayMood ? MOOD_OPTIONS.find((m) => m.label === todayMood)?.emoji || '😊' : '✨'}
            </Text>
            <View style={styles.goalPillContent}>
              <Text style={styles.goalPillTitle}>Mood</Text>
              <Text style={styles.goalPillStatus}>
                {todayMood ? `${todayMood} ✅` : 'Check-in Below'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Action Cards: Medicine & Push-up (Top Row) */}
        <View style={styles.quickActionsRow}>
          {/* Medicine Card */}
          <View style={[styles.actionCard, medicineDone && styles.actionCardDone]}>
            <View style={styles.actionCardTop}>
              <View style={[styles.actionIconBox, { backgroundColor: '#E4F0E9' }]}>
                <Pill size={20} color="#2D6A4F" />
              </View>
              <Text style={styles.actionCardBadge}>DAILY</Text>
            </View>
            <Text style={styles.actionCardTitle}>Medicine</Text>
            <Text style={styles.actionCardDesc}>Daily prescribed dosage</Text>
            <TouchableOpacity
              style={[styles.actionBtn, medicineDone ? styles.actionBtnDone : styles.actionBtnActive]}
              onPress={handleToggleMedicine}
              activeOpacity={0.8}
            >
              {medicineDone ? (
                <>
                  <Check size={16} color="#2D6A4F" strokeWidth={3} />
                  <Text style={styles.actionBtnTextDone}>Taken Today</Text>
                </>
              ) : (
                <Text style={styles.actionBtnTextActive}>Mark Done</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Push-ups 60s Challenge Card */}
          <View style={[styles.actionCard, pushupsDone && styles.actionCardDone]}>
            <View style={styles.actionCardTop}>
              <View style={[styles.actionIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Flame size={20} color="#D97706" />
              </View>
              <Text style={[styles.actionCardBadge, { color: '#D97706', backgroundColor: '#FFFBEB' }]}>
                60 SEC
              </Text>
            </View>
            <Text style={styles.actionCardTitle}>Push-ups</Text>
            <Text style={styles.actionCardDesc}>1 min guided workout</Text>
            <TouchableOpacity
              style={[styles.actionBtn, pushupsDone ? styles.actionBtnDone : styles.actionBtnPushup]}
              onPress={() => setIsPushupModalOpen(true)}
              activeOpacity={0.8}
            >
              {pushupsDone ? (
                <>
                  <Check size={16} color="#2D6A4F" strokeWidth={3} />
                  <Text style={styles.actionBtnTextDone}>Crushed It</Text>
                </>
              ) : (
                <Text style={styles.actionBtnTextActive}>Start (60s)</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Mood Tracker (Positioned Above Intake Tracker) */}
        <View style={styles.moodCard}>
          <View style={styles.moodHeader}>
            <View>
              <Text style={styles.moodTitle}>How are you feeling today?</Text>
              <Text style={styles.moodSubtitle}>Daily check-in • Notice how your heart feels</Text>
            </View>
            {todayMood && (
              <View style={styles.moodSavedPill}>
                <CheckCircle2 size={13} color="#2D6A4F" />
                <Text style={styles.moodSavedText}>{todayMood}</Text>
              </View>
            )}
          </View>

          <View style={styles.moodOptionsRow}>
            {MOOD_OPTIONS.map((item) => {
              const isSelected = todayMood === item.label;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.moodOption, isSelected && styles.moodOptionSelected]}
                  onPress={() => handleSelectMood(item.label)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.moodEmoji}>{item.emoji}</Text>
                  <Text style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Daily Intake Tracker (Gutka) - Never resets to 0 */}
        <View style={styles.gutkaCard}>
          <View style={styles.gutkaHeader}>
            <View>
              <Text style={styles.gutkaTitle}>Daily Intake Tracker</Text>
              <Text style={styles.gutkaSubtitle}>
                Tracks each intake today. Stored in DB & local storage.
              </Text>
            </View>
          </View>

          {/* Count Display */}
          <View style={styles.gutkaCountContainer}>
            <Text style={styles.gutkaCountNumber}>{gutkaCount}</Text>
            <Text style={styles.gutkaCountLabel}>intakes logged today</Text>
          </View>

          {/* Large Friendly +1 Tap Button */}
          <TouchableOpacity
            style={styles.gutkaAddButton}
            onPress={handleIncrementGutka}
            activeOpacity={0.8}
          >
            <Plus size={26} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.gutkaAddButtonText}>Add Intake (+1)</Text>
          </TouchableOpacity>

          {/* Past 7 Days Mini Trend */}
          {history7Days.length > 0 && (
            <View style={styles.historySection}>
              <View style={styles.historyTitleRow}>
                <TrendingDown size={14} color="#758C81" />
                <Text style={styles.historyTitle}>Recent Daily History (Preserved in DB):</Text>
              </View>
              <View style={styles.historyPills}>
                {history7Days.slice(0, 5).map((item) => (
                  <View key={item.date} style={styles.historyPill}>
                    <Text style={styles.historyPillDate}>
                      {item.date === getTodayISO()
                        ? 'Today'
                        : new Date(item.date).toLocaleDateString(undefined, {
                            weekday: 'short',
                          })}
                    </Text>
                    <Text style={styles.historyPillCount}>{item.count}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Quick Inhale / Exhale Relaxation Banner */}
        <TouchableOpacity
          style={styles.relaxBanner}
          onPress={() => setIsBreathingModalOpen(true)}
          activeOpacity={0.85}
        >
          <View style={styles.relaxIconBox}>
            <Wind size={24} color="#2D6A4F" />
          </View>
          <View style={styles.relaxTextBox}>
            <Text style={styles.relaxTitle}>60-Second Inhale & Exhale</Text>
            <Text style={styles.relaxDesc}>
              Tap for a guided calm breathing session to quiet thoughts.
            </Text>
          </View>
          <View style={styles.relaxAction}>
            <Text style={styles.relaxActionText}>
              {breathingDone ? 'Again' : 'Start'}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Guided Inhale / Exhale Breathing Modal */}
      <BreathingModal
        visible={isBreathingModalOpen}
        onClose={() => setIsBreathingModalOpen(false)}
        onCompleted={loadDashboardData}
      />

      {/* 60s Push-up Challenge Modal */}
      <PushupModal
        visible={isPushupModalOpen}
        onClose={() => setIsPushupModalOpen(false)}
        onCompleted={loadDashboardData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8F4',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  header: {
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2D6A4F',
    letterSpacing: 1.5,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#16231E',
    letterSpacing: -0.5,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#52665D',
    fontWeight: '500',
  },
  affirmationCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 18,
  },
  affirmationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  affirmationLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  affirmationText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  goalsHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16231E',
  },
  goalsSubtitle: {
    fontSize: 12,
    color: '#758C81',
    marginTop: 2,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  goalPill: {
    flexBasis: '31%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E3E8DF',
    alignItems: 'center',
    gap: 4,
  },
  goalPillDone: {
    backgroundColor: '#E4F0E9',
    borderColor: '#C7E1D2',
  },
  goalPillEmoji: {
    fontSize: 18,
  },
  goalPillContent: {
    alignItems: 'center',
  },
  goalPillTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16231E',
  },
  goalPillStatus: {
    fontSize: 10,
    color: '#2D6A4F',
    fontWeight: '600',
    marginTop: 2,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3E8DF',
    justifyContent: 'space-between',
  },
  actionCardDone: {
    backgroundColor: '#F8FBF9',
    borderColor: '#C7E1D2',
  },
  actionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCardBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2D6A4F',
    backgroundColor: '#E4F0E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16231E',
  },
  actionCardDesc: {
    fontSize: 11,
    color: '#758C81',
    marginTop: 2,
    marginBottom: 12,
  },
  actionBtn: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  actionBtnActive: {
    backgroundColor: '#2D6A4F',
  },
  actionBtnPushup: {
    backgroundColor: '#D97706',
  },
  actionBtnDone: {
    backgroundColor: '#E4F0E9',
    borderWidth: 1,
    borderColor: '#C7E1D2',
  },
  actionBtnTextActive: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  actionBtnTextDone: {
    color: '#2D6A4F',
    fontSize: 12,
    fontWeight: '800',
  },
  moodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E3E8DF',
    marginBottom: 18,
    shadowColor: '#16231E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  moodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  moodTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16231E',
  },
  moodSubtitle: {
    fontSize: 12,
    color: '#758C81',
    marginTop: 2,
  },
  moodSavedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E4F0E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  moodSavedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2D6A4F',
  },
  moodOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  moodOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F8F9F5',
    borderWidth: 1,
    borderColor: '#EFF1E9',
  },
  moodOptionSelected: {
    backgroundColor: '#E4F0E9',
    borderColor: '#2D6A4F',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#758C81',
  },
  moodLabelSelected: {
    color: '#2D6A4F',
    fontWeight: '800',
  },
  gutkaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E3E8DF',
    marginBottom: 18,
    shadowColor: '#16231E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  gutkaHeader: {
    marginBottom: 16,
  },
  gutkaTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16231E',
  },
  gutkaSubtitle: {
    fontSize: 13,
    color: '#758C81',
    marginTop: 4,
    lineHeight: 18,
  },
  gutkaCountContainer: {
    backgroundColor: '#F8F9F5',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#EFF1E9',
  },
  gutkaCountNumber: {
    fontSize: 54,
    fontWeight: '900',
    color: '#2D6A4F',
    fontVariant: ['tabular-nums'],
  },
  gutkaCountLabel: {
    fontSize: 14,
    color: '#52665D',
    fontWeight: '500',
    marginTop: 2,
  },
  gutkaAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2D6A4F',
    paddingVertical: 18,
    borderRadius: 18,
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  gutkaAddButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  historySection: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#EFF1E9',
  },
  historyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 12,
    color: '#758C81',
    fontWeight: '600',
  },
  historyPills: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  historyPill: {
    flex: 1,
    backgroundColor: '#F8F9F5',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3E8DF',
  },
  historyPillDate: {
    fontSize: 11,
    color: '#758C81',
    fontWeight: '600',
  },
  historyPillCount: {
    fontSize: 14,
    color: '#16231E',
    fontWeight: '700',
    marginTop: 2,
  },
  relaxBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4F0E9',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C7E1D2',
    gap: 12,
  },
  relaxIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  relaxTextBox: {
    flex: 1,
  },
  relaxTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B4332',
  },
  relaxDesc: {
    fontSize: 12,
    color: '#2D6A4F',
    marginTop: 2,
    lineHeight: 16,
  },
  relaxAction: {
    backgroundColor: '#2D6A4F',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  relaxActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
