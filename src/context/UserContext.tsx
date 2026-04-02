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
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    // PROFILO NON TROVATO
    if (!profilo) {
      setUser(null);
      setRole(null);
      setStatus(null);
      setLoading(false);
      return;
    }

    // ✅ NON FACCIAMO LOGOUT
    // 🔥 gestiamo tutto via status
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