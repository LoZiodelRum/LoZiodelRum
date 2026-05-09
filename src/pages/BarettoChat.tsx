import React, { useEffect, useState, useRef } from "react";
// MainLayout ora solo via router
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { ChatWindow, ChatMessage, ChatInput } from "../components/chat";

export default function BarettoChat() {
  const { room } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const username = "Lo Zio"; // TODO: real user
  const [roomId, setRoomId] = useState<number|null>(null);

  // Fetch room id by name
  useEffect(() => {
    if (!room) return;
    const fetchRoom = async () => {
      const { data } = await supabase.from("chat_rooms").select("id").eq("nome", room).single();
      setRoomId(data?.id || null);
    };
    fetchRoom();
  }, [room]);

  // Fetch messages
  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    const fetchMessages = async () => {
      const { data } = await supabase.from("chat_messages").select("*").eq("room_id", roomId).order("created_at", { ascending: true });
      setMessages(data || []);
      setLoading(false);
    };
    fetchMessages();
    // Realtime
    const sub = supabase.channel(`room-${roomId}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
      fetchMessages
    ).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !roomId) return;
    await supabase.from("chat_messages").insert({
      room_id: roomId,
      user_id: 1, // TODO: real user id
      testo: message,
      created_at: new Date().toISOString(),
      eliminato: false
    });
    setMessage("");
  };

  return (
    <div style={{ paddingTop: 47, minHeight: "100vh" }}>
      <ChatWindow>
      <div style={{ padding: 15, borderBottom: "1px solid #ddd", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => navigate("/baretto")} style={{ background: "#2c1e14", color: "#fff", border: "none", width: 35, height: 35, borderRadius: 8, cursor: "pointer" }}>←</button>
        <div>
          <strong style={{ color: "#c9a86a" }}>Tavolo: {room}</strong>
        </div>
      </div>
      <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
        {loading ? <div>Caricamento…</div> : messages.map((msg, i) => (
          <ChatMessage key={msg.id || i} message={{
            user: msg.user_id, // TODO: map to username
            text: msg.eliminato ? undefined : msg.testo,
            image: msg.immagine,
            orario: msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
          }} me={msg.user_id === 1} />
        ))}
        <div ref={bottomRef} />
      </div>
      <ChatInput value={message} onChange={setMessage} onSend={handleSend} />
      </ChatWindow>
    </div>
  );
}