import { useNavigate } from "react-router-dom";
import {
  QrCode,
  CalendarDays,
  Megaphone,
  Wine,
  GlassWater,
  Users,
  Star,
  TrendingUp,
  CreditCard,
  Pencil,
} from "lucide-react";

export default function ProprietarioDashboard() {
  const navigate = useNavigate();

  const kpis = [
    { label: "Check-in QR", value: "1.248" },
    { label: "Clienti Unici", value: "847" },
    { label: "Spesa Media", value: "€18,40" },
    { label: "Recensioni", value: "4.8 ★" },
    { label: "Eventi Creati", value: "12" },
    { label: "Prenotazioni", value: "356" },
  ];

  const operativi = [
    {
      title: "Gestione QR",
      icon: <QrCode size={28} />,
      route: "/proprietario/qr",
    },
    {
      title: "Gestione Eventi",
      icon: <CalendarDays size={28} />,
      route: "/proprietario/eventi",
    },
    {
      title: "Gestione Promozioni",
      icon: <Megaphone size={28} />,
      route: "/proprietario/promozioni",
    },
    {
      title: "Catalogo Drink",
      icon: <GlassWater size={28} />,
      route: "/proprietario/drink",
    },
    {
      title: "Catalogo Vini",
      icon: <Wine size={28} />,
      route: "/proprietario/vini",
    },
    {
      title: "Staff",
      icon: <Users size={28} />,
      route: "/proprietario/staff",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#fff",
        padding: "20px",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: 20,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 15,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              L'Antiquario Napoli
            </h1>

            <div
              style={{
                marginTop: 8,
                color: "#a855f7",
                fontWeight: 600,
              }}
            >
              Piano Premium
            </div>
          </div>

          <button
            onClick={() => navigate("/proprietario/profilo")}
            style={buttonStyle}
          >
            <Pencil size={18} />
            Modifica
          </button>
        </div>
      </div>

      {/* KPI */}

      <h2 style={sectionTitle}>KPI</h2>

      <div style={kpiGrid}>
        {kpis.map((item) => (
          <div key={item.label} style={kpiCard}>
            <div
              style={{
                color: "#94a3b8",
                fontSize: 13,
              }}
            >
              {item.label}
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* OPERATIVO */}

      <h2 style={sectionTitle}>Gestione Locale</h2>

      <div style={grid3}>
        {operativi.map((item) => (
          <div
            key={item.title}
            style={actionCard}
            onClick={() => navigate(item.route)}
          >
            {item.icon}

            <span>{item.title}</span>
          </div>
        ))}
      </div>

      {/* ANALYTICS */}

      <h2 style={sectionTitle}>Analytics</h2>

      <div style={analyticsGrid}>
        <div style={bigCard}>
          <TrendingUp size={30} />

          <h3>Grafico Check-in</h3>

          <div style={placeholder}>
            Grafico check-in ultimi 30 giorni
          </div>
        </div>

        <div style={bigCard}>
          <Users size={30} />

          <h3>Grafico Affluenza</h3>

          <div style={placeholder}>
            Affluenza giornaliera
          </div>
        </div>

        <div style={bigCard}>
          <Users size={30} />

          <h3>Clienti Abituali</h3>

          <div style={placeholder}>
            Top clienti del locale
          </div>
        </div>

        <div style={bigCard}>
          <Wine size={30} />

          <h3>Top Drink Venduti</h3>

          <div style={placeholder}>
            Classifica drink
          </div>
        </div>
      </div>

      {/* RECENSIONI */}

      <h2 style={sectionTitle}>Ultime Recensioni</h2>

      <div style={panelCard}>
        <div style={reviewRow}>
          <Star size={18} color="#f59e0b" />
          Marco R. — Esperienza fantastica
        </div>

        <div style={reviewRow}>
          <Star size={18} color="#f59e0b" />
          Anna M. — Cocktail eccellenti
        </div>

        <div style={reviewRow}>
          <Star size={18} color="#f59e0b" />
          Luca P. — Servizio impeccabile
        </div>
      </div>

      {/* ABBONAMENTO */}

      <h2 style={sectionTitle}>Abbonamento</h2>

      <div style={panelCard}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          Piano Premium Attivo
        </div>

        <button
          style={upgradeButton}
          onClick={() => navigate("/proprietario/upgrade")}
        >
          <CreditCard size={18} />
          Upgrade Piano
        </button>
      </div>
    </div>
  );
}

const sectionTitle = {
  marginTop: 30,
  marginBottom: 15,
  fontSize: 20,
  fontWeight: 700,
};

const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2,1fr)",
  gap: 12,
};

const kpiCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 16,
  padding: 18,
};

const grid3 = {
  display: "grid",
  gridTemplateColumns: "repeat(2,1fr)",
  gap: 12,
};

const actionCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 18,
  padding: 20,
  cursor: "pointer",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  minHeight: 120,
};

const analyticsGrid = {
  display: "grid",
  gap: 12,
};

const bigCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 18,
  padding: 20,
};

const panelCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 18,
  padding: 20,
};

const placeholder = {
  marginTop: 15,
  height: 120,
  borderRadius: 12,
  background: "#020617",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#64748b",
};

const reviewRow = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 0",
};

const buttonStyle = {
  background: "#7c3aed",
  border: "none",
  color: "#fff",
  borderRadius: 12,
  padding: "10px 16px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const upgradeButton = {
  background: "#7c3aed",
  border: "none",
  color: "#fff",
  borderRadius: 12,
  padding: "12px 18px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 10,
};