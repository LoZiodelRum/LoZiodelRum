import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type UserContextType = {
  user: any;
  role: string | null;
  status: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  role: null,
  status: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Logica admin key/password rimossa

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // NON LOGGATO
    if (!user) {
      setUser(null);
      setRole(null);
      setStatus(null);
      setLoading(false);
      return;
    }

    const { data: profilo } = await supabase
      .from("Profili")
      .select("id, ruolo, status")
      .eq("id", user.id)
      .maybeSingle();

    // PROFILO NON TROVATO - TENTATIVO DI RECOVERY
    if (!profilo) {
      const metadata = (user.user_metadata || {}) as Record<string, any>;
      const fallbackProfile = {
        id: user.id,
        nome: String(metadata.nome || "").trim() || null,
        cognome: String(metadata.cognome || "").trim() || null,
        username: String(metadata.username || user.email?.split("@")[0] || "").trim() || null,
        email: String(user.email || "").trim().toLowerCase() || null,
        telefono: String(metadata.telefono || "").trim() || null,
        ruolo: String(metadata.ruolo || "utente"),
        status: "attivo",
      };

      const { data: recoveredProfile } = await supabase
        .from("Profili")
        .upsert([fallbackProfile], { onConflict: "id" })
        .select("id, ruolo, status")
        .maybeSingle();

      if (recoveredProfile) {
        setUser(user);
        setRole(recoveredProfile.ruolo || "utente");
        setStatus(recoveredProfile.status);
        setLoading(false);
        return;
      }

      // Se il recovery non funziona, manteniamo l'utente ma senza ruolo
      setUser(user);
      setRole(null);
      setStatus(null);
      setLoading(false);
      return;
    }

    // ✅ PROFILO TROVATO
    setUser(user);
    setRole(profilo.ruolo || "utente");
    setStatus(profilo.status);
    setLoading(false);
  }

  useEffect(() => {
    checkUser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = role === "admin";
  const isAuthenticated = Boolean(user);

  return (
    <UserContext.Provider
      value={{
        user,
        role,
        status,
        loading,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);