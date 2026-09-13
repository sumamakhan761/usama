import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  CheckCircle,
  Clock,
  Sparkles,
  Wind,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  ExternalLink,
  Pill,
  Flame,
  Check,
} from 'lucide-react-native';
import { supabase } from '../utils/supabase';
import { localStore } from '../utils/localStore';
import { uploadImageToSupabase } from '../utils/storage';
import BreathingModal from '../components/BreathingModal';
import PushupModal from '../components/PushupModal';
import AzkarPlayer from '../components/AzkarPlayer';
import { DAILY_AZKAR } from '../constants/azkar';

interface PrayerItem {
  name: string;
  timeLabel: string;
  icon: any;
  isDone: boolean;
  photoUrl?: string;
  completedAt?: string;
}

const DEFAULT_PRAYERS: Omit<PrayerItem, 'isDone'>[] = [
  { name: 'Fajr', timeLabel: 'Dawn Prayer', icon: Sunrise },
  { name: 'Zuhr', timeLabel: 'Noon Prayer', icon: Sun },
  { name: 'Asr', timeLabel: 'Afternoon Prayer', icon: Sun },
  { name: 'Maghrib', timeLabel: 'Sunset Prayer', icon: Sunset },
  { name: 'Isha', timeLabel: 'Night Prayer', icon: Moon },
];

