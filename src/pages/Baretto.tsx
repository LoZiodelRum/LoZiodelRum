import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Baretto() {
  const [message, setMessage] = useState("");

  // 🔥 USERNAME SEMPLICE (CAMBIABILE QUI)
  const username = "Lo Zio";

  const [messages, setMessages] = useState([
    {
      user: "Marco",
      text: "Qualcuno ha già provato la nuova riserva agricola di Martinica? 🥃",
      me: false
    },
    {
      user: "Lo Zio",
      text: "Sì, note di canna fresco incredibili!",
      me: true
    },
    {
      user: "Sofia",
      text: "Guardate questa bellezza appena arrivata al bar! 😍",
      image: "https://images.unsplash.com/photo-1605270012917-bf157c5a9541",
      me: false
    }
  ]);

  const navigate = useNavigate();

  const COLORS = {
    textPrimary: "#2c1e14",
    textSecondary: "#7a6a58",
    gold: "#c9a86a",
    bgLight: "#f7f4ee",
    bgChat: "#ebe5dc",
    bubbleLeft: "#ffffff",
    bubbleRight: "#d9d2c7"
  };

  const handleSend = () => {
    if (!message.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        user: username, // ✅ FIX QUI
        text: message,
        me: true
      }
    ]);

    setMessage("");
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: COLORS.bgLight }}>

      {/* SIDEBAR */}
      <div style={{
        width: "260px",
        background: "#f4efe7",
        padding: "20px",
        borderRight: "1px solid #ddd"
      }}>
        <h2 style={{ color: COLORS.gold, marginBottom: "20px" }}>Tavoli</h2>

        <input
          placeholder="Cerca o inizia una nuova chat"
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "20px",
            border: "none",
            background: "#111",
            color: "#fff",
            marginBottom: "20px"
          }}
        />

        {["Rum", "Cocktail", "Whisky", "Locali", "Off Topic"].map((item) => (
          <div 
            key={item} 
            onClick={() => navigate(`/baretto/chat/${item}`)}
            style={{ marginBottom: "20px", cursor: "pointer" }}
          >
            <strong style={{ color: COLORS.gold }}>Tavolo {item}</strong>
            <p style={{ color: COLORS.textSecondary, fontSize: "12px" }}>
              Ultimo messaggio nel tavolo
            </p>
          </div>
        ))}
      </div>

      {/* CHAT */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: COLORS.bgChat
      }}>

        {/* HEADER */}
        <div style={{
          padding: "15px",
          borderBottom: "1px solid #ddd",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>

          <button
            onClick={() => navigate(-1)}
            style={{
              background: "#2c1e14",
              color: "#ffffff",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              width: "35px",
              height: "35px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ←
          </button>

          <div>
            <strong style={{ color: COLORS.gold }}>
              Tavolo: Rum & Cocktail
            </strong>
            <p style={{ color: COLORS.textSecondary, fontSize: "12px" }}>
              10 partecipanti • 3 online
            </p>
          </div>
        </div>

        {/* MESSAGGI */}
        <div style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto"
        }}>
          {messages.map((msg, index) => (
            <div key={index} style={{
              background: msg.me ? COLORS.bubbleRight : COLORS.bubbleLeft,
              padding: "15px",
              borderRadius: "12px",
              maxWidth: "60%",
              marginLeft: msg.me ? "auto" : "0",
              marginBottom: "20px"
            }}>
              <strong style={{ color: COLORS.textPrimary }}>{msg.user}</strong>

              <p style={{ color: COLORS.textPrimary }}>
                {msg.text}
              </p>

              {msg.image && (
                <img
                  src={msg.image}
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    marginTop: "10px"
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div style={{
          padding: "15px",
          borderTop: "1px solid #ddd",
          display: "flex",
          gap: "10px"
        }}>
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
              background: "#ffffff",
              color: COLORS.textPrimary
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
              cursor: "pointer"
            }}
          >
            ➤
          </button>
        </div>
      </div>

      {/* DESTRA INFO */}
      <div style={{
        width: "260px",
        background: "#f4efe7",
        padding: "20px",
        borderLeft: "1px solid #ddd"
      }}>
        <h3 style={{ color: COLORS.gold }}>Info Tavolo</h3>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <img
            src="https://images.unsplash.com/photo-1541532713592-79a0317b6b77"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%"
            }}
          />
          <h4 style={{ color: COLORS.gold, marginTop: "10px" }}>
            Rum & Cocktail
          </h4>
          <p style={{ color: COLORS.textSecondary }}>
            Creato il 12 Giugno 2024
          </p>
        </div>

        <div style={{ marginTop: "20px" }}>
          <strong style={{ color: COLORS.textPrimary }}>Partecipanti</strong>

          {["Marco", "Sofia", "Pietro", "Giulia"].map((name) => (
            <p key={name} style={{ color: COLORS.textSecondary }}>
              ● {name}
            </p>
          ))}
        </div>

        <button style={{
          marginTop: "20px",
          width: "100%",
          padding: "10px",
          background: "#2c1e14",
          color: "#fff",
          border: "none",
          borderRadius: "8px"
        }}>
          Esci dal Tavolo
        </button>

        <button style={{
          marginTop: "10px",
          width: "100%",
          padding: "10px",
          background: "#2c1e14",
          color: "#fff",
          border: "none",
          borderRadius: "8px"
        }}>
          Condividi Invito
        </button>
      </div>

    </div>
  );
}