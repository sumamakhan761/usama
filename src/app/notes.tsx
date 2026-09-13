import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  createAudioPlayer,
  useAudioRecorder,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  AudioPlayer,
} from 'expo-audio';
import {
  Mic,
  Square,
  Send,
  Play,
  Pause,
  Volume2,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { supabase } from '../utils/supabase';
import { localStore } from '../utils/localStore';
import { uploadAudioToSupabase } from '../utils/storage';

interface NoteItem {
  id: string;
  note_type: 'text' | 'voice';
  content?: string;
  audio_url?: string;
  created_at: string;
}

export default function NotesScreen() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSavingText, setIsSavingText] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Audio Recording with expo-audio
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const recordingTimer = useRef<any>(null);

  // Audio Playback with expo-audio
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);

  const fetchNotes = useCallback(async () => {
    // 1. FAST LOCAL LOAD
    const cached = await localStore.getNotes();
    if (cached && cached.length > 0) {
      setNotes(cached);
      setIsLoadingNotes(false);
    }

    // 2. SUPABASE NETWORK SYNC
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNotes(data);
        await localStore.setNotes(data);
      }
    } catch (e) {
      console.warn('Error fetching notes:', e);
    } finally {
      setIsLoadingNotes(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.pause();
          playerRef.current.release();
        } catch (e) {}
      }
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, [fetchNotes]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotes();
    setRefreshing(false);
  };

  // 1. Add Text Note (Permanent, stored in Supabase & local cache)
  const handleAddTextNote = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    setIsSavingText(true);
    const tempId = 'temp-' + Date.now();
    const tempItem: NoteItem = {
      id: tempId,
      note_type: 'text',
      content: trimmed,
      created_at: new Date().toISOString(),
    };

    const updated = [tempItem, ...notes];
    setNotes(updated);
    await localStore.setNotes(updated);
    setInputText('');

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            note_type: 'text',
            content: trimmed,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        const finalized = updated.map((n) => (n.id === tempId ? data : n));
        setNotes(finalized);
        await localStore.setNotes(finalized);
      }
    } catch (e: any) {
      console.warn('Error saving text note to DB:', e);
    } finally {
      setIsSavingText(false);
    }
  };

  // 2. Start Voice Recording using expo-audio (No haptics)
  const startRecording = async () => {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission needed', 'Microphone permission is required to record voice notes.');
        return;
      }

      audioRecorder.record();
      setIsRecording(true);
      setRecordDuration(0);

      recordingTimer.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Failed to start recording:', err);
      Alert.alert('Error', 'Could not access microphone.');
    }
  };

  // 3. Stop Voice Recording & Upload (No haptics)
  const stopRecordingAndSave = async () => {
    clearInterval(recordingTimer.current);
    setIsRecording(false);

    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      if (!uri) return;

      // Upload audio to Supabase Storage bucket 'voice-notes'
      const publicUrl = await uploadAudioToSupabase(uri, 'voice-notes');

      // Save to Supabase notes table
      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            note_type: 'voice',
            audio_url: publicUrl,
            content: `Voice Memo (${Math.floor(recordDuration / 60)}:${(recordDuration % 60)
              .toString()
              .padStart(2, '0')})`,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        const updated = [data, ...notes];
        setNotes(updated);
        await localStore.setNotes(updated);
      }
    } catch (err) {
      console.warn('Failed to save voice recording:', err);
    }
  };

  // 4. Play/Pause Voice Note
  const togglePlayAudio = (note: NoteItem) => {
    if (!note.audio_url) return;

    try {
      if (playingNoteId === note.id && playerRef.current) {
        playerRef.current.pause();
        playerRef.current.release();
        playerRef.current = null;
        setPlayingNoteId(null);
        return;
      }

      if (playerRef.current) {
        try {
          playerRef.current.pause();
          playerRef.current.release();
        } catch (e) {}
        playerRef.current = null;
      }

      const player = createAudioPlayer(note.audio_url);
      playerRef.current = player;
      setPlayingNoteId(note.id);
      player.play();
    } catch (e) {
      console.warn('Audio playback error:', e);
      setPlayingNoteId(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } catch {
      return '';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.badgeRow}>
            <Sparkles size={14} color="#2D6A4F" />
            <Text style={styles.badgeText}>OSAMA • SAFE UNBURDENING</Text>
          </View>
          <Text style={styles.title}>Mental Notes & Voice</Text>
          <Text style={styles.subtitle}>
            Pour your thoughts out. Nothing is deleted — your journey is permanently preserved.
          </Text>
        </View>
      </View>

      {/* Input Section (Thumb Zone) */}
      <View style={styles.inputCard}>
        {!isRecording ? (
          <View style={styles.textInputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="What is on your mind? Write freely..."
              placeholderTextColor="#758C81"
              multiline
              value={inputText}
              onChangeText={setInputText}
              maxLength={1000}
            />
            <View style={styles.inputActionButtons}>
              {/* Mic Record Button */}
              <TouchableOpacity
                style={styles.micBtn}
                onPress={startRecording}
                activeOpacity={0.7}
              >
                <Mic size={20} color="#2D6A4F" />
              </TouchableOpacity>

              {/* Submit Text Note */}
              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  !inputText.trim() && styles.sendBtnDisabled,
                ]}
                onPress={handleAddTextNote}
                disabled={!inputText.trim() || isSavingText}
                activeOpacity={0.8}
              >
                {isSavingText ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Send size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Active Recording State */
          <View style={styles.recordingRow}>
            <View style={styles.recordingIndicator}>
              <View style={styles.redPulseDot} />
              <Text style={styles.recordingText}>
                Recording Voice Note... {formatTime(recordDuration)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.stopRecordingBtn}
              onPress={stopRecordingAndSave}
              activeOpacity={0.8}
            >
              <Square size={16} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.stopRecordingText}>Save Memo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Notes Stream */}
      {isLoadingNotes ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2D6A4F" />
        </View>
      ) : notes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FileText size={48} color="#C5DFD0" />
          <Text style={styles.emptyTitle}>Your space is quiet and ready</Text>
          <Text style={styles.emptySubtitle}>
            Write a quick thought or speak your heart using the microphone above.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2D6A4F" />
          }
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isPlayingThis = playingNoteId === item.id;
            return (
              <View style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <View style={styles.typeBadge}>
                    {item.note_type === 'voice' ? (
                      <Volume2 size={13} color="#2D6A4F" />
                    ) : (
                      <FileText size={13} color="#2D6A4F" />
                    )}
                    <Text style={styles.typeBadgeText}>
                      {item.note_type === 'voice' ? 'VOICE MEMO' : 'THOUGHT'}
                    </Text>
                  </View>

                  <View style={styles.dateBadge}>
                    <Clock size={12} color="#758C81" />
                    <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
                  </View>
                </View>

                {item.note_type === 'text' ? (
                  <Text style={styles.noteBodyText}>{item.content}</Text>
                ) : (
                  /* Voice Memo Audio Card */
                  <View style={styles.voiceCardContent}>
                    <TouchableOpacity
                      style={[
                        styles.audioPlayBtn,
                        isPlayingThis && styles.audioPlayingBtn,
                      ]}
                      onPress={() => togglePlayAudio(item)}
                      activeOpacity={0.8}
                    >
                      {isPlayingThis ? (
                        <Pause size={18} color="#FFFFFF" />
                      ) : (
                        <Play size={18} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                    <View style={styles.voiceDetails}>
                      <Text style={styles.voiceTitle}>
                        {item.content || 'Voice Recording'}
                      </Text>
                      <Text style={styles.voiceSub}>
                        {isPlayingThis ? 'Playing...' : 'Tap to listen'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          }}
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
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E3E8DF',
    shadowColor: '#16231E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  textInputRow: {
    gap: 12,
  },
  textInput: {
    fontSize: 15,
    color: '#16231E',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  inputActionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#EFF1E9',
    paddingTop: 10,
  },
  micBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E4F0E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#C7E1D2',
  },
  recordingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  redPulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DC2626',
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16231E',
  },
  stopRecordingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2D6A4F',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  stopRecordingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  noteCard: {
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
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F2F7F4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2D6A4F',
    letterSpacing: 0.5,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#758C81',
  },
  noteBodyText: {
    fontSize: 15,
    color: '#16231E',
    lineHeight: 22,
  },
  voiceCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8F9F5',
    padding: 12,
    borderRadius: 14,
  },
  audioPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioPlayingBtn: {
    backgroundColor: '#245942',
  },
  voiceDetails: {
    flex: 1,
  },
  voiceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16231E',
  },
  voiceSub: {
    fontSize: 12,
    color: '#758C81',
    marginTop: 2,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16231E',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#758C81',
    textAlign: 'center',
    lineHeight: 18,
  },
});
