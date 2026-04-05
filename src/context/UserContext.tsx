import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type UserContextType = {
  user: any;
  role: string | null;
  status: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginAdminWithKey: (password: string) => boolean;
  logoutAdminKey: () => void;
};

const ADMIN_SESSION_KEY = "isAdmin";
const ADMIN_PASSWORD_CACHE_KEY = "adminPassword";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "850877";

const UserContext = createContext<UserContextType>({
  user: null,
  role: null,
  status: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  loginAdminWithKey: () => false,
  logoutAdminKey: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminKey, setIsAdminKey] = useState(
    localStorage.getItem(ADMIN_SESSION_KEY) === "true"
  );

  function loginAdminWithKey(password: string) {
    if (password !== ADMIN_PASSWORD) return false;

    localStorage.setItem(ADMIN_SESSION_KEY, "true");
    localStorage.setItem(ADMIN_PASSWORD_CACHE_KEY, password);
    setIsAdminKey(true);
    return true;
  }

  function logoutAdminKey() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_PASSWORD_CACHE_KEY);
    setIsAdminKey(false);
  }

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

  const isAdmin = isAdminKey || role === "admin";
  const isAuthenticated = Boolean(user) || isAdmin;

  return (
    <UserContext.Provider
      value={{
        user,
        role,
        status,
        loading,
        isAuthenticated,
        isAdmin,
        loginAdminWithKey,
        logoutAdminKey,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);