
import { useNavigate } from "react-router-dom";
import { useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/");
      }
    };
    checkAuth();
    // eslint-disable-next-line
  }, []);

  return children;
}
