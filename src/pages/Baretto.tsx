import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
export default function Baretto() {
  const navigate = useNavigate();
const [rooms, setRooms] = useState<any[]>([]);
useEffect(() => {
  const loadRooms = async () => {
    const { data, error } = await supabase
      .from("chat_rooms")
      .select("*")
      .eq("deleted", false)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setRooms(data || []);
  };

  loadRooms();
}, []);
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060b14",
        color: "#fff",
        padding: "20px",
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "transparent",
          border: "none",
          color: "#fff",
          fontSize: "16px",
          marginBottom: "20px",
          cursor: "pointer",
        }}
      >
        ← Torna
      </button>

      <h1 style={{ marginBottom: "10px" }}>🍺 Il Baretto</h1>

      <p style={{ opacity: 0.8 }}>
        Parla di cocktail, rum, whisky, locali ed eventi.
      </p>

      <div
        style={{
          marginTop: "20px",
          background: "#0f1724",
          borderRadius: "12px",
          padding: "12px",
          display: "inline-block",
        }}
      >
        🟢 1 utente online
      </div>

      <div
        style={{
          marginTop: "30px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        ))
      </div>

      <button
        onClick={() => navigate("/baretto/create")}
        style={{
          position: "fixed",
          right: "20px",
          bottom: "90px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "none",
          background: "#d4a54a",
          color: "#000",
          fontSize: "32px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        +
      </button>
    </div>
  );
}