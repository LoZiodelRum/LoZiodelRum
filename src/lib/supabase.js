import { createClient } from "@supabase/supabase-js";

function sanitizeEnv(val) {
  if (val == null || typeof val !== "string") return "";
  return val
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/[\r\n\s]+/g, "")
    .trim();
}

const supabaseUrl = sanitizeEnv(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = sanitizeEnv(import.meta.env.VITE_SUPABASE_ANON_KEY);

let supabase = null;
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (err) {
  console.error("[Supabase] Errore inizializzazione:", err?.message);
}

export { supabase };
export const isSupabaseConfigured = () => !!supabase;
