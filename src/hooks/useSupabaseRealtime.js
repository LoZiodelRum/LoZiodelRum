/**
 * Sottoscrizioni real-time Supabase per aggiornamenti live.
 * I Locali sono nella tabella Locali.
 */
import { useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/** Mapping: Locali (nome, citta) o venues_cloud (name, city) */
function mapVenueRow(row, isLocali = true) {
  const catRaw = row.categoria || row.category || "cocktail_bar";
  const categories = catRaw ? String(catRaw).split(",").map((s) => s.trim()).filter(Boolean) : ["cocktail_bar"];
  const status = row.status || "pending";
  const approvato = row.approvato === true || status === "approved";
  return {
    id: String(row.id),
    supabase_id: String(row.id),
    name: isLocali ? (row.nome || "") : (row.name || ""),
    city: isLocali ? (row.citta || "") : (row.city || ""),
    province: row.provincia || "",
    country: isLocali ? (row.paese || "Italia") : (row.country || "Italia"),
    address: isLocali ? (row.indirizzo || "") : (row.address || ""),
    description: isLocali ? (row.descrizione || "") : (row.description || ""),
    cover_image: row.image_url || row.cover_image || "",
    video_url: row.video_url || null,
    category: categories[0] || "cocktail_bar",
    categories,
    price_range: row.price_range || "€€",
    phone: row.telefono || row.phone || "",
    website: row.sito || row.website || "",
    instagram: row.instagram || "",
    opening_hours: row.orari || row.opening_hours || "",
    latitude: (row.latitudine ?? row.latitude) != null ? parseFloat(row.latitudine ?? row.latitude) : null,
    longitude: (row.longitudine ?? row.longitude) != null ? parseFloat(row.longitudine ?? row.longitude) : null,
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
      const mapped = mapVenueRow(payload.new ?? payload.old, true);
      if (evt === "INSERT") onInsert?.(mapped);
      else if (evt === "UPDATE") onUpdate?.(mapped);
      else onDelete?.({ id: payload.old?.id });
    };
    const handleVenuesCloud = (payload, evt) => {
      const mapped = mapVenueRow(payload.new ?? payload.old, false);
      if (evt === "INSERT") onInsert?.(mapped);
      else if (evt === "UPDATE") onUpdate?.(mapped);
      else onDelete?.({ id: payload.old?.id });
    };
    const channel = supabase
      .channel("Locali-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "Locali" }, (p) => handleLocali(p, "INSERT"))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "Locali" }, (p) => handleLocali(p, "UPDATE"))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "Locali" }, (p) => handleLocali(p, "DELETE"))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "venues_cloud" }, (p) => handleVenuesCloud(p, "INSERT"))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "venues_cloud" }, (p) => handleVenuesCloud(p, "UPDATE"))
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "venues_cloud" }, (p) => handleVenuesCloud(p, "DELETE"))
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
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
