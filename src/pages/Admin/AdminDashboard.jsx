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
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6">
      
      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-8">
        Pannello di Controllo
      </h1>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* UTENTI */}
        <Link to="/admin/users">
          <div className="bg-[#1c1c1c] p-6 rounded-2xl shadow-lg hover:scale-105 transition">
            <h2 className="text-xl font-semibold mb-2">Utenti</h2>
            <p className="text-gray-400">
              Gestisci utenti, approvazioni e ruoli
            </p>
          </div>
        </Link>

        {/* LOCALI */}
        <Link to="/admin/venues">
          <div className="bg-[#1c1c1c] p-6 rounded-2xl shadow-lg hover:scale-105 transition">
            <h2 className="text-xl font-semibold mb-2">Locali</h2>
            <p className="text-gray-400">
              Approva e modifica locali
            </p>
          </div>
        </Link>

        {/* CONTENUTI (FUTURO) */}
        <div className="bg-[#1c1c1c] p-6 rounded-2xl opacity-50">
          <h2 className="text-xl font-semibold mb-2">Contenuti</h2>
          <p className="text-gray-400">
            In arrivo
          </p>
        </div>

      </div>

    </div>
  );
}