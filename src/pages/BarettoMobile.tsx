import React, { useEffect, useState } from "react";
// MainLayout ora solo via router
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useLoungeSwipe } from "../components/lounge/LoungeSwipeNavigation";

export default function BarettoMobile() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const swipe = useLoungeSwipe("/locali-vicini", null);

  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await supabase.from("chat_rooms").select("id, nome, descrizione, updated_at").order("updated_at", { ascending: false });
      setRooms(data || []);
      setLoading(false);
    };
    fetchRooms();
    const sub = supabase.channel("rooms-mobile").on(
      "postgres_changes",
      { event: "*", schema: "public", table: "chat_rooms" },
      fetchRooms
    ).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const filteredRooms = rooms.filter(r => !search || r.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f7f4ee", paddingTop: 47 }} {...swipe}>
      {/* HEADER */}
      <div style={{ padding: 15, borderBottom: "1px solid #ddd", background: "#f7f4ee", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => navigate("/home")} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>←</button>
        <div>
          <strong style={{ color: "#c9a86a" }}>Tavoli</strong>
          <p style={{ fontSize: 12, color: "#7a6a58" }}>Seleziona un tavolo</p>
        </div>
      </div>
      {/* SEARCH */}
      <div style={{ padding: "10px 20px 0 20px" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cerca tavolo..."
          style={{ width: "100%", padding: 10, borderRadius: 20, border: "1px solid #ddd", background: "#fff", color: "#2c1e14", marginBottom: 10 }}
        />
      </div>
      {/* LISTA */}
      <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
        {loading ? <div>Caricamento…</div> : filteredRooms.map(room => (
          <div
            key={room.id}
            onClick={() => navigate(`/baretto/mobilechat/${room.nome}`)}
            style={{ background: "#fff", padding: 15, borderRadius: 12, maxWidth: "100%", marginBottom: 20, cursor: "pointer" }}
          >
            <strong style={{ color: "#c9a86a" }}>Tavolo {room.nome}</strong>
            <p style={{ color: "#7a6a58" }}>{room.descrizione || ""}</p>
          </div>
        ))}
      </div>
    </div>
  );
}