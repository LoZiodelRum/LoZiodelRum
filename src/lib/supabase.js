import { createClient } from "@supabase/supabase-js";

/**
 * Supabase: usa ESCLUSIVAMENTE import.meta.env (Vite).
 * Nessun process.env per evitare errori API Key su Vercel.
 * Variabili richieste: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
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
