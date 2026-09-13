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
import { X, CheckCircle2, Wind, Sparkles } from 'lucide-react-native';
import { supabase } from '../utils/supabase';
import { localStore } from '../utils/localStore';

interface BreathingModalProps {
  visible: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

type BreathPhase = 'prepare' | 'inhale' | 'hold' | 'exhale';

export default function BreathingModal({ visible, onClose, onCompleted }: BreathingModalProps) {
  const [phase, setPhase] = useState<BreathPhase>('prepare');
  const [timeLeft, setTimeLeft] = useState(60);
  const [cycles, setCycles] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;
  const timerRef = useRef<any>(null);
  const cycleTimerRef = useRef<any>(null);

  const getTodayISO = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (visible) {
      setTimeLeft(60);
      setCycles(0);
      setIsFinished(false);
      setPhase('prepare');

      // Start 60-second countdown
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start breathing cycles (Inhale 4s -> Hold 2s -> Exhale 4s)
      startBreathLoop();
    } else {
      clearInterval(timerRef.current);
      clearTimeout(cycleTimerRef.current);
      scaleAnim.stopAnimation();
    }

    return () => {
      clearInterval(timerRef.current);
      clearTimeout(cycleTimerRef.current);
    };
  }, [visible]);

  const finishSession = async () => {
    setIsFinished(true);
    const today = getTodayISO();

    // 1. Save locally immediately
    await localStore.setBreathingDone(today, true);

    // 2. Sync with Supabase
    try {
      await supabase.from('breathing_sessions').insert([
        {
          date: today,
          duration_seconds: 60,
          completed: true,
        },
      ]);
    } catch (e) {
      console.warn('Error recording breathing session in Supabase:', e);
    }
    if (onCompleted) onCompleted();
  };

  const startBreathLoop = () => {
    // Phase 1: Inhale (4s) - Silent, no beeping!
    setPhase('inhale');
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1.6,
        duration: 4000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 4000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Phase 2: Hold (2s)
      setPhase('hold');
      cycleTimerRef.current = setTimeout(() => {
        // Phase 3: Exhale (4s)
        setPhase('exhale');
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.0,
            duration: 4000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.4,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setCycles((c) => c + 1);
          if (timeLeft > 10 && !isFinished) {
            startBreathLoop();
          }
        });
      }, 2000);
    });
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In Slowly...';
      case 'hold':
        return 'Hold Gently...';
      case 'exhale':
        return 'Release & Let Go...';
      default:
        return 'Get comfortable and relax...';
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Wind size={22} color="#2D6A4F" />
            <Text style={styles.headerTitle}>Inhale & Exhale</Text>
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
            {/* Top Indicator */}
            <View style={styles.timerContainer}>
              <Text style={styles.timeNumber}>{timeLeft}s</Text>
              <Text style={styles.cycleText}>{cycles} / 10 deep breaths completed</Text>
            </View>

            {/* Pulsing Breathing Circle */}
            <View style={styles.animationArea}>
              <Animated.View
                style={[
                  styles.outerCircle,
                  {
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                  },
                ]}
              />
              <Animated.View style={styles.middleCircle} />
              <View style={styles.innerCore}>
                <Text style={styles.instructionText}>{getPhaseInstruction()}</Text>
              </View>
            </View>

            {/* Bottom Supportive Text */}
            <View style={styles.footerNote}>
              <Text style={styles.footerText}>
                Allow your shoulders to drop. Let every thought drift away with each exhale.
              </Text>
            </View>
          </View>
        ) : (
          /* Finished Screen */
          <View style={styles.finishedContainer}>
            <View style={styles.congratsCircle}>
              <CheckCircle2 size={68} color="#2D6A4F" />
            </View>
            <Text style={styles.finishedTitle}>Congratulations! You Did It!</Text>
            <Text style={styles.finishedSubtitle}>
              Masha'Allah, you completed your 60-second breathing session! You gave your mind and body complete peace today.
            </Text>
            <TouchableOpacity style={styles.completeBtn} onPress={onClose}>
              <Text style={styles.completeBtnText}>Return to Dashboard</Text>
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
    paddingVertical: 32,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timeNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#2D6A4F',
    fontVariant: ['tabular-nums'],
  },
  cycleText: {
    fontSize: 15,
    color: '#4D6257',
    marginTop: 4,
    fontWeight: '500',
  },
  animationArea: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerCircle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#C7E1D2',
  },
  middleCircle: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#E4F0E9',
  },
  innerCore: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#16231E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  instructionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B4332',
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
  congratsCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E4F0E9',
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
