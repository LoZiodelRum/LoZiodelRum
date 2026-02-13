import { useState, useEffect } from "react";
import { useAppData } from "@/lib/AppDataContext";

/**
 * Hook che restituisce il numero di locali in attesa di approvazione (Supabase).
 * Usato per mostrare un badge all'admin. Esegue polling ogni 60 secondi.
 */
export function usePendingVenuesCount() {
  const { user, isSupabaseConfigured, getPendingVenuesFromCloud, getPendingLocalVenues } = useAppData();
  const [cloudCount, setCloudCount] = useState(0);
  const localCount = getPendingLocalVenues?.()?.length ?? 0;

  useEffect(() => {
    if (user?.role !== "admin") {
      setCloudCount(0);
      return;
    }
    if (!isSupabaseConfigured()) {
      setCloudCount(0);
      return;
    }
    const fetch = () => {
      getPendingVenuesFromCloud().then((list) => setCloudCount(list?.length ?? 0)).catch(() => setCloudCount(0));
    };
    fetch();
    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
  }, [user?.role, isSupabaseConfigured]);

  if (user?.role !== "admin") return 0;
  return localCount + cloudCount;
}
