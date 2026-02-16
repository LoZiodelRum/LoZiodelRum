/**
 * Tabella unica app_users: Bartender, Locali, User, Proprietario.
 */
import { supabase, isSupabaseConfigured } from "./supabase";
import { TABLE_APP_USERS } from "./supabaseTables";

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
      image_url: sanitize(userData.image_url) || sanitize(userData.photo) || "",
      video_url: sanitize(userData.video_url) ?? null,
      status: "pending",
      bio: sanitize(userData.bio) ?? "",
      home_city: (sanitize(userData.home_city) ?? sanitize(userData.city)) ?? "",
      venue_id: userData.venue_id || null,
      custom_venue_name: sanitize(userData.custom_venue_name || userData.venue_name) || null,
      name: (sanitize(userData.full_name) ?? String((userData.name || "") + " " + (userData.surname || "")).trim()) || "Bartender",
    }),
    ...(userData.role === "venue" && {
      venue_data: {
        slug: userData.slug || "",
        description: userData.description || "",
        city: userData.city || "",
        country: userData.country || "Italia",
        address: userData.address || "",
        latitude: userData.latitude ?? null,
        longitude: userData.longitude ?? null,
        cover_image: userData.cover_image || "",
        video_url: userData.video_url || null,
        category: userData.category || "cocktail_bar",
        price_range: userData.price_range || "€€",
        phone: userData.phone || "",
        website: userData.website || "",
        instagram: userData.instagram || "",
        opening_hours: userData.opening_hours || "",
      },
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
