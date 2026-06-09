import { Calendar, MapPin } from "lucide-react";

interface EventCardProps {
  event: {
    id?: string;
    title?: string;
    venue_name?: string;
    image_url?: string;
    time?: string;
  };
  index?: number;
}

export function EventCard({ event }: EventCardProps) {
  const image =
    event?.image_url ||
    "https://via.placeholder.com/600x400?text=DrinkWise";

  return (
    <div
      style={{
        minWidth: 220,
        maxWidth: 220,
        borderRadius: 18,
        overflow: "hidden",
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
          alt={event?.title || "Evento"}
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
            color: "#fff",
            marginBottom: 8,
          }}
        >
          {event?.title || "Nessun evento disponibile"}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            opacity: 0.7,
            color: "#fff",
            marginBottom: 6,
          }}
        >
          <MapPin size={14} />
          <span>{event?.venue_name || "-"}</span>
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
          <Calendar size={14} />
          <span>{event?.time || "-"}</span>
        </div>
      </div>
    </div>
  );
}