import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "../config/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || supabaseConfig.url;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || supabaseConfig.anonKey;

let client: SupabaseClient | null = null;
if (supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase env vars are not set. Define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file and restart the dev server."
  );
}

export const supabase = client;
export const isSupabaseReady = Boolean(client);


