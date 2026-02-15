import { createClient } from "@supabase/supabase-js";

/**
 * Supabase: legge VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY da .env
 * Vite carica automaticamente le variabili dal file .env nella root del progetto.
 * Su Vercel: imposta le stesse variabili in Environment Variables.
 */
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const supabase =
  url && anonKey ? createClient(url, anonKey) : null;

export const isSupabaseConfigured = () => !!supabase;

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
