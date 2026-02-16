/**
 * Sottoscrizioni real-time Supabase per aggiornamenti live.
 * Tabella unica app_users: venues hanno role='venue' e venue_data.
 */
import { useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function mapAppUserRowToVenue(row) {
  const vd = row.venue_data || {};
  return {
    id: String(row.id),
    supabase_id: String(row.id),
    name: row.name,
    city: vd.city || "",
    country: vd.country || "Italia",
    address: vd.address || "",
    description: vd.description || "",
    cover_image: vd.cover_image || "",
    video_url: vd.video_url || null,
    category: vd.category || "cocktail_bar",
    price_range: vd.price_range || "€€",
    phone: vd.phone || "",
    website: vd.website || "",
    instagram: vd.instagram || "",
    opening_hours: vd.opening_hours || "",
    latitude: vd.latitude ?? null,
    longitude: vd.longitude ?? null,
    status: row.status || "pending",
  };
}

export function useVenuesRealtime(onInsert, onUpdate, onDelete) {
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    const channel = supabase
      .channel("app_users-venues")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "app_users" }, (payload) => {
        if (payload.new?.role === "venue") onInsert?.(mapAppUserRowToVenue(payload.new));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "app_users" }, (payload) => {
        if (payload.new?.role === "venue") onUpdate?.(mapAppUserRowToVenue(payload.new));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "app_users" }, (payload) => {
        if (payload.old?.role === "venue") onDelete?.({ id: payload.old.id });
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
