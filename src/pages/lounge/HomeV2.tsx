import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Compass,
  Wine,
  CalendarDays,
  MessageCircle,
  QrCode,
  ChevronRight,
} from "lucide-react";

import LoungeBottomNavigation from "../../components/lounge/LoungeBottomNavigation";
import { useUser } from "../../context/UserContext";

export default function HomeV2() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile } = useUser() as any;

  const firstName =
    profile?.username ||
    profile?.nome ||
    profile?.full_name ||
    "Amico";

  return (
    <>
      <LoungeBottomNavigation />

      <div
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, #071326 0%, #020817 45%, #01040d 100%)",
          color: "#fff",
          padding: "20px 16px 140px",
        }}
      >
        {/* HEADER */}

        <div style={{ marginTop: 20 }}>
          <div
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              color: "#52f7eb",
              letterSpacing: 1.5,
            }}
          >
            Buongiorno {firstName} 👋
          </div>

          <h1
            style={{
              marginTop: 8,
              marginBottom: 0,
              fontSize: 32,
              fontWeight: 900,
            }}
          >
            DrinkWise
          </h1>

          <div
            style={{
              opacity: 0.7,
              marginTop: 4,
              fontSize: 14,
            }}
          >
            by Lo Zio del Rum
          </div>
        </div>

        {/* KPI */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: 24,
          }}
        >
          <KpiCard
            icon={<Compass size={18} />}
            title="Discover"
            onClick={() => navigate("/discover")}
          />

          <KpiCard
            icon={<Wine size={18} />}
            title="Drink"
            onClick={() => navigate("/drink")}
          />

          <KpiCard
            icon={<CalendarDays size={18} />}
            title="Eventi"
            onClick={() => navigate("/eventi")}
          />

          <KpiCard
            icon={<MessageCircle size={18} />}
            title="Baretto"
            onClick={() => navigate("/baretto")}
          />
        </div>

        {/* QR */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 26,
            marginBottom: 26,
          }}
        >
          <button
            style={{
              width: 92,
              height: 92,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              background:
                "linear-gradient(135deg,#42f5df,#5df7d3,#6ffff0)",
              color: "#04131e",
              boxShadow: "0 0 35px rgba(66,245,223,.45)",
            }}
          >
            <QrCode size={40} />
          </button>
        </div>

        {/* LOCALI */}

        <SectionCard
          title="Locali vicini a te"
          text="Scopri i migliori locali presenti sulla mappa."
          onClick={() => navigate("/mappa")}
        />

        {/* EVENTI */}

        <SectionCard
          title="Eventi in evidenza"
          text="Scopri degustazioni, masterclass ed eventi."
          onClick={() => navigate("/eventi")}
        />

        {/* ATTIVITÀ */}

        <SectionCard
          title="Attività Live"
          text="Entra nella community e segui le attività."
          onClick={() => navigate("/baretto")}
        />
      </div>
    </>
  );
}

function KpiCard({
  icon,
  title,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: 18,
        cursor: "pointer",
      }}
    >
      <div style={{ marginBottom: 10 }}>{icon}</div>

      <div
        style={{
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        {title}
      </div>
    </div>
  );
}

function SectionCard({
  title,
  text,
  onClick,
}: {
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        marginBottom: 16,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: 18,
        cursor: "pointer",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 800,
          }}
        >
          {title}
        </h3>

        <ChevronRight size={18} />
      </div>

      <p
        style={{
          marginTop: 10,
          marginBottom: 0,
          opacity: 0.75,
        }}
      >
        {text}
      </p>
    </div>
  );
}