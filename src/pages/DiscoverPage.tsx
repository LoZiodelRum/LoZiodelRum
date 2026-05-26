import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Compass,
  FlaskConical,
  GlassWater,
  MapPin,
  Search,
  Sparkles,
  Star,
  User,
  Wine,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import LoungeBottomNavigation from "../components/lounge/LoungeBottomNavigation";

type DiscoverCard = {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  to?: string;
  accent: string;
  glow: string;
  placeholder?: boolean;
};

const cards: DiscoverCard[] = [
  {
    id: "premium-bars",
    title: "Premium Bars",
    subtitle: "Top venue vicino a te",
    icon: MapPin,
    to: "/locali-vicini",
    accent: "#2cf7e4",
    glow: "rgba(44,247,228,0.26)",
  },
  {
    id: "cocktail-bars",
    title: "Cocktail Bars",
    subtitle: "Mixology d'autore",
    icon: GlassWater,
    to: "/venues",
    accent: "#4f7bff",
    glow: "rgba(79,123,255,0.24)",
  },
  {
    id: "rum-rooms",
    title: "Rum Rooms",
    subtitle: "Disponibile presto",
    icon: FlaskConical,
    accent: "#ff8f3d",
    glow: "rgba(255,143,61,0.26)",
    placeholder: true,
  },
  {
    id: "whisky-clubs",
    title: "Whisky Clubs",
    subtitle: "Disponibile presto",
    icon: Wine,
    accent: "#f5cf38",
    glow: "rgba(245,207,56,0.22)",
    placeholder: true,
  },
  {
    id: "signature-drinks",
    title: "Signature Drinks",
    subtitle: "Servite curate",
    icon: Star,
    to: "/drink",
    accent: "#f751b4",
    glow: "rgba(247,81,180,0.24)",
  },
  {
    id: "bartender-picks",
    title: "Bartender Picks",
    subtitle: "Consigli esperti",
    icon: User,
    to: "/baretto",
    accent: "#00d9e6",
    glow: "rgba(0,217,230,0.22)",
  },
  {
    id: "guest-shifts",
    title: "Guest Shifts",
    subtitle: "Notti speciali",
    icon: CalendarDays,
    to: "/eventi",
    accent: "#9f66ff",
    glow: "rgba(159,102,255,0.24)",
  },
  {
    id: "events",
    title: "Events",
    subtitle: "Esperienze live",
    icon: CalendarDays,
    to: "/eventi",
    accent: "#ff6a2f",
    glow: "rgba(255,106,47,0.24)",
  },
  {
    id: "pairings",
    title: "Pairings",
    subtitle: "Disponibile presto",
    icon: Sparkles,
    accent: "#58df70",
    glow: "rgba(88,223,112,0.22)",
    placeholder: true,
  },
  {
    id: "bottle-collection",
    title: "Bottle Collection",
    subtitle: "Disponibile presto",
    icon: Wine,
    accent: "#8f70ff",
    glow: "rgba(143,112,255,0.26)",
    placeholder: true,
  },
  {
    id: "experiences",
    title: "Experiences",
    subtitle: "Momenti premium",
    icon: Sparkles,
    to: "/eventi",
    accent: "#2cb6ff",
    glow: "rgba(44,182,255,0.24)",
  },
  {
    id: "new-openings",
    title: "New Openings",
    subtitle: "Freschi nel network",
    icon: Compass,
    to: "/venues",
    accent: "#14d6b2",
    glow: "rgba(20,214,178,0.24)",
  },
];

