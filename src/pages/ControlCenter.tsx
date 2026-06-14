import { useNavigate } from "react-router-dom";

export default function ControlCenter() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "📊 Dashboard",
      subtitle: "Pannello amministrativo attuale",
      path: "/admin",
    },
    {
      title: "🏢 Locali",
      subtitle: "Gestione globale locali",
      path: "/admin-locali",
    },
    {
      title: "👤 Proprietari",
      subtitle: "Gestione globale proprietari",
      path: "/admin-proprietari",
    },
    {
      title: "🍸 Bartender",
      subtitle: "Gestione globale bartender",
      path: "/admin-bartender",
    },
    {
      title: "📅 Eventi",
      subtitle: "Gestione eventi",
      path: "/admin-eventi",
    },
    {
      title: "🚨 Anomalie",
      subtitle: "Controllo problemi sistema",
      path: "/admin-anomalie",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020B1C",
        color: "white",
        padding: "120px 24px 40px",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          marginBottom: 10,
        }}
      >
        Control Center
      </h1>

      <p
        style={{
          color: "#94a3b8",
          marginBottom: 30,
        }}
      >
        Centro di controllo amministrativo DrinkWise
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: 20,
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            onClick={() => navigate(card.path)}
            style={{
              background: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: 16,
              padding: 24,
              cursor: "pointer",
            }}
          >
            <h2
              style={{
                margin: 0,
                marginBottom: 10,
                color: "#f59e0b",
              }}
            >
              {card.title}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#94a3b8",
              }}
            >
              {card.subtitle}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}