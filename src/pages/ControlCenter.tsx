import { useNavigate } from "react-router-dom";
export default function ControlCenter() {
  const navigate = useNavigate();
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020B1C",
        color: "white",
        padding: "120px 30px",
      }}
    >
      <h1
        style={{
          color: "#f59e0b",
          fontSize: "42px",
          marginBottom: 10,
          fontWeight: 800,
        }}
      >
        CONTROL CENTER
      </h1>

      <p
        style={{
          color: "#94a3b8",
          marginBottom: 30,
        }}
      >
        Gestione globale della piattaforma DrinkWise
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,180px))",
          gap: 10,
        }}
      >
        <div
  style={cardStyle}
  onClick={() => navigate("/locali-dashboard")}
>
  🏢 Locali
</div>

<div
  style={cardStyle}
  onClick={() => navigate("/proprietario")}
>
  👤 Proprietari
</div>

<div
  style={cardStyle}
  onClick={() => navigate("/eventi-dashboard")}
>
  📅 Eventi
</div>

<div
  style={cardStyle}
  onClick={() => navigate("/anomalie-dashboard")}
>
  🚨 Anomalie
</div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 12,
  height: 70,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 16,
  fontWeight: 700,
  textAlign: "center" as const,
  cursor: "pointer",
};