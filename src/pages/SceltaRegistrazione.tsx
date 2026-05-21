import "../App.css";
import { useNavigate } from "react-router-dom";

export default function SceltaRegistrazione() {
  const navigate = useNavigate();

  return (
    <div className="form-page fade-in">
      <div className="form-card" style={{ textAlign: "center" }}>
        <h1>Registrati</h1>
        <p style={{ color: "#aaa", marginBottom: 10 }}>Scegli il tuo ruolo</p>

        <button onClick={() => navigate("/registrazione")}>Utente</button>
        <button onClick={() => navigate("/registrazione-bartender")}>Bartender</button>
        <button onClick={() => navigate("/registrazione-owner")}>Proprietario</button>
      </div>
    </div>
  );
}