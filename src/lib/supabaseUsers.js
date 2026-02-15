/**
 * Sync registrazioni utenti su Supabase (app_users)
 * Esegui la migration 20250215000000_auth_and_registrations.sql prima di usare
 */
import { supabase, isSupabaseConfigured } from "./supabase";

export async function insertAppUser(userData) {
  if (!isSupabaseConfigured()) return null;
  const row = {
    name: userData.name || "",
    email: userData.email || null,
    role: userData.role || "user",
    role_label: userData.roleLabel || userData.role,
    status: userData.role === "admin" ? "approved" : "pending",
    ...(userData.role === "proprietario" && {
      email: userData.email || null,
      venue_ids: Array.isArray(userData.venue_ids) && userData.venue_ids.length > 0
        ? userData.venue_ids.filter((id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id)))
        : null,
    }),
    ...(userData.role === "bartender" && {
      surname: userData.surname,
      photo: userData.photo,
      venue_id: userData.venue_id || null,
      custom_venue_name: userData.custom_venue_name || userData.venue_name || null,
      city: userData.city,
      specialization: userData.specialization,
      years_experience: userData.years_experience,
      philosophy: userData.philosophy,
      distillati_preferiti: userData.distillati_preferiti,
      approccio_degustazione: userData.approccio_degustazione,
      consiglio_inizio: userData.consiglio_inizio,
      signature_drinks: userData.signature_drinks,
      percorso_esperienze: userData.percorso_esperienze,
      bio: userData.bio,
      motivation: userData.motivation,
      consent_linee_editoriali: userData.consent_linee_editoriali,
    }),
    ...(userData.role === "user" && {
      bio_light: userData.bio_light,
      home_city: userData.home_city,
    }),
  };
  const { data, error } = await supabase.from("app_users").insert(row).select().single();
  if (error) {
    console.error("Supabase insert app_user:", error);
    return null;
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
  if (!isSupabaseConfigured()) return null;
  const { data: updated, error } = await supabase.from("app_users").update(data).eq("id", id).select().single();
  if (error) {
    console.error("Supabase update app_user:", error);
    return null;
  }
  return updated;
}
