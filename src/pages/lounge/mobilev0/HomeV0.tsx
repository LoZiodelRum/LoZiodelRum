import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, MessageCircle, Sparkles } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import { useUser } from "../../../context/UserContext";

type Venue = {
  id: string;
  nome: string;
  citta?: string | null;
  indirizzo?: string | null;
  image_url?: string | null;
  image?: string | null;
};

export default function HomeV0() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    loadVenues();
  }, []);

  async function loadVenues() {
    const { data } = await supabase
      .from("Locali")
      .select("id,nome,citta,indirizzo,image,image_url")
      .or("status.eq.approved,approvato.eq.true")
      .limit(6);

    setVenues(data || []);
  }

  const greeting =
    new Date().getHours() >= 18 ||
    new Date().getHours() < 5
      ? "Buonasera"
      : "Buongiorno";

  const displayName =
    user?.user_metadata?.username ||
    "User";

  return (
    <div
      style={{
        minHeight: "100vh",
        color: "#fff",
        paddingBottom: "180px",
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
                {greeting}, {displayName}
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
              <span>Community Beverage Network</span>
            </div>
          </div>

          <div
            style={{
              width: 78,
              height: 78,
              borderRadius: "50%",
              border: "4px solid #27e3d8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 22,
            }}
          >
            U
          </div>
        </div>
      </header>

      {/* KPI */}

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
            title="Discover"
            value="Esplora"
            icon={<Sparkles size={14} />}
            color="#52f7eb"
            onClick={() => navigate("/discover")}
          />

          <InfoCard
            title="Mappa"
            value={String(venues.length)}
            icon={<MapPin size={14} />}
            color="#52f7eb"
            onClick={() => navigate("/mappa")}
          />

          <InfoCard
            title="Eventi"
            value="0"
            icon={<Calendar size={14} />}
            color="#f59e0b"
            onClick={() => navigate("/eventi")}
          />

          <InfoCard
            title="Baretto"
            value="Live"
            icon={<MessageCircle size={14} />}
            color="#9333ea"
            onClick={() => navigate("/baretto")}
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
        {venues.length === 0 ? (
          <EmptyCard text="Nessun locale disponibile" />
        ) : (
          venues.map((venue) => (
            <VenuePreview
              key={venue.id}
              venue={venue}
              onClick={() => navigate(`/venue/${venue.id}`)}
            />
          ))
        )}
      </div>

      {/* EVENTI */}

      <SectionHeader title="Eventi" />

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

function VenuePreview({
  venue,
  onClick,
}: {
  venue: Venue;
  onClick: () => void;
}) {
  const image =
    venue.image_url ||
    venue.image ||
    "https://via.placeholder.com/600x400?text=DrinkWise";

  return (
    <div
      onClick={onClick}
      style={{
        minWidth: 220,
        maxWidth: 220,
        cursor: "pointer",
        borderRadius: 20,
        overflow: "hidden",
        background: "rgba(255,255,255,.04)",
        border: "1px solid rgba(255,255,255,.08)",
      }}
    >
      <img
        src={image}
        alt={venue.nome}
        style={{
          width: "100%",
          height: 140,
          objectFit: "cover",
        }}
      />

      <div style={{ padding: 12 }}>
        <div
          style={{
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          {venue.nome}
        </div>

        <div
          style={{
            fontSize: 12,
            opacity: 0.7,
          }}
        >
          {venue.citta || venue.indirizzo || "-"}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, value, icon, color, onClick }: any) {
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

        <div style={{ color }}>{icon}</div>
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

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        padding: "28px 16px 14px",
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
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
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
}