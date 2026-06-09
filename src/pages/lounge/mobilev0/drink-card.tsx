import { Sparkles } from "lucide-react";

interface DrinkCardProps {
  drink: {
    id?: string;
    name?: string;
    venue_name?: string;
    image_url?: string;
    price?: number | string;
  };
  index?: number;
}

export function DrinkCard({ drink }: DrinkCardProps) {
  const image =
    drink?.image_url ||
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
          alt={drink?.name || "Drink"}
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
          {drink?.name || "Drink non disponibile"}
        </div>

        <div
          style={{
            fontSize: 12,
            opacity: 0.7,
            color: "#fff",
            marginBottom: 10,
          }}
        >
          {drink?.venue_name || "-"}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              color: "#52f7eb",
            }}
          >
            {drink?.price ? `€${drink.price}` : "-"}
          </span>

          <Sparkles size={16} color="#52f7eb" />
        </div>
      </div>
    </div>
  );
}