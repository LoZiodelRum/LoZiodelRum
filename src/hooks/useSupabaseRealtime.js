/**
 * Sottoscrizioni real-time Supabase per aggiornamenti live.
 * I Locali sono nella tabella Locali.
 */
import { useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function mapLocaliRow(row) {
  const catRaw = row.categoria || "cocktail_bar";
  const categories = catRaw ? catRaw.split(",").map((s) => s.trim()).filter(Boolean) : ["cocktail_bar"];
  return {
    id: String(row.id),
    supabase_id: String(row.id),
    name: row.nome || "",
    city: row.citta || "",
    province: row.provincia || "",
    country: row.paese || "Italia",
    address: row.indirizzo || "",
    description: row.descrizione || "",
    cover_image: row.image_url || "",
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
    status: row.status || "pending",
    _cloudPending: row.status === "pending",
  };
}

export function useVenuesRealtime(onInsert, onUpdate, onDelete) {
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    const channel = supabase
      .channel("Locali-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "Locali" }, (payload) => {
        onInsert?.(mapLocaliRow(payload.new));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "Locali" }, (payload) => {
        onUpdate?.(mapLocaliRow(payload.new));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "Locali" }, (payload) => {
        onDelete?.({ id: payload.old.id });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onInsert, onUpdate, onDelete]);
}

export function useReviewsRealtime(onInsert, onUpdate, onDelete) {
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    const channel = supabase
      .channel("reviews-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reviews_cloud" }, (payload) => {
        onInsert?.(payload.new);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "reviews_cloud" }, (payload) => {
        onUpdate?.(payload.new);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "reviews_cloud" }, (payload) => {
        onDelete?.(payload.old);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onInsert, onUpdate, onDelete]);
}