export default function DiscoverPage() {
  const navigate = useNavigate();

  return (
    <div
      className="discover-page-root"
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #071326 0%, #020817 45%, #01040d 100%)",
        color: "#eef6ff",
        padding: "120px 24px 40px",
        overflowX: "hidden",
      }}
    >
      <LoungeBottomNavigation />

      <style>{`
        .discover-shell {
          width: min(860px, 100%);
          margin: 0 auto;
          font-family: "Sora", "Segoe UI", sans-serif;
        }

        .discover-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .discover-title {
          margin: 0;
          font-size: clamp(34px, 6.2vw, 58px);
          line-height: 1;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #ffffff;
        }

        .discover-subtitle {
          margin: 8px 0 0;
          font-size: clamp(16px, 2.4vw, 30px);
          color: rgba(229, 238, 255, 0.86);
        }

        .discover-subtitle b {
          color: #2cf7e4;
          font-weight: 600;
        }

        .discover-search {
          width: clamp(62px, 12.8vw, 88px);
          height: clamp(62px, 12.8vw, 88px);
          border-radius: 22px;
          border: 1px solid rgba(116, 157, 255, 0.52);
          background: linear-gradient(160deg, rgba(20, 36, 88, 0.6), rgba(4, 13, 35, 0.95));
          color: #e4eeff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 22px rgba(61, 109, 255, 0.2);
          cursor: pointer;
          flex: 0 0 auto;
        }

        .discover-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .discover-card {
          position: relative;
          width: 100%;
          min-height: 122px;
          padding: 16px 14px;
          border-radius: 24px;
          border: 1px solid var(--accent);
          background: linear-gradient(145deg, color-mix(in srgb, var(--accent) 13%, #071127 87%), rgba(4, 11, 30, 0.95));
          box-shadow: 0 0 26px var(--glow), inset 0 0 30px rgba(255, 255, 255, 0.02);
          display: flex;
          align-items: center;
          gap: 12px;
          color: #f7fbff;
          text-align: left;
          overflow: hidden;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          cursor: pointer;
        }

        .discover-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 105% -15%, color-mix(in srgb, var(--accent) 24%, transparent), transparent 58%);
          pointer-events: none;
        }

        .discover-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 34px var(--glow), inset 0 0 30px rgba(255, 255, 255, 0.04);
        }

        .discover-card[aria-disabled="true"] {
          cursor: default;
          opacity: 0.95;
        }

        .discover-icon {
          width: 54px;
          height: 54px;
          border-radius: 999px;
          border: 1px solid color-mix(in srgb, var(--accent) 75%, #ffffff 25%);
          background: radial-gradient(circle at 25% 20%, color-mix(in srgb, var(--accent) 34%, #ffffff 66%), color-mix(in srgb, var(--accent) 12%, transparent));
          box-shadow: 0 0 18px color-mix(in srgb, var(--accent) 34%, transparent);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          color: #f8fdff;
        }

        .discover-card-title {
          margin: 0;
          font-size: clamp(17px, 2vw, 31px);
          line-height: 1.1;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .discover-card-subtitle {
          margin: 6px 0 0;
          font-size: clamp(13px, 1.6vw, 21px);
          line-height: 1.24;
          color: rgba(227, 238, 255, 0.84);
        }

        .discover-banner {
          margin-top: 14px;
          border-radius: 26px;
          border: 1px solid rgba(73, 122, 255, 0.45);
          background: linear-gradient(150deg, rgba(10, 23, 58, 0.95), rgba(4, 11, 29, 0.95));
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          box-shadow: 0 0 24px rgba(30, 125, 255, 0.2);
          overflow: hidden;
        }

        .discover-banner h3 {
          margin: 0;
          font-size: clamp(24px, 4vw, 42px);
          line-height: 1;
        }

        .discover-banner p {
          margin: 8px 0 0;
          color: rgba(224, 236, 255, 0.8);
          font-size: clamp(14px, 2vw, 23px);
          max-width: 62ch;
        }

        .discover-banner-orb {
          width: clamp(78px, 19vw, 154px);
          height: clamp(78px, 19vw, 154px);
          border-radius: 50%;
          border: 1px solid rgba(65, 250, 228, 0.62);
          background:
            radial-gradient(circle at 32% 30%, rgba(123, 252, 239, 0.5), transparent 43%),
            radial-gradient(circle at 65% 64%, rgba(48, 180, 255, 0.34), transparent 48%),
            rgba(8, 28, 57, 0.8);
          box-shadow: 0 0 20px rgba(63, 230, 255, 0.28);
        }

        @media (max-width: 980px) {
          .discover-shell {
            width: min(720px, 100%);
          }

          .discover-page-root {
            padding: 100px 14px 40px !important;
          }

          .discover-card {
            min-height: 110px;
            border-radius: 20px;
            padding: 14px 12px;
            gap: 10px;
          }

          .discover-icon {
            width: 46px;
            height: 46px;
          }

          .discover-search {
            border-radius: 18px;
          }
        }

        @media (max-width: 520px) {
          .discover-grid {
            gap: 10px;
          }

          .discover-card {
            min-height: 100px;
            border-radius: 18px;
            padding: 12px 10px;
          }

          .discover-icon {
            width: 40px;
            height: 40px;
          }

          .discover-banner {
            border-radius: 20px;
            padding: 12px;
          }
        }
      `}</style>

      <section className="discover-shell">
        <header className="discover-header">
          <div>
            <h1 className="discover-title">Discover</h1>
            <p className="discover-subtitle">Esplora l&apos;universo <b>DrinkWise</b></p>
          </div>
          <button className="discover-search" aria-label="Ricerca">
            <Search size={34} strokeWidth={2.1} />
          </button>
        </header>

        <div className="discover-grid">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                className="discover-card"
                style={{
                  ["--accent" as string]: card.accent,
                  ["--glow" as string]: card.glow,
                }}
                onClick={() => {
                  if (card.to) navigate(card.to);
                }}
                aria-disabled={card.placeholder ? "true" : "false"}
              >
                <span className="discover-icon">
                  <Icon size={22} strokeWidth={2.1} />
                </span>
                <span>
                  <p className="discover-card-title">{card.title}</p>
                  <p className="discover-card-subtitle">
                    {card.subtitle}
                  </p>
                </span>
              </button>
            );
          })}
        </div>

        <div className="discover-banner">
          <div>
            <h3>Discover</h3>
            <p>Scopri locali, degustazioni, eventi e raccomandazioni in un unico spazio.</p>
          </div>
          <div className="discover-banner-orb" aria-hidden="true" />
        </div>

        <div style={{ height: 140 }} />
      </section>
    </div>
  );
}
