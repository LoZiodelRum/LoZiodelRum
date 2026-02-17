/**
 * Reload dello schema cache PostgREST.
 * Utile quando si riceve "Could not find column" dopo aver aggiunto nuove colonne.
 * Esegue NOTIFY pgrst, 'reload schema' tramite funzione RPC.
 */
import { supabase, isSupabaseConfigured } from "./supabase";

export async function reloadPgrstSchema() {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.rpc("reload_pgrst_schema");
  } catch (err) {
    console.warn("[supabaseSchemaReload] Funzione reload_pgrst_schema non disponibile:", err?.message);
  }
}
