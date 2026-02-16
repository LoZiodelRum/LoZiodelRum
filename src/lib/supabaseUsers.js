/**
 * Sync registrazioni utenti su Supabase (app_users)
 * Esegui la migration 20250215000000_auth_and_registrations.sql prima di usare
 */
import { supabase, isSupabaseConfigured, getSupabaseEnvDebug } from "./supabase";

/** Converte undefined in null per evitare errori Supabase */
function sanitize(val) {
  return val === undefined ? null : val;
}

export async function insertAppUser(userData) {
  if (!isSupabaseConfigured() || !supabase) {
    const debug = getSupabaseEnvDebug?.() || {};
    throw new Error(`Supabase non configurato. Verifica VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY in .env. Debug: ${JSON.stringify(debug)}`);
  }
  const row = {
    name: String(userData.name || ""),
    email: sanitize(userData.email) || null,
    role: userData.role || "user",
    role_label: userData.roleLabel || userData.role || userData.role,
    status: userData.role === "admin" ? "approved" : "pending",
    ...(userData.role === "proprietario" && {
      email: sanitize(userData.email) || null,
      venue_ids: Array.isArray(userData.venue_ids) && userData.venue_ids.length > 0
        ? userData.venue_ids.filter((id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id)))
        : null,
      image_url: sanitize(userData.image_url) || null,
    }),
    ...(userData.role === "bartender" && {
      surname: sanitize(userData.surname) ?? "",
      photo: sanitize(userData.photo) ?? "",
      venue_id: userData.venue_id || null,
      custom_venue_name: sanitize(userData.custom_venue_name || userData.venue_name) || null,
      city: sanitize(userData.city) ?? "",
      specialization: sanitize(userData.specialization) ?? "",
      years_experience: userData.years_experience != null ? String(userData.years_experience) : null,
      philosophy: sanitize(userData.philosophy) ?? "",
      distillati_preferiti: sanitize(userData.distillati_preferiti) ?? "",
      approccio_degustazione: sanitize(userData.approccio_degustazione) ?? "",
      consiglio_inizio: sanitize(userData.consiglio_inizio) ?? "",
      signature_drinks: sanitize(userData.signature_drinks) ?? "",
      percorso_esperienze: sanitize(userData.percorso_esperienze) ?? "",
      bio: sanitize(userData.bio) ?? "",
      motivation: sanitize(userData.motivation) ?? "",
      consent_linee_editoriali: !!userData.consent_linee_editoriali,
    }),
    ...(userData.role === "user" && {
      bio_light: sanitize(userData.bio_light) || null,
      home_city: sanitize(userData.home_city) || null,
      image_url: sanitize(userData.image_url) || null,
    }),
  };
  const { data, error } = await supabase.from("app_users").insert(row).select().single();
  if (error) {
    console.error("[Supabase] insert app_user - errore completo:", { error, code: error.code, details: error.details, hint: error.hint });
    const err = new Error(error.message || "Errore salvataggio su Supabase");
    err.originalError = error;
    throw err;
  }
  return data;
}

export async function getPendingRegistrations() {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("app_users")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Supabase get pending registrations:", error);
    return [];
  }
  return data || [];
}

export async function updateAppUserStatus(id, status) {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase.from("app_users").update({ status }).eq("id", id);
  return !error;
}

export async function updateAppUser(id, data) {
  if (!isSupabaseConfigured() || !supabase) {
    const debug = getSupabaseEnvDebug?.() || {};
    throw new Error(`Supabase non configurato. Verifica VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY. Debug: ${JSON.stringify(debug)}`);
  }
  const { data: updated, error } = await supabase.from("app_users").update(data).eq("id", id).select().single();
  if (error) {
    console.error("[Supabase] update app_user - errore completo:", { error, code: error.code, details: error.details, hint: error.hint });
    const err = new Error(error.message || "Errore aggiornamento su Supabase");
    err.originalError = error;
    throw err;
  }
  return updated;
}
