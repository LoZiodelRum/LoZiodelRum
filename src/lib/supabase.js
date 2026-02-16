import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: verifica formato chiave (senza esporre il contenuto)
if (typeof window !== "undefined") {
  console.log("Chiave rilevata:", supabaseAnonKey?.substring(0, 10) + "...");
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ATTENZIONE: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY mancanti");
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

export const isSupabaseConfigured = () => !!supabase;
