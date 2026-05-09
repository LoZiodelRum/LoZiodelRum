import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { ChatWindow, ChatMessage, ChatInput } from "../components/chat";

export default function BarettoMobileChat() {
  const { room } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState<number|null>(null);
  // TODO: Replace with real user context
  const username = "Lo Zio";
  const userId = 1;

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
    const sub = supabase.channel(`room-mobile-${roomId}`).on(
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
      user_id: userId, // TODO: real user id
      testo: message,
      created_at: new Date().toISOString(),
      eliminato: false
    });
    setMessage("");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#ebe5dc" }}>
      {/* HEADER */}
      <div style={{ padding: 15, borderBottom: "1px solid #ddd", background: "#f7f4ee", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => navigate("/baretto")} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>←</button>
        <div>
          <strong style={{ color: "#c9a86a" }}>{room ? `Tavolo ${room}` : "Tavolo"}</strong>
        </div>
      </div>
      <ChatWindow>
        {loading ? <div style={{ padding: 20 }}>Caricamento…</div> : messages.map((msg, i) => (
          <ChatMessage key={msg.id || i} message={{ user: msg.user_id, text: msg.testo, orario: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }} me={msg.user_id === userId} />
        ))}
        <div ref={bottomRef} />
      </ChatWindow>
      <ChatInput value={message} onChange={setMessage} onSend={handleSend} />
    </div>
  );
}
