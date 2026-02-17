/**
 * Sottoscrizioni real-time Supabase per aggiornamenti live.
 * I Locali sono in venues_cloud.
 */
import { useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function mapVenueRow(row) {
  return {
    id: String(row.id),
    supabase_id: String(row.id),
    name: row.name,
    city: row.city || "",
    country: row.country || "Italia",
    address: row.address || "",
    description: row.description || "",
    cover_image: row.cover_image || "",
    video_url: row.video_url || null,
    category: row.category || "cocktail_bar",
    price_range: row.price_range || "€€",
    phone: row.phone || "",
    website: row.website || "",
    instagram: row.instagram || "",
    opening_hours: row.opening_hours || "",
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    status: row.status || "pending",
    _cloudPending: row.status === "pending",
  };
}

export function useVenuesRealtime(onInsert, onUpdate, onDelete) {
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    const channel = supabase
      .channel("venues_cloud-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "venues_cloud" }, (payload) => {
        onInsert?.(mapVenueRow(payload.new));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "venues_cloud" }, (payload) => {
        onUpdate?.(mapVenueRow(payload.new));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "venues_cloud" }, (payload) => {
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
