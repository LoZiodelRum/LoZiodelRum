import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
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
