import { MapPin } from "lucide-react";

interface VenueCardProps {
  venue: {
    id: string;
    nome?: string;
    citta?: string | null;
    indirizzo?: string | null;
    image_url?: string | null;
    image?: string | null;
  };
  index?: number;
}

export function VenueCard({ venue }: VenueCardProps) {
  const image =
    venue.image_url ||
    venue.image ||
    "https://via.placeholder.com/600x400?text=DrinkWise";

  const location =
    venue.citta ||
    venue.indirizzo ||
    "Posizione non disponibile";

  return (
    <div
      style={{
        minWidth: 220,
        maxWidth: 220,
        borderRadius: 18,
        overflow: "hidden",
        cursor: "pointer",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          height: 130,
          overflow: "hidden",
        }}
      >
        <img
          src={image}
          alt={venue.nome || "Locale"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      <div
        style={{
          padding: 12,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 15,
            marginBottom: 8,
            color: "#fff",
          }}
        >
          {venue.nome || "Locale"}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            opacity: 0.7,
            color: "#fff",
          }}
        >
          <MapPin size={14} />
          <span>{location}</span>
        </div>
      </div>
    </div>
  );
}