import { AudioPlayer, createAudioPlayer } from 'expo-audio';
import { ExternalLink, Pause, Play, Sparkles, Volume2 } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AzkarItem } from '../constants/azkar';

interface AzkarPlayerProps {
  item: AzkarItem;
}

export default function AzkarPlayer({ item }: AzkarPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.pause();
          playerRef.current.release();
        } catch (e) { }
      }
    };
  }, []);

  const togglePlayback = async () => {
    try {
      if (!playerRef.current) {
        setIsLoading(true);
        const player = createAudioPlayer(item.audioUrl);
        playerRef.current = player;
        player.play();
        setIsPlaying(true);
        setIsLoading(false);
      } else {
        if (isPlaying) {
          playerRef.current.pause();
          setIsPlaying(false);
        } else {
          playerRef.current.play();
          setIsPlaying(true);
        }
      }
    } catch (e) {
      console.warn('Playback error:', e);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const openSourceLink = async () => {
    if (!item.sourceUrl) return;
    try {
      await Linking.openURL(item.sourceUrl);
    } catch (err) {
      console.warn('Could not open source link:', err);
    }
  };

  return (
    <View style={styles.card}>
      {/* Top Tag Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleBadge}>
          <Sparkles size={14} color="#2D6A4F" />
          <Text style={styles.badgeText}>{item.category.toUpperCase()}</Text>
        </View>
        <View style={styles.timeTag}>
          <Volume2 size={14} color="#52665D" />
          <Text style={styles.timeText}>{item.duration}</Text>
        </View>
      </View>

      {/* Surah Title & Number */}
      <Text style={styles.title}>{item.title}</Text>
      {item.surahNumber && (
        <Text style={styles.surahNumberText}>{item.surahNumber}</Text>
      )}

      {/* Arabic Script */}
      <View style={styles.arabicBox}>
        <Text style={styles.arabicText}>{item.arabic}</Text>
      </View>

      {/* Transliteration */}
      <Text style={styles.transliteration}>{item.transliteration}</Text>

      {/* Translation */}
      <Text style={styles.translation}>"{item.translation}"</Text>

      {/* Action Buttons: Listen to Dhikr & Source Link */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.playButton, isPlaying && styles.playingButton]}
          onPress={togglePlayback}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : isPlaying ? (
            <>
              <Pause size={18} color="#FFFFFF" />
              <Text style={styles.playButtonText}>Pause Audio</Text>
            </>
          ) : (
            <>
              <Play size={18} color="#FFFFFF" />
              <Text style={styles.playButtonText}>Listen Recitation</Text>
            </>
          )}
        </TouchableOpacity>

        {item.sourceUrl && (
          <TouchableOpacity
            style={styles.sourceBtn}
            onPress={openSourceLink}
            activeOpacity={0.7}
          >
            <ExternalLink size={14} color="#2D6A4F" />
            <Text style={styles.sourceBtnText}>Source (Quran.com)</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E3E8DF',
    shadowColor: '#16231E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E4F0E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2D6A4F',
    letterSpacing: 0.5,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#758C81',
    fontWeight: '500',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#16231E',
  },
  surahNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#52665D',
    marginTop: 2,
    marginBottom: 12,
  },
  arabicBox: {
    backgroundColor: '#F8F9F5',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  arabicText: {
    fontSize: 20,
    color: '#1B4332',
    textAlign: 'right',
    lineHeight: 34,
    fontWeight: '600',
  },
  transliteration: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#4D6257',
    marginBottom: 8,
    lineHeight: 18,
  },
  translation: {
    fontSize: 14,
    color: '#25352E',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionsRow: {
    gap: 8,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2D6A4F',
    paddingVertical: 14,
    borderRadius: 14,
  },
  playingButton: {
    backgroundColor: '#245942',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  sourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F2F7F4',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7E1D2',
  },
  sourceBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D6A4F',
  },
});
