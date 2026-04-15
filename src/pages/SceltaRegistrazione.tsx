import "../App.css";
import { useNavigate } from "react-router-dom";

export default function SceltaRegistrazione() {
  const navigate = useNavigate();

  return (
    <div className="form-page fade-in">
      <div className="form-card registration-choice-card" style={{ textAlign: "center" }}>
        <h1>Registrati</h1>
        <p style={{ color: "#aaa", marginBottom: 10 }}>Scegli il tuo ruolo</p>

        <button className="registration-choice-button" onClick={() => navigate("/registrazione")}>Utente</button>
        <button className="registration-choice-button" onClick={() => navigate("/registrazione-bartender")}>Bartender</button>
        <button className="registration-choice-button" onClick={() => navigate("/registrazione-owner")}>Proprietario</button>
      </div>
    </div>
  );
}