import { createClient } from "@supabase/supabase-js";

/**
 * Supabase: legge VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY da .env
 * Vite carica automaticamente le variabili dal file .env nella root del progetto.
 * Su Vercel: imposta le stesse variabili in Environment Variables.
 */
const SUPABASE_KEY_STORAGE = "supabase_anon_key";

function getAnonKey() {
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (envKey) return envKey;
  try {
    const stored = localStorage.getItem(SUPABASE_KEY_STORAGE)?.trim();
    return stored || null;
  } catch (_) {
    return null;
  }
}

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = getAnonKey();

export const supabase =
  url && anonKey ? createClient(url, anonKey) : null;

export const isSupabaseConfigured = () => !!supabase;

/** Salva la chiave in localStorage e restituisce true se valida */
export function saveSupabaseKey(key) {
  const k = (key || "").trim();
  if (!k) return false;
  const valid = k.startsWith("eyJ") || k.startsWith("sb_publishable_");
  if (!valid) return false;
  try {
    localStorage.setItem(SUPABASE_KEY_STORAGE, k);
    return true;
  } catch (_) {
    return false;
  }
}

/** Rimuove la chiave salvata (per test) */
export function clearSupabaseKey() {
  try {
    localStorage.removeItem(SUPABASE_KEY_STORAGE);
  } catch (_) {}
}

/** Estrae il project ref dall'URL (es. ptfywgpplpcvjyohnpkv) per link alla dashboard */
export const getSupabaseProjectRef = () => {
  const u = import.meta.env.VITE_SUPABASE_URL || "";
  return u.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1] || null;
};

export const getSupabaseDashboardUrl = () => {
  const ref = getSupabaseProjectRef();
  return ref ? `https://supabase.com/dashboard/project/${ref}/settings/api` : "https://supabase.com/dashboard";
};

/** URL al SQL Editor per creare la tabella venues_cloud */
export const getSupabaseSqlEditorUrl = () => {
  const ref = getSupabaseProjectRef();
  return ref ? `https://supabase.com/dashboard/project/${ref}/sql/new` : "https://supabase.com/dashboard";
};
