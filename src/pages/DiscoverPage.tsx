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
  bgGradient: string;
  borderColor: string;
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
    bgGradient: "linear-gradient(135deg, rgba(92, 46, 12, 0.85), rgba(28, 16, 10, 0.95))",
    borderColor: "rgba(245, 166, 35, 0.55)",
    accent: "#f5a623",
    glow: "rgba(245, 166, 35, 0.18)",
  },
  {
    id: "cocktail-bars",
    title: "Cocktail Bars",
    subtitle: "Mixology d'autore",
    icon: GlassWater,
    to: "/venues",
    bgGradient: "linear-gradient(135deg, rgba(92, 30, 20, 0.85), rgba(24, 12, 12, 0.95))",
    borderColor: "rgba(211, 93, 48, 0.55)",
    accent: "#d35d30",
    glow: "rgba(211, 93, 48, 0.18)",
  },
  {
    id: "rum-rooms",
    title: "Rum Rooms",
    subtitle: "Disponibile presto",
    icon: FlaskConical,
    bgGradient: "linear-gradient(135deg, rgba(117, 64, 20, 0.85), rgba(31, 17, 8, 0.95))",
    borderColor: "rgba(198, 111, 34, 0.55)",
    accent: "#c66f22",
    glow: "rgba(198, 111, 34, 0.18)",
    placeholder: true,
  },
  {
    id: "whisky-clubs",
    title: "Whisky Clubs",
    subtitle: "Disponibile presto",
    icon: Wine,
    bgGradient: "linear-gradient(135deg, rgba(72, 38, 13, 0.85), rgba(20, 12, 7, 0.95))",
    borderColor: "rgba(184, 124, 45, 0.55)",
    accent: "#b87c2d",
    glow: "rgba(184, 124, 45, 0.18)",
    placeholder: true,
  },
  {
    id: "signature-drinks",
    title: "Signature Drinks",
    subtitle: "Servite curate",
    icon: Star,
    to: "/drink",
    bgGradient: "linear-gradient(135deg, rgba(87, 22, 32, 0.85), rgba(25, 8, 13, 0.95))",
    borderColor: "rgba(184, 65, 76, 0.55)",
    accent: "#b8414c",
    glow: "rgba(184, 65, 76, 0.18)",
  },
  {
    id: "bartender-picks",
    title: "Bartender Picks",
    subtitle: "Consigli esperti",
    icon: User,
    to: "/baretto",
    bgGradient: "linear-gradient(135deg, rgba(28, 76, 55, 0.85), rgba(9, 24, 18, 0.95))",
    borderColor: "rgba(92, 158, 121, 0.55)",
    accent: "#5c9e79",
    glow: "rgba(92, 158, 121, 0.18)",
  },
  {
    id: "guest-shifts",
    title: "Guest Shifts",
    subtitle: "Notti speciali",
    icon: CalendarDays,
    to: "/eventi",
    bgGradient: "linear-gradient(135deg, rgba(69, 39, 81, 0.85), rgba(18, 10, 25, 0.95))",
    borderColor: "rgba(151, 91, 175, 0.55)",
    accent: "#975baf",
    glow: "rgba(151, 91, 175, 0.18)",
  },
  {
    id: "events",
    title: "Events",
    subtitle: "Esperienze live",
    icon: CalendarDays,
    to: "/eventi",
    bgGradient: "linear-gradient(135deg, rgba(97, 50, 19, 0.85), rgba(27, 13, 7, 0.95))",
    borderColor: "rgba(230, 126, 34, 0.55)",
    accent: "#e67e22",
    glow: "rgba(230, 126, 34, 0.18)",
  },
  {
    id: "pairings",
    title: "Pairings",
    subtitle: "Disponibile presto",
    icon: Sparkles,
    bgGradient: "linear-gradient(135deg, rgba(76, 59, 30, 0.85), rgba(22, 17, 9, 0.95))",
    borderColor: "rgba(207, 160, 82, 0.55)",
    accent: "#cfa052",
    glow: "rgba(207, 160, 82, 0.18)",
    placeholder: true,
  },
  {
    id: "bottle-collection",
    title: "Bottle Collection",
    subtitle: "Disponibile presto",
    icon: Wine,
    bgGradient: "linear-gradient(135deg, rgba(54, 37, 24, 0.85), rgba(17, 11, 8, 0.95))",
    borderColor: "rgba(143, 93, 52, 0.55)",
    accent: "#8f5d34",
    glow: "rgba(143, 93, 52, 0.18)",
    placeholder: true,
  },
  {
    id: "experiences",
    title: "Experiences",
    subtitle: "Momenti premium",
    icon: Sparkles,
    to: "/eventi",
    bgGradient: "linear-gradient(135deg, rgba(18, 57, 66, 0.85), rgba(7, 20, 24, 0.95))",
    borderColor: "rgba(67, 138, 150, 0.55)",
    accent: "#438a96",
    glow: "rgba(67, 138, 150, 0.18)",
  },
  {
    id: "new-openings",
    title: "New Openings",
    subtitle: "Freschi nel network",
    icon: Compass,
    to: "/venues",
    bgGradient: "linear-gradient(135deg, rgba(84, 66, 31, 0.85), rgba(22, 17, 8, 0.95))",
    borderColor: "rgba(218, 165, 32, 0.55)",
    accent: "#daa520",
    glow: "rgba(218, 165, 32, 0.18)",
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
          border: 1px solid var(--card-border);
          background: var(--card-bg);
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
                  ["--card-bg" as string]: card.bgGradient,
                  ["--card-border" as string]: card.borderColor,
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