export default function DailyScreen() {
  const [prayers, setPrayers] = useState<PrayerItem[]>(
    DEFAULT_PRAYERS.map((p) => ({ ...p, isDone: false }))
  );
  const [uploadingPrayer, setUploadingPrayer] = useState<string | null>(null);
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);
  const [isPushupModalOpen, setIsPushupModalOpen] = useState(false);
  const [medicineDone, setMedicineDone] = useState(false);
  const [pushupsDone, setPushupsDone] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const getTodayISO = () => new Date().toISOString().split('T')[0];

  const loadData = useCallback(async () => {
    const today = getTodayISO();

    // 1. FAST LOCAL-FIRST CACHE LOAD
    const localMed = await localStore.getMedicineDone(today);
    setMedicineDone(localMed);

    const localPush = await localStore.getPushupsDone(today);
    setPushupsDone(localPush);

    const localPrayersMap = await localStore.getPrayers(today);
    if (localPrayersMap) {
      setPrayers((prev) =>
        prev.map((p) => {
          const found = localPrayersMap[p.name];
          if (found) {
            return {
              ...p,
              isDone: found.isDone,
              photoUrl: found.photoUrl,
              completedAt: found.completedAt,
            };
          }
          return p;
        })
      );
    }

    // 2. SUPABASE NETWORK SYNC
    try {
      // Fetch Prayers
      const { data, error } = await supabase
        .from('daily_namaz')
        .select('*')
        .eq('date', today);

      if (!error && data) {
        const prayersMapToSave: Record<string, { isDone: boolean; photoUrl?: string; completedAt?: string }> = {};

        const updated = DEFAULT_PRAYERS.map((p) => {
          const found = data.find((row: any) => row.prayer_name === p.name);
          const isDone = found?.is_done || false;
          const photoUrl = found?.photo_url || undefined;
          const completedAt = found?.completed_at || undefined;

          prayersMapToSave[p.name] = { isDone, photoUrl, completedAt };

          return {
            ...p,
            isDone,
            photoUrl,
            completedAt,
          };
        });

        setPrayers(updated);
        await localStore.setPrayers(today, prayersMapToSave);
      }

      // Fetch Medicine
      const { data: medData } = await supabase
        .from('daily_medicine')
        .select('is_done')
        .eq('date', today)
        .maybeSingle();
      if (medData?.is_done) {
        setMedicineDone(true);
        await localStore.setMedicineDone(today, true);
      }

      // Fetch Pushups
      const { data: pushData } = await supabase
        .from('daily_pushups')
        .select('completed')
        .eq('date', today)
        .maybeSingle();
      if (pushData?.completed) {
        setPushupsDone(true);
        await localStore.setPushupsDone(today, true);
      }
    } catch (e) {
      console.warn('Error fetching daily data from Supabase:', e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Toggle Medicine
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
      console.warn('Error syncing medicine:', e);
    }
  };

  // Handle Prayer Press: CAMERA ONLY (No gallery picker)
  const handlePrayerPress = async (prayerName: string) => {
    const target = prayers.find((p) => p.name === prayerName);
    if (target?.isDone) {
      if (target.photoUrl) {
        openPhotoInBrowser(target.photoUrl);
      } else {
        Alert.alert(
          `${prayerName} Completed`,
          `Marked done at ${formatTime(target.completedAt)}.`
        );
      }
      return;
    }

    // Directly open Camera (Take Photo only)
    await takePrayerPhoto(prayerName);
  };

  const takePrayerPhoto = async (prayerName: string) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Needed',
          'Please allow camera access to take prayer proof.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const imageUri = result.assets[0].uri;
        setUploadingPrayer(prayerName);

        const today = getTodayISO();
        const nowISO = new Date().toISOString();

        // 1. Upload to Supabase Storage Bucket 'namaz-proofs'
        const publicUrl = await uploadImageToSupabase(imageUri, 'namaz-proofs');

        // 2. Update local state immediately
        setPrayers((prev) =>
          prev.map((p) =>
            p.name === prayerName
              ? { ...p, isDone: true, photoUrl: publicUrl, completedAt: nowISO }
              : p
          )
        );

        // 3. Cache locally
        const currentPrayersMap = (await localStore.getPrayers(today)) || {};
        currentPrayersMap[prayerName] = {
          isDone: true,
          photoUrl: publicUrl,
          completedAt: nowISO,
        };
        await localStore.setPrayers(today, currentPrayersMap);

        // 4. Upsert into Supabase daily_namaz table
        await supabase.from('daily_namaz').upsert(
          {
            date: today,
            prayer_name: prayerName,
            is_done: true,
            photo_url: publicUrl,
            completed_at: nowISO,
          },
          { onConflict: 'date, prayer_name' }
        );

        loadData();
      }
    } catch (e: any) {
      console.warn('Photo upload error:', e);
      Alert.alert('Notice', 'Photo saved locally.');
    } finally {
      setUploadingPrayer(null);
    }
  };

  const openPhotoInBrowser = async (url?: string) => {
    if (!url) return;
    try {
      const can = await Linking.canOpenURL(url);
      if (can) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(url);
      }
    } catch (err) {
      console.warn('Could not open URL:', err);
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const completedCount = prayers.filter((p) => p.isDone).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D6A4F" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <Sparkles size={14} color="#2D6A4F" />
            <Text style={styles.badgeText}>USAMA • DAILY HABITS</Text>
          </View>
          <Text style={styles.title}>Spiritual & Physical Wellness</Text>
          <Text style={styles.subtitle}>
            Five daily prayers with photo proof, medicine, push-ups, and mindful breathing.
          </Text>
        </View>

        {/* Top Quick Actions Row: Medicine & Push-ups */}
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

        {/* Section 1: Inhale / Exhale Breathing Card */}
        <View style={styles.breathingBanner}>
          <View style={styles.breathingIconBox}>
            <Wind size={24} color="#2D6A4F" />
          </View>
          <View style={styles.breathingTextBox}>
            <Text style={styles.breathingTitle}>60s Inhale & Exhale</Text>
            <Text style={styles.breathingDesc}>
              Therapeutic deep breathing to calm anxiety and restore inner serenity.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.breathingBtn}
            onPress={() => setIsBreathingModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.breathingBtnText}>Start</Text>
          </TouchableOpacity>
        </View>

        {/* Section 2: 5 Daily Prayers Tracking (Take Photo Only) */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Sparkles size={18} color="#2D6A4F" />
            <Text style={styles.sectionTitle}>Five Daily Namaz</Text>
          </View>
          <Text style={styles.counterPill}>{completedCount} of 5 Done</Text>
        </View>

        {completedCount === 5 && (
          <View style={styles.allDoneBanner}>
            <CheckCircle size={22} color="#2D6A4F" />
            <Text style={styles.allDoneText}>
              All 5 prayers completed today, Masha'Allah! May your heart stay at peace.
            </Text>
          </View>
        )}

        <View style={styles.prayersList}>
          {prayers.map((prayer) => {
            const IconComponent = prayer.icon;
            const isUploadingThis = uploadingPrayer === prayer.name;

            return (
              <View
                key={prayer.name}
                style={[styles.prayerCard, prayer.isDone && styles.prayerCardDone]}
              >
                <View style={styles.prayerLeft}>
                  <View
                    style={[
                      styles.prayerIconBox,
                      prayer.isDone && styles.prayerIconBoxDone,
                    ]}
                  >
                    <IconComponent
                      size={20}
                      color={prayer.isDone ? '#2D6A4F' : '#52665D'}
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.prayerName,
                        prayer.isDone && styles.prayerNameDone,
                      ]}
                    >
                      {prayer.name}
                    </Text>
                    <Text style={styles.prayerTimeLabel}>
                      {prayer.isDone && prayer.completedAt
                        ? `Done at ${formatTime(prayer.completedAt)}`
                        : prayer.timeLabel}
                    </Text>
                  </View>
                </View>

                {/* Right Status */}
                <View style={styles.prayerRight}>
                  {isUploadingThis ? (
                    <ActivityIndicator size="small" color="#2D6A4F" />
                  ) : prayer.isDone ? (
                    <View style={styles.doneContainer}>
                      {prayer.photoUrl ? (
                        <>
                          <TouchableOpacity
                            onPress={() => openPhotoInBrowser(prayer.photoUrl)}
                            activeOpacity={0.7}
                            style={styles.thumbnailWrapper}
                          >
                            <Image
                              source={{ uri: prayer.photoUrl }}
                              style={styles.proofThumbnail}
                            />
                          </TouchableOpacity>

                          {/* Clickable View Photo Link */}
                          <TouchableOpacity
                            style={styles.viewPhotoLink}
                            onPress={() => openPhotoInBrowser(prayer.photoUrl)}
                            activeOpacity={0.7}
                          >
                            <ExternalLink size={13} color="#2D6A4F" />
                            <Text style={styles.viewPhotoText}>View</Text>
                          </TouchableOpacity>
                        </>
                      ) : null}

                      <View style={styles.doneBadge}>
                        <CheckCircle size={15} color="#2D6A4F" />
                        <Text style={styles.doneText}>Done</Text>
                      </View>
                    </View>
                  ) : (
                    /* TAKE PHOTO CTA (Camera Only) */
                    <TouchableOpacity
                      style={styles.uploadCta}
                      onPress={() => handlePrayerPress(prayer.name)}
                      activeOpacity={0.8}
                    >
                      <Camera size={16} color="#FFFFFF" />
                      <Text style={styles.uploadCtaText}>Take Photo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Section 3: Daily Azkar & Mindful Quranic Surahs */}
        <View style={[styles.sectionHeader, { marginTop: 28 }]}>
          <View style={styles.sectionTitleRow}>
            <Clock size={18} color="#2D6A4F" />
            <Text style={styles.sectionTitle}>Daily Azkar & Mindful Surahs</Text>
          </View>
        </View>

        <View style={styles.azkarList}>
          {DAILY_AZKAR.map((azkar) => (
            <AzkarPlayer key={azkar.id} item={azkar} />
          ))}
        </View>
      </ScrollView>

      {/* Guided Inhale / Exhale Breathing Modal */}
      <BreathingModal
        visible={isBreathingModalOpen}
        onClose={() => setIsBreathingModalOpen(false)}
        onCompleted={loadData}
      />

      {/* 60s Push-up Challenge Modal */}
      <PushupModal
        visible={isPushupModalOpen}
        onClose={() => setIsPushupModalOpen(false)}
        onCompleted={loadData}
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
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
  breathingBanner: {
    backgroundColor: '#E4F0E9',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C7E1D2',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  breathingIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingTextBox: {
    flex: 1,
  },
  breathingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B4332',
  },
  breathingDesc: {
    fontSize: 12,
    color: '#2D6A4F',
    marginTop: 2,
    lineHeight: 16,
  },
  breathingBtn: {
    backgroundColor: '#2D6A4F',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  breathingBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16231E',
  },
  counterPill: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D6A4F',
    backgroundColor: '#E4F0E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  allDoneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E4F0E9',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#C7E1D2',
  },
  allDoneText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1B4332',
    flex: 1,
    lineHeight: 18,
  },
  prayersList: {
    gap: 10,
  },
  prayerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3E8DF',
    shadowColor: '#16231E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  prayerCardDone: {
    backgroundColor: '#F8FBF9',
    borderColor: '#C7E1D2',
  },
  prayerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  prayerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF1E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prayerIconBoxDone: {
    backgroundColor: '#E4F0E9',
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16231E',
  },
  prayerNameDone: {
    color: '#1B4332',
  },
  prayerTimeLabel: {
    fontSize: 12,
    color: '#758C81',
    marginTop: 2,
  },
  prayerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thumbnailWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  proofThumbnail: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#E4F0E9',
  },
  viewPhotoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E4F0E9',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7E1D2',
  },
  viewPhotoText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2D6A4F',
  },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E4F0E9',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  doneText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2D6A4F',
  },
  uploadCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2D6A4F',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: '#2D6A4F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadCtaText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  azkarList: {
    marginTop: 4,
  },
});
