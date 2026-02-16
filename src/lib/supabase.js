import { createClient } from "@supabase/supabase-js";

/**
 * Supabase: usa ESCLUSIVAMENTE import.meta.env (Vite).
 * Su Vercel: imposta VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY in Environment Variables.
 * Il prefisso VITE_ è obbligatorio per esporre le variabili al client.
 */
const rawUrl = (import.meta.env.VITE_SUPABASE_URL ?? "").toString().trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").toString().trim();
const url = rawUrl && (rawUrl.startsWith("https://") || rawUrl.includes("supabase")) ? rawUrl : "";
const anonKey = rawKey && rawKey.length >= 10 ? rawKey : "";

export const supabase =
  url && anonKey ? createClient(url, anonKey) : null;

/** Per debug: stato delle variabili env (senza esporre valori sensibili) */
export const getSupabaseEnvDebug = () => ({
  hasUrl: !!rawUrl,
  hasKey: !!rawKey,
  urlLength: rawUrl?.length ?? 0,
  keyLength: rawKey?.length ?? 0,
});

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
