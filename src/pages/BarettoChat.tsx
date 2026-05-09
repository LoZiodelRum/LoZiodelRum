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
  const [roomId, setRoomId] = useState<string|null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  // Fetch room id by name
  useEffect(() => {
    if (!room) return;
    const fetchRoom = async () => {
      const { data } = await supabase.from("chat_rooms").select("id").eq("nome", room).single();
      setRoomId(data?.id || null);
    };
    fetchRoom();
  }, [room]);

  // Caricamento e realtime messaggi
  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    const loadMessages = async (roomId: string) => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select(`*, profili:user_id (id, nome, username, avatar_url, online)`)
        .eq("room_id", roomId)
        .or("eliminato.is.null,eliminato.eq.false")
        .order("created_at", { ascending: true });
      if (error) {
        console.error(error);
        setMessages([]);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };
    loadMessages(roomId);
    // Realtime: aggiungi solo nuovo messaggio
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          const { data } = await supabase
            .from("chat_messages")
            .select(`*, profili:user_id (id, nome, username, avatar_url, online)`)
            .eq("id", payload.new.id)
            .single();
          setMessages((prev) => [...prev, data]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !roomId || !userId) return;
    await supabase.from("chat_messages").insert({
      room_id: roomId,
      user_id: userId,
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
        {loading ? <div>Caricamento…</div> : messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} me={msg.user_id === userId} />
        ))}
        <div ref={bottomRef} />
      </div>
      <ChatInput value={message} onChange={setMessage} onSend={handleSend} />
      </ChatWindow>
    </div>
  );
}