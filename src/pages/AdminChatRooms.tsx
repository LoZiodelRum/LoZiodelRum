import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminChatRooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await supabase.from("chat_rooms").select("*", { count: "exact" }).order("created_at", { ascending: false });
      setRooms(data || []);
      setLoading(false);
    };
    fetchRooms();
  }, []);

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ color: "#f59e0b", fontWeight: 700, fontSize: 28, marginBottom: 24 }}>Gestione Tavoli</h2>
      {loading ? <div>Caricamento…</div> : (
        <div style={{ display: "grid", gap: 24 }}>
          {rooms.map(room => (
            <div key={room.id} style={{ background: "#18181b", borderRadius: 18, padding: 24, boxShadow: "0 2px 12px #0002", display: "flex", alignItems: "center", gap: 24 }}>
              <img src={room.immagine || "/assets/placeholder-tavolo.png"} alt="tavolo" style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover", background: "#222" }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: "#f59e0b", fontWeight: 600, fontSize: 20 }}>{room.nome}</div>
                <div style={{ color: "#fff", opacity: 0.7, fontSize: 15 }}>{room.categoria} • Creato il {room.created_at ? new Date(room.created_at).toLocaleDateString() : "-"}</div>
                <div style={{ color: "#fff", opacity: 0.5, fontSize: 13 }}>ID: {room.id}</div>
              </div>
              <button style={{ background: "#f59e0b", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 2px 8px #f59e0b22" }}>Apri Tavolo</button>
              <button style={{ background: "#18181b", color: "#f59e0b", border: "1px solid #f59e0b", borderRadius: 8, padding: "10px 18px", fontWeight: 700, fontSize: 16, cursor: "pointer", marginLeft: 8 }}>Modifica</button>
              <button style={{ background: "#b91c1c", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 700, fontSize: 16, cursor: "pointer", marginLeft: 8 }}>Elimina</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
