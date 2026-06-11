import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Baretto() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const { data: roomsData } = await supabase
      .from("chat_rooms")
      .select("*")
      .eq("deleted", false)
      .order("updated_at", { ascending: false });

    const { count } = await supabase
      .from("chat_room_members")
      .select("*", { count: "exact", head: true })
      .eq("online", true);

    setRooms(roomsData || []);
    setOnlineUsers(count || 0);

    setLoading(false);
  }

  const tavoliUfficiali = rooms.filter((r) => r.ufficiale);
  const tavoliNormali = rooms.filter((r) => !r.ufficiale);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050d1a",
        color: "#fff",
        padding: "24px",
        paddingBottom: "120px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "30px",
        }}
      >
        <h1
          style={{
            color: "#d4a54a",
            marginBottom: "10px",
          }}
        >
          IL BARETTO
        </h1>

        <p
          style={{
            opacity: 0.75,
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          Parla di cocktail, distillati, locali, eventi e cultura del bere
          responsabile.
        </p>
      </div>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          background: "#0d1b2d",
          border: "1px solid #1f324b",
          padding: "12px 18px",
          borderRadius: "999px",
          marginBottom: "30px",
        }}
      >
        <span style={{ color: "#00d84a", fontSize: "20px" }}>●</span>

        <span>
          {onlineUsers} utenti online
        </span>
      </div>

      {loading && (
        <div>Caricamento tavoli...</div>
      )}

      {!loading && (
        <>
          <h2 style={{ color: "#d4a54a", marginBottom: "15px" }}>
            ⭐ Tavoli ufficiali DrinkWise
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              marginBottom: "40px",
            }}
          >
            {tavoliUfficiali.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                navigate={navigate}
              />
            ))}
          </div>

          <h2 style={{ color: "#d4a54a", marginBottom: "15px" }}>
            🍹 Tavoli della community
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {tavoliNormali.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                navigate={navigate}
              />
            ))}
          </div>
        </>
      )}

      <button
        onClick={() => navigate("/baretto/create")}
        style={{
          position: "fixed",
          right: "25px",
          bottom: "100px",
          width: "70px",
          height: "70px",
          borderRadius: "50%",
          border: "none",
          background: "#d4a54a",
          color: "#000",
          fontSize: "36px",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 0 25px rgba(212,165,74,0.4)",
        }}
      >
        +
      </button>
    </div>
  );
}

function RoomCard({
  room,
  navigate,
}: {
  room: any;
  navigate: any;
}) {
  return (
    <div
      style={{
        background: "linear-gradient(180deg,#0c1830 0%, #0b1628 100%)",
        border: "1px solid rgba(212,165,74,0.15)",
        borderRadius: "24px",
        padding: "18px",
        display: "flex",
        alignItems: "center",
        gap: "18px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      }}
    >
      <div
        style={{
          width: "80px",
          height: "80px",
          minWidth: "80px",
          borderRadius: "50%",
          overflow: "hidden",
          border: "2px solid rgba(212,165,74,0.4)",
        }}
      >
        <img
          src={
            room.icona ||
            room.immagine ||
            "https://placehold.co/200x200/111827/D4A54A?text=DW"
          }
          alt={room.nome}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      <div style={{ flex: 1 }}>
        <h3
          style={{
            margin: 0,
            fontSize: "22px",
            color: "#fff",
            marginBottom: "8px",
          }}
        >
          {room.nome}
        </h3>

        <div
          style={{
            color: "#d7dbe3",
            fontSize: "14px",
            marginBottom: "12px",
            lineHeight: 1.5,
          }}
        >
          {room.descrizione || "Discussioni e confronto tra appassionati"}
        </div>

        <div
          style={{
            display: "flex",
            gap: "18px",
            color: "#9ca3af",
            fontSize: "13px",
          }}
        >
          <span>👥 {room.member_count || 0}</span>
          <span>💬 {room.message_count || 0}</span>
          <span>{room.categoria}</span>
        </div>
      </div>

      <button
        onClick={() =>
          navigate(`/baretto/chat/${encodeURIComponent(room.nome)}`)
        }
        style={{
          background: "transparent",
          border: "2px solid #D4A54A",
          color: "#D4A54A",
          padding: "12px 22px",
          borderRadius: "14px",
          fontWeight: 700,
          fontSize: "15px",
          cursor: "pointer",
          transition: "all .2s ease",
        }}
      >
        ENTRA
      </button>
    </div>
  );
}