import { useState, useEffect } from "react";
import { useAppData } from "@/lib/AppDataContext";

/**
 * Hook che restituisce il numero di locali in attesa di approvazione (Supabase).
 * Usato per mostrare un badge all'admin. Esegue polling ogni 60 secondi.
 */
export function usePendingVenuesCount() {
  const { user, isSupabaseConfigured, getPendingVenuesFromCloud } = useAppData();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured() || user?.role !== "admin") {
      setCount(0);
      return;
    }
    const fetch = () => {
      getPendingVenuesFromCloud().then((list) => setCount(list?.length ?? 0)).catch(() => setCount(0));
    };
    fetch();
    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
  }, [user?.role, isSupabaseConfigured]);

  return count;
}
