import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

export default function BarettoChat() {
  const { room } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  const username = "Lo Zio";

  const normalizedRoom = room
    ? room
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
    : "rum";

  const COLORS = {
    textPrimary: "#2c1e14",
    textSecondary: "#7a6a58",
    gold: "#c9a86a",
    bgLight: "#f7f4ee",
    bgChat: "#ebe5dc",
    bubbleLeft: "#ffffff",
    bubbleRight: "#d9d2c7",
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`room-${normalizedRoom}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room=eq.${normalizedRoom}`,
        },
        (payload) => {
          const msg = payload.new;

          setMessages((prev) => [
            ...prev,
            {
              user: msg.user_name,
              text: msg.text,
              created_at: msg.created_at,
              me: msg.user_name === username,
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [normalizedRoom]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("room", normalizedRoom)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(
        data.map((msg) => ({
          user: msg.user_name,
          text: msg.text,
          created_at: msg.created_at,
          me: msg.user_name === username,
        }))
      );
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    await supabase.from("messages").insert([
      {
        room: normalizedRoom,
        user_name: username,
        text: message,
      },
    ]);

    setMessage("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: COLORS.bgChat,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: "15px",
          borderBottom: "1px solid #ddd",
          background: COLORS.bgLight,
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <button
          onClick={() => navigate("/baretto")}
          style={{
            background: "#2c1e14",
            color: "#fff",
            border: "none",
            width: "35px",
            height: "35px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ←
        </button>

        <div>
          <strong style={{ color: COLORS.gold }}>
            Tavolo: {room}
          </strong>
          <p style={{ fontSize: "12px", color: COLORS.textSecondary }}>
            Chat realtime attiva
          </p>
        </div>
      </div>

      {/* CHAT */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto",
        }}
      >
        {messages.map((msg, index) => {
          const prev = messages[index - 1];

          const showUsername =
            !msg.me && (!prev || prev.user !== msg.user);

          return (
            <div
              key={index}
              style={{
                marginBottom: "10px",
                textAlign: msg.me ? "right" : "left",
              }}
            >
              {/* 👇 NOME SOLO SE CAMBIA UTENTE */}
              {showUsername && (
                <div
                  style={{
                    fontSize: "12px",
                    color: COLORS.textSecondary,
                    marginBottom: "3px",
                  }}
                >
                  {msg.user}
                </div>
              )}

              <div
                style={{
                  display: "inline-block",
                  background: msg.me
                    ? COLORS.bubbleRight
                    : COLORS.bubbleLeft,
                  padding: "8px 12px",
                  borderRadius: "16px",
                  maxWidth: "70%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ color: COLORS.textPrimary }}>
                    {msg.text}
                  </span>

                  <span
                    style={{
                      fontSize: "10px",
                      color: COLORS.textSecondary,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {msg.created_at
                      ? new Date(msg.created_at)
                          .toLocaleTimeString()
                          .slice(0, 5)
                      : ""}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* INPUT FIXATO */}
      <div
        style={{
          padding: "15px",
          borderTop: "1px solid #ddd",
          display: "flex",
          gap: "10px",
          background: COLORS.bgLight,
        }}
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Scrivi un messaggio..."
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "20px",
            border: "1px solid #ddd",
            background: "#ffffff", // ✅ FIX
            color: COLORS.textPrimary, // ✅ FIX
          }}
        />

        <button
          onClick={handleSend}
          style={{
            background: COLORS.gold,
            borderRadius: "50%",
            width: "45px",
            height: "45px",
            border: "none",
            cursor: "pointer",
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}