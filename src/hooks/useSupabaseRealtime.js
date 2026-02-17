/**
 * Sottoscrizioni real-time Supabase per aggiornamenti live.
 * I Locali sono nella tabella Locali.
 */
import { useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function mapLocaliRow(row) {
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
    category: row.categoria || "cocktail_bar",
    price_range: row.price_range || "€€",
    phone: row.telefono || "",
    website: row.sito || "",
    instagram: row.instagram || "",
    opening_hours: row.orari || "",
    latitude: row.latitudine ?? null,
    longitude: row.longitudine ?? null,
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
