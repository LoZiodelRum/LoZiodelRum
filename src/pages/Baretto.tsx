import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Baretto() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRooms = async () => {
      const { data, error } = await supabase
        .from("chat_rooms")
        .select("*")
        .eq("deleted", false)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Errore caricamento stanze:", error);
        setLoading(false);
        return;
      }

      setRooms(data || []);
      setLoading(false);
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
        🟢 Community attiva
      </div>

      <div
        style={{
          marginTop: "30px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {loading && (
          <div style={{ opacity: 0.7 }}>
            Caricamento tavoli...
          </div>
        )}

        {!loading && rooms.length === 0 && (
          <div
            style={{
              background: "#101826",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid #1f2937",
            }}
          >
            Nessun tavolo disponibile.
          </div>
        )}

        {!loading &&
          rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => navigate(`/baretto/chat/${room.nome}`)}
              style={{
                background: "#101826",
                borderRadius: "16px",
                padding: "16px",
                cursor: "pointer",
                border: "1px solid #1f2937",
              }}
            >
              {room.immagine && (
                <img
                  src={room.immagine}
                  alt={room.nome}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    marginBottom: "12px",
                  }}
                />
              )}

              <h3
                style={{
                  marginBottom: "8px",
                }}
              >
                {room.nome}
              </h3>

              <p
                style={{
                  opacity: 0.7,
                  marginBottom: "10px",
                }}
              >
                {room.descrizione || "Nessuna descrizione"}
              </p>

              {room.categoria && (
                <div
                  style={{
                    fontSize: "13px",
                    opacity: 0.6,
                    marginBottom: "10px",
                  }}
                >
                  Categoria: {room.categoria}
                </div>
              )}

              <div
                style={{
                  color: "#d4a54a",
                  fontWeight: 600,
                }}
              >
                ENTRA →
              </div>
            </div>
          ))}
      </div>

      <button
        onClick={() => navigate("/baretto/create")}
        style={{
          position: "fixed",
          right: "20px",
          bottom: "110px",
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          border: "none",
          background: "#d4a54a",
          color: "#000",
          fontSize: "28px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        +
      </button>
    </div>
  );
}