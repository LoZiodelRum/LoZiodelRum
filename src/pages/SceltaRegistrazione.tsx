import "../App.css";
import { useNavigate } from "react-router-dom";

export default function SceltaRegistrazione() {
  const navigate = useNavigate();

  return (
    <div className="page fade-in" style={container}>
      <div style={card}>
        <h1 style={title}>Registrati</h1>
        <p style={subtitle}>Scegli il tuo ruolo</p>

        <button style={btn} onClick={() => navigate("/registrazione")}>
          Utente
        </button>

        <button style={btn} onClick={() => navigate("/registrazione-bartender")}>
          Bartender
        </button>

        <button style={btn} onClick={() => navigate("/registrazione-owner")}>
          Proprietario
        </button>
      </div>
    </div>
  );
}

const container = {
  minHeight: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#000",
};

const card = {
  width: "min(100%, 400px)",
  padding: 30,
  background: "#111",
  borderRadius: 12,
  color: "#fff",
  textAlign: "center" as const,
};

const title = {
  fontSize: "clamp(1.6rem, 5vw, 1.875rem)",
  marginBottom: 10,
};

const subtitle = {
  marginBottom: 20,
  color: "#aaa",
};

const btn = {
  width: "100%",
  padding: 15,
  marginBottom: 10,
  background: "#222",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};