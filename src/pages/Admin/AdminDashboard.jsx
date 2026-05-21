import "../../App.css";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminDashboard() {

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/";
      return;
    }

    const { data, error } = await supabase
      .from("Profili")
      .select("ruolo")
      .eq("id", user.id)
      .single();

    if (error || data?.ruolo !== "admin") {
      window.location.href = "/";
    }
  };

  return (
    <div className="page fade-in" style={{ background: "#0f0f0f", color: "white" }}>
      
      {/* HEADER */}
      <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, marginBottom: 32 }}>
        Pannello di Controllo
      </h1>

      {/* GRID */}
      <div className="grid-wrapper" style={{ gap: 24 }}>

        {/* UTENTI */}
        <Link to="/admin/users">
          <div style={{ background: "#1c1c1c", padding: 24, borderRadius: 16, boxShadow: "0 10px 24px rgba(0,0,0,0.24)", minHeight: 180 }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 8 }}>Utenti</h2>
            <p style={{ color: "#9ca3af" }}>
              Gestisci utenti, approvazioni e ruoli
            </p>
          </div>
        </Link>

        {/* LOCALI */}
        <Link to="/admin/venues">
          <div style={{ background: "#1c1c1c", padding: 24, borderRadius: 16, boxShadow: "0 10px 24px rgba(0,0,0,0.24)", minHeight: 180 }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 8 }}>Locali</h2>
            <p style={{ color: "#9ca3af" }}>
              Approva e modifica locali
            </p>
          </div>
        </Link>

        {/* CONTENUTI (FUTURO) */}
        <div style={{ background: "#1c1c1c", padding: 24, borderRadius: 16, opacity: 0.5, minHeight: 180 }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 8 }}>Contenuti</h2>
          <p style={{ color: "#9ca3af" }}>
            In arrivo
          </p>
        </div>

      </div>

    </div>
  );
}