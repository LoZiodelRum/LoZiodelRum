/**
 * Sottoscrizioni real-time Supabase per aggiornamenti live.
 * I Locali sono nella tabella Locali.
 */
import { useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/** Mapping: tabella Locali */
function mapVenueRow(row) {
  const catRaw = row.categoria || row.category || "cocktail_bar";
  const categories = catRaw ? String(catRaw).split(",").map((s) => s.trim()).filter(Boolean) : ["cocktail_bar"];
  const status = row.status || "pending";
  const approvato = row.approvato === true || status === "approved";
  return {
    id: String(row.id),
    supabase_id: String(row.id),
    name: row.nome || "",
    city: row.citta || "",
    province: row.provincia || "",
    country: row.paese || "Italia",
    address: row.indirizzo || "",
    description: row.descrizione || "",
    cover_image: row.image_url || row.cover_image || "",
    video_url: row.video_url || null,
    category: categories[0] || "cocktail_bar",
    categories,
    price_range: row.price_range || "€€",
    phone: row.telefono || "",
    website: row.sito || "",
    instagram: row.instagram || "",
    opening_hours: row.orari || "",
    latitude: row.latitudine != null ? parseFloat(row.latitudine) : null,
    longitude: row.longitudine != null ? parseFloat(row.longitudine) : null,
    status,
    approvato,
    _cloudPending: !approvato,
    created_at: row.created_at || null,
    slug: row.slug || null,
  };
}

export function useVenuesRealtime(onInsert, onUpdate, onDelete) {
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    const handleLocali = (payload, evt) => {
      const mapped = mapVenueRow(payload.new ?? payload.old);
      if (evt === "INSERT") onInsert?.(mapped);
      else if (evt === "UPDATE") onUpdate?.(mapped);
      else onDelete?.({ id: payload.old?.id });
    };
    const channel = supabase
      .channel("Locali-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "Locali" }, (p) => handleLocali(p, "INSERT"))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "Locali" }, (p) => handleLocali(p, "UPDATE"))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "Locali" }, (p) => handleLocali(p, "DELETE"))
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [onInsert, onUpdate, onDelete]);
}

export function useReviewsRealtime(mapReview, onInsert, onUpdate, onDelete) {
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    const map = mapReview || ((r) => r);
    const channel = supabase
      .channel("reviews-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reviews_cloud" }, (payload) => {
        onInsert?.(map(payload.new));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "reviews_cloud" }, (payload) => {
        onUpdate?.(map(payload.new));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "reviews_cloud" }, (payload) => {
        onDelete?.(payload.old);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [mapReview, onInsert, onUpdate, onDelete]);
}

/** Realtime per app_users (Bartender e Users) */
export function useAppUsersRealtime(mapUser, onInsert, onUpdate, onDelete) {
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    const map = mapUser || ((r) => r);
    const channel = supabase
      .channel("app_users-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "app_users" }, (payload) => {
        onInsert?.(map(payload.new));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "app_users" }, (payload) => {
        onUpdate?.(map(payload.new));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "app_users" }, (payload) => {
        onDelete?.(payload.old);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [mapUser, onInsert, onUpdate, onDelete]);
}
