import { supabase } from './supabase';
import { Platform } from 'react-native';

/**
 * Helper to convert a Blob to an ArrayBuffer safely across React Native Hermes & Web
 */
function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as ArrayBuffer);
    };
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Upload an image (file URI or base64) to Supabase Storage bucket
 */
export async function uploadImageToSupabase(
  uri: string,
  bucketName: string = 'namaz-proofs'
): Promise<string> {
  try {
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const filePath = `photos/${filename}`;

    const response = await fetch(uri);
    const blob = await response.blob();

    if (Platform.OS === 'web') {
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      return publicUrlData.publicUrl;
    } else {
      const arrayBuffer = await blobToArrayBuffer(blob);

      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      return publicUrlData.publicUrl;
    }
  } catch (err: any) {
    console.warn('Supabase storage upload fallback to local URI:', err?.message || err);
    // Return local URI so user experience is uninterrupted
    return uri;
  }
}

/**
 * Upload an audio recording to Supabase Storage bucket
 */
export async function uploadAudioToSupabase(
  uri: string,
  bucketName: string = 'voice-notes'
): Promise<string> {
  try {
    const filename = `${Date.now()}_voice.m4a`;
    const filePath = `memos/${filename}`;

    const response = await fetch(uri);
    const blob = await response.blob();

    if (Platform.OS === 'web') {
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, blob, {
          contentType: 'audio/m4a',
          upsert: true,
        });

      if (error) throw error;
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      return publicUrlData.publicUrl;
    } else {
      const arrayBuffer = await blobToArrayBuffer(blob);

      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, arrayBuffer, {
          contentType: 'audio/m4a',
          upsert: true,
        });

      if (error) throw error;
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      return publicUrlData.publicUrl;
    }
  } catch (err: any) {
    console.warn('Supabase audio storage upload fallback to local URI:', err?.message || err);
    return uri;
  }
}
