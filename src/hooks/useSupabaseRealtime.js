/**
 * Sottoscrizioni real-time Supabase per aggiornamenti live
 */
import { useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export function useVenuesRealtime(onInsert, onUpdate, onDelete) {
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    const channel = supabase
      .channel("venues-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "venues_cloud" }, (payload) => {
        onInsert?.(payload.new);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "venues_cloud" }, (payload) => {
        onUpdate?.(payload.new);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "venues_cloud" }, (payload) => {
        onDelete?.(payload.old);
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
