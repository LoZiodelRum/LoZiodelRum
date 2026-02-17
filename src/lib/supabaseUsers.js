/**
 * Tabella unica app_users: Bartender, Locali, User, Proprietario.
 */
import { supabase, isSupabaseConfigured } from "./supabase";
import { TABLE_APP_USERS, TABLE_LOCALI } from "./supabaseTables";

function sanitize(val) {
  return val === undefined ? null : val;
}

export async function insertAppUser(userData) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase non configurato. Verifica VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
  }
  const row = {
    name: String(userData.name || ""),
    email: sanitize(userData.email) || null,
    role: userData.role || "user",
    role_label: userData.roleLabel || userData.role || userData.role,
    status: userData.role === "admin" ? "approved" : (userData.status ?? "pending"),
    ...(userData.role === "proprietario" && {
      email: sanitize(userData.email) || null,
      venue_ids: Array.isArray(userData.venue_ids) && userData.venue_ids.length > 0
        ? userData.venue_ids.filter((id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id)))
        : null,
      image_url: sanitize(userData.image_url) || null,
    }),
    ...(userData.role === "bartender" && {
      full_name: (sanitize(userData.full_name) ?? String((userData.name || "") + " " + (userData.surname || "")).trim()) || "",
      name: (sanitize(userData.full_name) ?? String((userData.name || "") + " " + (userData.surname || "")).trim()) || "Bartender",
      surname: sanitize(userData.surname) || null,
      image_url: sanitize(userData.image_url) || sanitize(userData.photo) || "",
      video_url: sanitize(userData.video_url) ?? null,
      status: "pending",
      bio: sanitize(userData.bio) ?? "",
      home_city: (sanitize(userData.home_city) ?? sanitize(userData.city)) ?? "",
      city: sanitize(userData.city) ?? null,
      venue_id: userData.venue_id || null,
      custom_venue_name: sanitize(userData.custom_venue_name || userData.venue_name) || null,
      venue_name: sanitize(userData.venue_name) || null,
      specialization: sanitize(userData.specialization) || null,
      years_experience: sanitize(userData.years_experience) || null,
      philosophy: sanitize(userData.philosophy) || null,
      motivation: sanitize(userData.motivation) || null,
      distillati_preferiti: sanitize(userData.distillati_preferiti) || null,
      approccio_degustazione: sanitize(userData.approccio_degustazione) || null,
      consiglio_inizio: sanitize(userData.consiglio_inizio) || null,
      signature_drinks: sanitize(userData.signature_drinks) || null,
      percorso_esperienze: sanitize(userData.percorso_esperienze) || null,
      consent_linee_editoriali: userData.consent_linee_editoriali === true,
    }),
    ...(userData.role === "user" && {
      bio_light: sanitize(userData.bio_light) || null,
      home_city: sanitize(userData.home_city) || null,
      image_url: sanitize(userData.image_url) || null,
    }),
  };
  console.log("Dati inviati a tabella app_users:", row);
  const { data, error } = await supabase.from(TABLE_APP_USERS).insert(row).select().single();
  if (error) {
    console.error("[Supabase] insert app_user - errore completo:", { error, code: error.code, details: error.details, hint: error.hint });
    const err = new Error(error.message || "Errore salvataggio su Supabase");
    err.originalError = error;
    throw err;
  }
  return data;
}

export async function insertLocali(venueData) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase non configurato. Verifica VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
  }
  const row = {
    nome: String(venueData.name || venueData.nome || ""),
    indirizzo: venueData.address || venueData.indirizzo || "",
    descrizione: venueData.description || venueData.descrizione || "",
    categoria: venueData.category || venueData.categoria || "cocktail_bar",
    image_url: venueData.cover_image || venueData.image_url || null,
    telefono: venueData.phone || venueData.telefono || "",
    orari: venueData.opening_hours || venueData.orari || "",
    citta: venueData.city || venueData.citta || "",
    provincia: venueData.province || venueData.provincia || null,
    paese: venueData.country || venueData.paese || "Italia",
    sito: venueData.website || venueData.sito || "",
    instagram: venueData.instagram || "",
    slug: venueData.slug || (venueData.name || venueData.nome || "").toLowerCase().replace(/\s+/g, "-"),
    price_range: venueData.price_range || "€€",
    latitudine: venueData.latitude ?? venueData.latitudine ?? null,
    longitudine: venueData.longitude ?? venueData.longitudine ?? null,
    video_url: venueData.video_url ?? null,
    status: venueData.status || "pending",
  };
  const { data, error } = await supabase.from(TABLE_LOCALI).insert(row).select().single();
  if (error) {
    console.error("[Supabase] insert Locali - errore:", error);
    throw error;
  }
  return data;
}

export async function getPendingRegistrations() {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from(TABLE_APP_USERS)
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Supabase get registrations:", error);
    throw error;
  }
  return data || [];
}

export async function updateAppUserStatus(id, status) {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase.from(TABLE_APP_USERS).update({ status }).eq("id", id);
  return !error;
}

export async function updateAppUser(id, data) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase non configurato. Verifica VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
  }
  const { data: updated, error } = await supabase.from(TABLE_APP_USERS).update(data).eq("id", id).select().single();
  if (error) {
    console.error("[Supabase] update app_user - errore completo:", { error, code: error.code, details: error.details, hint: error.hint });
    const err = new Error(error.message || "Errore aggiornamento su Supabase");
    err.originalError = error;
    throw err;
  }
  return updated;
}
