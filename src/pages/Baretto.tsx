import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  ChatLayout,
  ChatSidebar,
  ChatRoomList,
  ChatWindow,
  ChatMessage,
  ChatInput,
  ChatParticipants
} from "../components/chat";
import CreateRoomModal from "../components/chat/CreateRoomModal";

export default function Baretto() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  // username può essere ricavato dal profilo, qui lasciato come placeholder
  const username = "Lo Zio";

  // Ottieni user id reale da Supabase Auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  // Load chat rooms
  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await supabase.from("chat_rooms").select("*")
        .order("updated_at", { ascending: false });
      setRooms(data || []);
      setLoading(false);
    };
    fetchRooms();
    // Realtime subscription for new/updated rooms
    const sub = supabase.channel("rooms").on(
      "postgres_changes",
      { event: "*", schema: "public", table: "chat_rooms" },
      () => fetchRooms()
    ).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  // Load messages and participants for selected room
  useEffect(() => {
    if (!selectedRoom) return;
    setLoading(true);
    const fetchMessages = async () => {
      const { data } = await supabase.from("chat_messages").select("*")
        .eq("room_id", selectedRoom.id)
        .order("created_at", { ascending: true });
      setMessages(data || []);
      setLoading(false);
    };
    const fetchParticipants = async () => {
      const { data } = await supabase.from("chat_room_members").select("*, profili: user_id (id, nome, username, avatar_url, online)")
        .eq("room_id", selectedRoom.id);
      setParticipants((data || []).map((m: any) => ({ ...m.profili, online: m.online })));
    };
    fetchMessages();
    fetchParticipants();
    // Realtime subscription for messages
    const subMsg = supabase.channel(`room-${selectedRoom.id}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "chat_messages", filter: `room_id=eq.${selectedRoom.id}` },
      fetchMessages
    ).subscribe();
    // Realtime for participants
    const subPart = supabase.channel(`room-part-${selectedRoom.id}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "chat_room_members", filter: `room_id=eq.${selectedRoom.id}` },
      fetchParticipants
    ).subscribe();
    return () => {
      supabase.removeChannel(subMsg);
      supabase.removeChannel(subPart);
    };
  }, [selectedRoom]);

  const handleSend = async () => {
    if (!message.trim() || !selectedRoom || !userId) return;
    await supabase.from("chat_messages").insert({
      room_id: selectedRoom.id,
      user_id: userId,
      testo: message,
      created_at: new Date().toISOString(),
      eliminato: false
    });
    setMessage("");
  };

  return (
    <div style={{ paddingTop: 47, minHeight: "100vh" }}>
      <ChatLayout>
        <ChatSidebar>
          <h2 style={{ color: "#c9a86a", marginBottom: 20 }}>Tavoli</h2>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              width: "100%",
              background: "#c9a86a",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "12px 0",
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 18,
              cursor: "pointer",
              transition: "background 0.2s",
              boxShadow: "0 2px 8px #c9a86a22"
            }}
            onMouseOver={e => (e.currentTarget.style.background = "#b8955a")}
            onMouseOut={e => (e.currentTarget.style.background = "#c9a86a")}
          >
            + Crea il Tavolo
          </button>
          {loading ? <div>Caricamento…</div> : (
            <ChatRoomList rooms={rooms} onSelect={setSelectedRoom} />
          )}
        </ChatSidebar>
        <ChatWindow>
        {!selectedRoom ? (
          <div style={{ padding: 40, color: "#7a6a58" }}>Seleziona un tavolo per iniziare a chattare.</div>
        ) : (
          <>
            <div style={{ padding: 15, borderBottom: "1px solid #ddd", display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setSelectedRoom(null)} style={{ background: "#2c1e14", color: "#fff", border: "none", width: 35, height: 35, borderRadius: 8, cursor: "pointer" }}>←</button>
              <div>
                <strong style={{ color: "#c9a86a" }}>{selectedRoom.nome}</strong>
                <p style={{ color: "#7a6a58", fontSize: 12 }}>{selectedRoom.descrizione}</p>
              </div>
            </div>
            <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
              {loading ? <div>Caricamento…</div> : messages.map((msg, i) => (
                <ChatMessage key={msg.id || i} message={{
                  user: participants.find((p: any) => p.id === msg.user_id)?.username || "?",
                  text: msg.eliminato ? undefined : msg.testo,
                  image: msg.immagine,
                  orario: msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
                }} me={msg.user_id === 1} />
              ))}
            </div>
            <ChatInput value={message} onChange={setMessage} onSend={handleSend} />
          </>
        )}
      </ChatWindow>
      <ChatSidebar>
        {selectedRoom && (
          <>
            <h3 style={{ color: "#c9a86a" }}>Info Tavolo</h3>
            <div style={{ textAlign: "center", marginTop: 20 }}>
              {selectedRoom.immagine && <img src={selectedRoom.immagine} style={{ width: 80, height: 80, borderRadius: "50%" }} alt="tavolo" />}
              <h4 style={{ color: "#c9a86a", marginTop: 10 }}>{selectedRoom.nome}</h4>
              <p style={{ color: "#7a6a58" }}>Creato il {selectedRoom.created_at ? new Date(selectedRoom.created_at).toLocaleDateString() : "-"}</p>
            </div>
            <ChatParticipants members={participants} />
            <button style={{ marginTop: 20, width: "100%", padding: 10, background: "#2c1e14", color: "#fff", border: "none", borderRadius: 8 }}>Esci dal Tavolo</button>
            <button style={{ marginTop: 10, width: "100%", padding: 10, background: "#2c1e14", color: "#fff", border: "none", borderRadius: 8 }}>Condividi Invito</button>
          </>
        )}
      </ChatSidebar>
      </ChatLayout>
      <CreateRoomModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={async ({ nome, descrizione, categoria, pubblico, immagine }) => {
          if (!userId) {
            alert("Utente non autenticato");
            return;
          }
          const now = new Date().toISOString();
          const { data, error } = await supabase.from("chat_rooms").insert({
            nome,
            descrizione,
            categoria,
            pubblico,
            immagine,
            creato_da: userId,
            created_at: now,
            updated_at: now,
            deleted: false
          }).select().single();
          if (error || !data) {
            alert("Errore creazione tavolo: " + (error?.message || ""));
            return;
          }
          // Aggiungi creator come admin
          await supabase.from("chat_room_members").insert({
            room_id: data.id,
            user_id: userId,
            ruolo: "admin",
            joined_at: now
          });
          setModalOpen(false);
          setSelectedRoom(data);
        }}
      />
    </div>
  );
}