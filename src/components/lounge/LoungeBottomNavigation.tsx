import {
  CalendarDays,
  Compass,
  House,
  UserCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

type LoungeNavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  match: string;
};

const items: LoungeNavItem[] = [
  { label: "Home", to: "/lounge", icon: House, match: "/lounge" },
  { label: "Discover", to: "/discover", icon: Compass, match: "/discover" },
  { label: "Profilo", to: "/profilo", icon: UserCircle2, match: "/profilo" },
  { label: "Eventi", to: "/eventi", icon: CalendarDays, match: "/eventi" },
];

export default function LoungeBottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <style>{`
        .lounge-bottom-nav-shell {
          position: fixed;
          left: 50%;
          bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
          transform: translateX(-50%);
          z-index: 1350;
          width: min(720px, calc(100vw - 20px));
          display: flex;
          justify-content: center;
          pointer-events: none;
        }

        .lounge-bottom-nav {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          border-radius: 999px;
          border: 1px solid rgba(111, 147, 255, 0.25);
          background: linear-gradient(180deg, rgba(15, 24, 54, 0.84), rgba(8, 14, 34, 0.92));
          backdrop-filter: blur(18px);
          box-shadow: 0 0 30px rgba(38, 119, 255, 0.12), inset 0 1px 0 rgba(255,255,255,0.05);
          pointer-events: auto;
          max-width: 100%;
        }

        .lounge-bottom-pill {
          min-width: 112px;
          border: 1px solid transparent;
          border-radius: 999px;
          padding: 11px 15px;
          background: transparent;
          color: rgba(226, 236, 255, 0.76);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.22s ease, border-color 0.22s ease, background 0.22s ease, color 0.22s ease;
          white-space: nowrap;
          font-weight: 600;
        }

        .lounge-bottom-pill:hover {
          transform: translateY(-1px);
          color: #dcf8ff;
          border-color: rgba(53, 233, 255, 0.35);
          background: rgba(27, 54, 85, 0.28);
        }

        .lounge-bottom-pill--active {
          color: #52f7eb;
          border-color: rgba(61, 245, 236, 0.65);
          background: linear-gradient(180deg, rgba(18, 70, 88, 0.62), rgba(13, 35, 56, 0.78));
          box-shadow: 0 0 18px rgba(61, 245, 236, 0.2), inset 0 0 18px rgba(61, 245, 236, 0.07);
        }

        .lounge-bottom-pill-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
        }

        .lounge-bottom-pill-label {
          font-size: 15px;
          line-height: 1;
        }

        @media (max-width: 768px) {
          .lounge-bottom-nav-shell {
            width: calc(100vw - 14px);
            bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
          }

          .lounge-bottom-nav {
            width: 100%;
            gap: 6px;
            padding: 8px;
          }

          .lounge-bottom-pill {
            min-width: 0;
            flex: 1 1 0;
            padding: 10px 8px;
            gap: 6px;
          }

          .lounge-bottom-pill-label {
            font-size: 12px;
          }
        }

        @media (max-width: 440px) {
          .lounge-bottom-pill {
            padding: 9px 6px;
          }

          .lounge-bottom-pill-label {
            font-size: 11px;
          }
        }
      `}</style>

      <nav className="lounge-bottom-nav-shell" aria-label="Navigazione Lounge">
        <div className="lounge-bottom-nav">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.match ||
              location.pathname.startsWith(`${item.match}/`);

            return (
              <button
                key={item.to}
                className={`lounge-bottom-pill${isActive ? " lounge-bottom-pill--active" : ""}`}
                onClick={() => navigate(item.to)}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="lounge-bottom-pill-icon">
                  <Icon size={18} strokeWidth={2} />
                </span>
                <span className="lounge-bottom-pill-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}