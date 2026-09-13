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
import { X, CheckCircle2, Flame, Trophy } from 'lucide-react-native';
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

  const animValue = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<any>(null);
  const repTimerRef = useRef<any>(null);

  const getTodayISO = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (visible) {
      setTimeLeft(60);
      setRepCount(0);
      setIsFinished(false);
      setPhase('down');

      // 60-second timer
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

      // Start push-up rep rhythm loop (3 seconds per rep: 1.5s down, 1.5s up)
      startPushupLoop();
    } else {
      clearInterval(timerRef.current);
      clearTimeout(repTimerRef.current);
      animValue.stopAnimation();
    }

    return () => {
      clearInterval(timerRef.current);
      clearTimeout(repTimerRef.current);
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
    // Lower body (Down) - 1.5s
    setPhase('down');
    Animated.timing(animValue, {
      toValue: 0.6,
      duration: 1500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      // Push up (Up) - 1.5s
      setPhase('up');
      Animated.timing(animValue, {
        toValue: 1.0,
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setRepCount((r) => r + 1);
        if (timeLeft > 3 && !isFinished) {
          startPushupLoop();
        }
      });
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Flame size={24} color="#D97706" />
            <Text style={styles.headerTitle}>60s Push-up Challenge</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={24} color="#4D6257" />
          </TouchableOpacity>
        </View>

        {!isFinished ? (
          <View style={styles.content}>
            {/* Top Timer & Reps */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{timeLeft}s</Text>
                <Text style={styles.statLabel}>Time Left</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: '#D97706' }]}>{repCount}</Text>
                <Text style={styles.statLabel}>Reps Guide</Text>
              </View>
            </View>

            {/* Visual Workout Guide Animation */}
            <View style={styles.animationArea}>
              <Animated.View
                style={[
                  styles.animatedBar,
                  {
                    transform: [{ scaleY: animValue }],
                  },
                ]}
              />
              <View style={styles.visualRepCircle}>
                <Text style={styles.phaseLabel}>
                  {phase === 'down' ? 'LOWER DOWN' : 'PUSH UP!'}
                </Text>
                <Text style={styles.repHint}>Stay strong & breathe</Text>
              </View>
            </View>

            {/* Motivational Footer */}
            <View style={styles.footerNote}>
              <Text style={styles.footerText}>
                Target: 15 to 20 steady push-ups. Good form over speed. Keep your core tight!
              </Text>
            </View>
          </View>
        ) : (
          /* Celebratory Finish Screen */
          <View style={styles.finishedContainer}>
            <View style={styles.trophyCircle}>
              <Trophy size={60} color="#D97706" />
            </View>
            <Text style={styles.finishedTitle}>Congratulations! You Did It!</Text>
            <Text style={styles.finishedSubtitle}>
              You crushed the 60-second push-up challenge today! Your physical strength fuels your mental resilience.
            </Text>
            <TouchableOpacity style={styles.completeBtn} onPress={onClose}>
              <Text style={styles.completeBtnText}>Save & Return</Text>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#16231E',
  },
  closeBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#E4F0E9',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    width: '100%',
    justifyContent: 'center',
  },
  statBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3E8DF',
    minWidth: 120,
  },
  statNumber: {
    fontSize: 36,
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
  animationArea: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedBar: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FEF3C7',
  },
  visualRepCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 3,
    borderColor: '#D97706',
    shadowColor: '#16231E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  phaseLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: '#D97706',
    textAlign: 'center',
  },
  repHint: {
    fontSize: 12,
    color: '#758C81',
    marginTop: 4,
    textAlign: 'center',
  },
  footerNote: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E3E8DF',
    maxWidth: 360,
  },
  footerText: {
    fontSize: 14,
    color: '#52665D',
    textAlign: 'center',
    lineHeight: 20,
  },
  finishedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  trophyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  finishedTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#16231E',
    textAlign: 'center',
  },
  finishedSubtitle: {
    fontSize: 15,
    color: '#4D6257',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  completeBtn: {
    backgroundColor: '#2D6A4F',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 16,
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
