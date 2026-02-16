import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (supabaseAnonKey) {
  console.log("[DEBUG] Key primi 5 caratteri:", supabaseAnonKey.slice(0, 5));
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => !!(supabaseUrl && supabaseAnonKey);
