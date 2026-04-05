import "../App.css";
import { useUser } from "../context/UserContext";
import SignupInviteBox from "../components/SignupInviteBox";
import { useNavigate } from "react-router-dom";

export default function Crea() {
  const { isAuthenticated, loading } = useUser();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="page fade-in" style={{ padding: 40 }}>
        <h1>Crea</h1>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="page fade-in" style={{ padding: 40 }}>
        <h1>Crea</h1>
        <SignupInviteBox description="Registrati o accedi per creare contenuti e usare gli strumenti della sezione Crea." />
      </div>
    );
  }

  return (
    <div className="page fade-in" style={{ padding: 40 }}>
      <h1>Crea</h1>
      <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="btn-primary" onClick={() => navigate("/crea/vino")}>Registra Vino Rosso (AIS)</button>
      </div>
    </div>
  );
}