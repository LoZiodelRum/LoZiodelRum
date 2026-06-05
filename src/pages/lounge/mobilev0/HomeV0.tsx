import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  ChevronRight,
  Calendar,
  MessageCircle,
  Sparkles,
} from "lucide-react";

interface HomeScreenProps {
  onNavigate?: (tab: string) => void;
}

export default function HomeScreen({
  onNavigate,
}: HomeScreenProps) {
  const navigate = useNavigate();

  const go = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
      return;
    }

    navigate(path);
  };

  const greeting =
    new Date().getHours() >= 18 ||
    new Date().getHours() < 5
      ? "Buonasera"
      : "Buongiorno";

  const user = {
    nome: "Amico",
    livello: 0,
    xp: 0,
    avatar:
      "https://ui-avatars.com/api/?name=DrinkWise",
  };

  const eventiStasera = 0;
  const communityOnline = 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        paddingBottom: "140px",
        color: "#fff",
      }}
    >
      {/* HEADER */}

      <header
        style={{
          padding: "24px 16px 10px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                gap: 6,
                alignItems: "center",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  color: "#52f7eb",
                  margin: 0,
                }}
              >
                {greeting}, {user.nome}
              </p>

              <span>👋</span>
            </div>

            <h1
              style={{
                fontSize: 42,
                fontWeight: 900,
                marginTop: 10,
                marginBottom: 12,
              }}
            >
              DrinkWise
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: 0.7,
              }}
            >
              <MapPin size={16} />
              <span>Posizione non disponibile</span>
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
            }}
          >
            <div
              style={{
                position: "relative",
              }}
            >
              <img
                src={user.avatar}
                alt="avatar"
                style={{
                  width: 78,
                  height: 78,
                  borderRadius: "50%",
                  border: "4px solid #27e3d8",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  background: "#22c55e",
                  color: "#fff",
                  borderRadius: 999,
                  padding: "6px 10px",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                L{user.livello}
              </div>
            </div>

            <div
              style={{
                marginTop: 10,
                opacity: 0.75,
              }}
            >
              {user.xp} XP
            </div>
          </div>
        </div>
      </header>

      {/* BOX KPI */}

      <section
        style={{
          padding: "0 16px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <InfoCard
            title="Consiglio dello Zio"
            value="Rum consigliato"
            icon={<Sparkles size={14} />}
            color="#f59e0b"
            onClick={() => go("/drink")}
          />

          <InfoCard
            title="Eventi Stasera"
            value={String(eventiStasera)}
            icon={<Calendar size={14} />}
            color="#f59e0b"
            onClick={() => go("/eventi")}
          />

          <InfoCard
            title="Community Live"
            value={String(communityOnline)}
            icon={<MessageCircle size={14} />}
            color="#9333ea"
            onClick={() => go("/lounge")}
          />

          <InfoCard
            title="Il Bancone"
            value="Entra nella chat"
            icon={<MessageCircle size={14} />}
            color="#9333ea"
            onClick={() => go("/baretto")}
          />
        </div>
      </section>

      {/* LOCALI */}

      <SectionHeader title="Locali vicini a te" />

      <div
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          padding: "0 16px",
        }}
      >
        <EmptyCard text="Nessun locale disponibile" />
        <EmptyCard text="Nessun locale disponibile" />
      </div>

      {/* EVENTI */}

      <SectionHeader title="Stasera in evidenza" />

      <div
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          padding: "0 16px",
        }}
      >
        <EmptyCard text="Nessun evento disponibile" />
      </div>

      {/* ATTIVITÀ */}

      <SectionHeader title="Attività Live" />

      <div
        style={{
          margin: "0 16px",
          background: "rgba(255,255,255,.04)",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 20,
          padding: 18,
        }}
      >
        Nessuna attività disponibile
      </div>

      {/* COCKTAIL */}

      <SectionHeader title="Nuovi Cocktail" />

      <div
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          padding: "0 16px",
        }}
      >
        <EmptyCard text="Nessun cocktail disponibile" />
      </div>
    </div>
  );
}

function InfoCard({
  title,
  value,
  icon,
  color,
  onClick,
}: any) {
  return (
    <div
      onClick={onClick}
      style={{
        height: 130,
        padding: 16,
        borderRadius: 24,
        cursor: "pointer",
        border: "1px solid rgba(255,255,255,.08)",
        background: "rgba(255,255,255,.03)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            opacity: 0.6,
          }}
        >
          {title}
        </span>

        <div
          style={{
            color,
          }}
        >
          {icon}
        </div>
      </div>

      <div
        style={{
          fontWeight: 800,
          fontSize: 24,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
}: {
  title: string;
}) {
  return (
    <div
      style={{
        padding: "28px 16px 14px",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 22,
          fontWeight: 900,
          textTransform: "uppercase",
        }}
      >
        {title}
      </h2>

      <ChevronRight />
    </div>
  );
}

function EmptyCard({
  text,
}: {
  text: string;
}) {
  return (
    <div
      style={{
        minWidth: 240,
        height: 180,
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,.08)",
        background: "rgba(255,255,255,.03)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "rgba(255,255,255,.6)",
      }}
    >
      {text}
    </div>
  );
