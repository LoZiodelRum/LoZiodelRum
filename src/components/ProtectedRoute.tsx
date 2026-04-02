import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type UserContextType = {
  user: any;
  role: string | null;
  status: string | null;
  loading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  role: null,
  status: null,
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function checkUser() {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setUser(null);
      setRole(null);
      setStatus(null);
      setLoading(false);
      return;
    }

    const { data: profilo, error: profiloError } = await supabase
      .from("Profili")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profiloError || !profilo) {
      console.error("Errore profilo:", profiloError);

      setUser(user); // 🔥 NON LO TOGLIAMO
      setRole(null);
      setStatus(null);
      setLoading(false);
      return;
    }

    // 🔥 NON BLOCCARE QUI
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

  return (
    <UserContext.Provider value={{ user, role, status, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);