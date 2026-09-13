import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  StyleSheet,
} from 'react-native';
import { X, Flame, Trophy, ChevronDown, ChevronUp, Dumbbell, CheckCircle2 } from 'lucide-react-native';
import Svg, { Path, Circle, Rect, Line, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { supabase } from '../utils/supabase';
import { localStore } from '../utils/localStore';

interface PushupModalProps {
  visible: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

export default function PushupModal({ visible, onClose, onCompleted }: PushupModalProps) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [repCount, setRepCount] = useState(0);
  const [phase, setPhase] = useState<'down' | 'up'>('down');
  const [isFinished, setIsFinished] = useState(false);

  // animValue: 1.0 = Fully Up (Lockout), 0.0 = Lowered Down (Chest to Floor)
  const animValue = useRef(new Animated.Value(1.0)).current;
  const timerRef = useRef<any>(null);

  const getTodayISO = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (visible) {
      setTimeLeft(60);
      setRepCount(0);
      setIsFinished(false);
      setPhase('down');
      animValue.setValue(1.0);

      // 60-second workout countdown timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishWorkout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start push-up rep cadence loop (3s per rep: 1.5s lower, 1.5s press)
      startPushupLoop();
    } else {
      clearInterval(timerRef.current);
      animValue.stopAnimation();
    }

    return () => {
      clearInterval(timerRef.current);
    };
  }, [visible]);

  const finishWorkout = async () => {
    setIsFinished(true);
    const today = getTodayISO();

    // 1. Save locally immediately
    await localStore.setPushupsDone(today, true);

    // 2. Sync with Supabase
    try {
      await supabase.from('daily_pushups').upsert(
        {
          date: today,
          completed: true,
          duration_seconds: 60,
        },
        { onConflict: 'date' }
      );
    } catch (e) {
      console.warn('Error recording pushups in Supabase:', e);
    }

    if (onCompleted) onCompleted();
  };

  const startPushupLoop = () => {
    // 1. Lower down (1.5 seconds) - Breathe in
    setPhase('down');
    Animated.timing(animValue, {
      toValue: 0.0,
      duration: 1500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;

      // 2. Push up (1.5 seconds) - Breathe out
      setPhase('up');
      Animated.timing(animValue, {
        toValue: 1.0,
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(({ finished: upFinished }) => {
        if (!upFinished) return;

        setRepCount((r) => r + 1);
        startPushupLoop();
      });
    });
  };

  // Interpolations for the athlete doing push-ups
  // Torso / chest lowers down towards the mat by 36 pixels
  const torsoTranslateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [32, 0],
  });

  // Torso tilts slightly around the feet pivot
  const torsoRotate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['-3deg', '-14deg'],
  });

  // Arm down flexion vs Up extension crossfade
  const armDownOpacity = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.4, 0],
  });

  const armUpOpacity = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.4, 1],
  });

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.flameCircle}>
              <Flame size={20} color="#D97706" />
            </View>
            <View>
              <Text style={styles.headerTitle}>60s Push-up Challenge</Text>
              <Text style={styles.headerSubtitle}>Follow the athlete cadence & form</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={20} color="#4D6257" />
          </TouchableOpacity>
        </View>

        {!isFinished ? (
          <View style={styles.content}>
            {/* Top Stats Cards */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{timeLeft}s</Text>
                <Text style={styles.statLabel}>Time Remaining</Text>
              </View>
              <View style={[styles.statBox, { borderColor: '#FDE68A', backgroundColor: '#FFFDF7' }]}>
                <Text style={[styles.statNumber, { color: '#D97706' }]}>{repCount}</Text>
                <Text style={styles.statLabel}>Completed Reps</Text>
              </View>
            </View>

            {/* Visual Athlete Animation Arena */}
            <View style={styles.athleteArena}>
              {/* Floor Mat & Environment SVG */}
              <View style={styles.svgFloorContainer}>
                <Svg width="320" height="200" viewBox="0 0 320 200">
                  <Defs>
                    <LinearGradient id="matGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <Stop offset="0%" stopColor="#2D6A4F" stopOpacity="0.25" />
                      <Stop offset="50%" stopColor="#2D6A4F" stopOpacity="0.35" />
                      <Stop offset="100%" stopColor="#2D6A4F" stopOpacity="0.25" />
                    </LinearGradient>
                  </Defs>

                  {/* Workout Mat */}
                  <Rect x="20" y="152" width="280" height="10" rx="5" fill="url(#matGrad)" stroke="#B7DEC6" strokeWidth="1.5" />
                  
                  {/* Palm & Feet Target Pads */}
                  <Rect x="74" y="148" width="22" height="6" rx="3" fill="#2D6A4F" opacity="0.6" />
                  <Rect x="236" y="148" width="22" height="6" rx="3" fill="#2D6A4F" opacity="0.6" />

                  {/* Floor Reference Line */}
                  <Line x1="10" y1="162" x2="310" y2="162" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="6 4" />
                </Svg>
              </View>

              {/* Dynamic Athlete Body & Movement */}
              <View style={styles.athleteCharacterContainer}>
                {/* UP Position Illustration (Lockout) */}
                <Animated.View style={[styles.svgOverlay, { opacity: armUpOpacity }]}>
                  <Svg width="320" height="190" viewBox="0 0 320 190">
                    {/* Athlete Head */}
                    <Circle cx="64" cy="74" r="14" fill="#E07A5F" />
                    {/* Head Hair */}
                    <Path d="M 52 72 Q 62 60 76 68 Z" fill="#292524" />

                    {/* Torso & Straight Spine (Extended in plank) */}
                    <Path
                      d="M 64 86 L 152 106 L 244 148"
                      stroke="#2D6A4F"
                      strokeWidth="18"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />

                    {/* Extended Straight Arms to Palm Pad */}
                    <Line x1="84" y1="92" x2="84" y2="148" stroke="#E07A5F" strokeWidth="12" strokeLinecap="round" />

                    {/* Feet planted on mat */}
                    <Circle cx="246" cy="148" r="6" fill="#1C1917" />
                  </Svg>
                </Animated.View>

                {/* DOWN Position Illustration (Chest to Floor) */}
                <Animated.View style={[styles.svgOverlay, { opacity: armDownOpacity }]}>
                  <Svg width="320" height="190" viewBox="0 0 320 190">
                    {/* Athlete Head Lowered */}
                    <Circle cx="64" cy="122" r="14" fill="#E07A5F" />
                    <Path d="M 52 120 Q 62 108 76 116 Z" fill="#292524" />

                    {/* Torso Flat near the Mat */}
                    <Path
                      d="M 64 132 L 152 138 L 244 148"
                      stroke="#D97706"
                      strokeWidth="18"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />

                    {/* Bent Elbows Flaring Back (Classic proper 90 degree pushup form) */}
                    <Path
                      d="M 82 130 L 110 114 L 84 148"
                      stroke="#E07A5F"
                      strokeWidth="11"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />

                    {/* Feet firmly anchored */}
                    <Circle cx="246" cy="148" r="6" fill="#1C1917" />
                  </Svg>
                </Animated.View>
              </View>

              {/* Dynamic Phase Feedback Banner */}
              <View style={[styles.phaseBanner, phase === 'down' ? styles.phaseBannerDown : styles.phaseBannerUp]}>
                {phase === 'down' ? (
                  <>
                    <ChevronDown size={20} color="#D97706" strokeWidth={3} />
                    <View>
                      <Text style={[styles.phaseBannerTitle, { color: '#B45309' }]}>LOWER DOWN (Inhale)</Text>
                      <Text style={styles.phaseBannerSub}>Chest smoothly down to mat</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <ChevronUp size={20} color="#2D6A4F" strokeWidth={3} />
                    <View>
                      <Text style={[styles.phaseBannerTitle, { color: '#2D6A4F' }]}>PUSH UP! (Exhale)</Text>
                      <Text style={styles.phaseBannerSub}>Press up through your palms</Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Proper Form Checklist */}
            <View style={styles.formCard}>
              <View style={styles.formHeaderRow}>
                <Dumbbell size={16} color="#2D6A4F" />
                <Text style={styles.formCardHeader}>PROPER FORM GUIDELINES</Text>
              </View>
              <View style={styles.checklistRow}>
                <View style={styles.checkItem}>
                  <CheckCircle2 size={13} color="#2D6A4F" />
                  <Text style={styles.checkText}>Flat Spine</Text>
                </View>
                <View style={styles.checkItem}>
                  <CheckCircle2 size={13} color="#2D6A4F" />
                  <Text style={styles.checkText}>Core Tight</Text>
                </View>
                <View style={styles.checkItem}>
                  <CheckCircle2 size={13} color="#2D6A4F" />
                  <Text style={styles.checkText}>Full Lockout</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          /* Celebratory Finish Screen */
          <View style={styles.finishedContainer}>
            <View style={styles.trophyCircle}>
              <Trophy size={60} color="#D97706" />
            </View>
            <Text style={styles.finishedTitle}>Challenge Completed!</Text>
            <Text style={styles.finishedRepsBadge}>You finished {repCount} Push-ups in 60s! 🔥</Text>
            <Text style={styles.finishedSubtitle}>
              Your physical discipline fuels your daily strength, energy, and inner peace.
            </Text>
            <TouchableOpacity style={styles.completeBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.completeBtnText}>Save Workout & Return</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F4',
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECE5',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flameCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16231E',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#758C81',
    marginTop: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAEFE9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
    justifyContent: 'center',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3E8DF',
    shadowColor: '#16231E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  statNumber: {
    fontSize: 34,
    fontWeight: '900',
    color: '#2D6A4F',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 12,
    color: '#758C81',
    fontWeight: '600',
    marginTop: 2,
  },
  athleteArena: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3E8DF',
    shadowColor: '#16231E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  svgFloorContainer: {
    width: 320,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
  },
  athleteCharacterContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgOverlay: {
    position: 'absolute',
    width: 320,
    height: 190,
  },
  phaseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    marginTop: 8,
    width: '90%',
  },
  phaseBannerDown: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  phaseBannerUp: {
    backgroundColor: '#E4F0E9',
    borderWidth: 1,
    borderColor: '#C7E1D2',
  },
  phaseBannerTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  phaseBannerSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  formCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E3E8DF',
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  formCardHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2D6A4F',
    letterSpacing: 0.5,
  },
  checklistRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkText: {
    fontSize: 12,
    color: '#52665D',
    fontWeight: '600',
  },
  finishedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 14,
  },
  trophyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  finishedTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#16231E',
    textAlign: 'center',
  },
  finishedRepsBadge: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D97706',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  finishedSubtitle: {
    fontSize: 14,
    color: '#4D6257',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  completeBtn: {
    backgroundColor: '#2D6A4F',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 12,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  completeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
