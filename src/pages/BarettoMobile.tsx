import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function BarettoChat() {
  const { room } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      user: "Rum",
      text: "Ultimo messaggio nel tavolo",
      me: false,
    },
    {
      user: "Cocktail",
      text: "Ultimo messaggio nel tavolo",
      me: false,
    },
    {
      user: "Whisky",
      text: "Ultimo messaggio nel tavolo",
      me: false,
    },
    {
      user: "Locali",
      text: "Ultimo messaggio nel tavolo",
      me: false,
    },
    {
      user: "Off Topic",
      text: "Ultimo messaggio nel tavolo",
      me: false,
    },
  ]);

  const COLORS = {
    textPrimary: "#2c1e14",
    textSecondary: "#7a6a58",
    gold: "#c9a86a",
    bgLight: "#f7f4ee",
    bgChat: "#ebe5dc",
    bubbleLeft: "#ffffff",
    bubbleRight: "#d9d2c7",
  };

  const handleSend = () => {
    if (!message.trim()) return;

    console.log("CLICK TAVOLO:", message);

    navigate(`/baretto/chat/${message}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: COLORS.bgLight,
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
          onClick={() => navigate("/home")}
          style={{
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          ←
        </button>

        <div>
          <strong style={{ color: COLORS.gold }}>
            Tavoli
          </strong>
          <p
            style={{
              fontSize: "12px",
              color: COLORS.textSecondary,
            }}
          >
            Seleziona un tavolo
          </p>
        </div>
      </div>

      {/* LISTA */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            onClick={() =>
              navigate(`/baretto/chat/${msg.user}`)
            }
            style={{
              background: COLORS.bubbleLeft,
              padding: "15px",
              borderRadius: "12px",
              maxWidth: "100%",
              marginBottom: "20px",
              cursor: "pointer",
            }}
          >
            <strong style={{ color: COLORS.gold }}>
              Tavolo {msg.user}
            </strong>

            <p style={{ color: COLORS.textSecondary }}>
              {msg.text}
            </p>
          </div>
        ))}
      </div>

      {/* INPUT (non usato ma lasciato intatto) */}
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
          placeholder="Scrivi un messaggio..."
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "20px",
            border: "1px solid #ddd",
            background: "#ffffff",
            color: COLORS.textPrimary,
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