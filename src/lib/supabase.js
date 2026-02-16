import { createClient } from "@supabase/supabase-js";

// Rimuovi spazi e virgolette che causano "Invalid API key"
const rawUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";
const supabaseUrl = String(rawUrl).trim().replace(/^["']|["']$/g, "");
const supabaseAnonKey = String(rawKey).trim().replace(/^["']|["']$/g, "");

if (supabaseAnonKey) {
  console.log("[DEBUG] Key primi 5 caratteri:", supabaseAnonKey.slice(0, 5));
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = () => !!(supabaseUrl && supabaseAnonKey);
