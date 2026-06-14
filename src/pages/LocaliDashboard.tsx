import { useNavigate } from "react-router-dom";

export default function LocaliDashboard() {
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
        DASHBOARD LOCALI
      </h1>

      <p
        style={{
          color: "#94a3b8",
          marginBottom: 30,
        }}
      >
        Gestione completa dei locali registrati
      </p>
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 12,
    marginBottom: 30,
  }}
>
  <div style={kpiStyle}>
    <h2>23</h2>
    <span>Locali Totali</span>
  </div>

  <div style={kpiStyle}>
    <h2>5</h2>
    <span>Premium</span>
  </div>

  <div style={kpiStyle}>
    <h2>18</h2>
    <span>Entry</span>
  </div>

  <div style={kpiStyle}>
    <h2>0</h2>
    <span>Executive</span>
  </div>
</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 16,
        }}
      >
        <div
  style={cardStyle}
  onClick={() => navigate("/locali-elenco")}
>
  📋 Elenco Locali
</div>
        <div style={cardStyle}>➕ Nuovo Locale</div>
        <div style={cardStyle}>⭐ Locali Premium</div>
        <div style={cardStyle}>📍 Geolocalizzazione</div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 12,
  height: 90,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18,
  fontWeight: 700,
  cursor: "pointer",
};
const kpiStyle = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 12,
  padding: 20,
  textAlign: "center" as const,
};