import AsyncStorage from '@react-native-async-storage/async-storage';

export const localStore = {
  // Gutka count
  async getGutkaCount(date: string): Promise<number> {
    try {
      const val = await AsyncStorage.getItem(`@gutka_${date}`);
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  },
  async setGutkaCount(date: string, count: number): Promise<void> {
    try {
      await AsyncStorage.setItem(`@gutka_${date}`, String(count));
    } catch { }
  },

  // Medicine status
  async getMedicineDone(date: string): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(`@medicine_${date}`);
      return val === 'true';
    } catch {
      return false;
    }
  },
  async setMedicineDone(date: string, done: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(`@medicine_${date}`, done ? 'true' : 'false');
    } catch { }
  },

  // Pushups status
  async getPushupsDone(date: string): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(`@pushups_${date}`);
      return val === 'true';
    } catch {
      return false;
    }
  },
  async setPushupsDone(date: string, done: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(`@pushups_${date}`, done ? 'true' : 'false');
    } catch { }
  },

  // Breathing status
  async getBreathingDone(date: string): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(`@breathing_${date}`);
      return val === 'true';
    } catch {
      return false;
    }
  },
  async setBreathingDone(date: string, done: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(`@breathing_${date}`, done ? 'true' : 'false');
    } catch { }
  },

  // Mood status
  async getTodayMood(date: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(`@mood_${date}`);
    } catch {
      return null;
    }
  },
  async setTodayMood(date: string, mood: string): Promise<void> {
    try {
      await AsyncStorage.setItem(`@mood_${date}`, mood);
    } catch { }
  },

  // Prayer status map
  async getPrayers(date: string): Promise<Record<string, { isDone: boolean; photoUrl?: string; completedAt?: string }> | null> {
    try {
      const raw = await AsyncStorage.getItem(`@prayers_${date}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  async setPrayers(date: string, data: Record<string, { isDone: boolean; photoUrl?: string; completedAt?: string }>): Promise<void> {
    try {
      await AsyncStorage.setItem(`@prayers_${date}`, JSON.stringify(data));
    } catch { }
  },

  // Trackers map
  async getTrackers(date: string): Promise<any[] | null> {
    try {
      const raw = await AsyncStorage.getItem(`@trackers_${date}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  async setTrackers(date: string, data: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(`@trackers_${date}`, JSON.stringify(data));
    } catch { }
  },

  // Notes list
  async getNotes(): Promise<any[] | null> {
    try {
      const raw = await AsyncStorage.getItem('@notes_cache');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  async setNotes(data: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem('@notes_cache', JSON.stringify(data));
    } catch { }
  },
};
