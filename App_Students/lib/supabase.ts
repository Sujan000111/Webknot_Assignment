import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string | undefined;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string | undefined;

let client: SupabaseClient | null = null;

// Check if the URL is valid and not a placeholder
const isValidUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' && !url.includes('placeholder');
  } catch {
    return false;
  }
};

if (supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl) && supabaseAnonKey !== 'placeholder-key') {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn('Failed to create Supabase client:', error);
  }
} else {
  console.warn(
    'Supabase configuration is missing or invalid. Please add valid supabaseUrl and supabaseAnonKey to app.json extra config.'
  );
}

export const supabase = client;
export const isSupabaseReady = Boolean(client);
