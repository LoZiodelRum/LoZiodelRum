import {
  House,
  Map,
  QrCode,
  MessageCircle,
  UserCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  match: string;
};

export default function LoungeBottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const leftItems: NavItem[] = [
    {
      label: "Home",
      to: "/lounge",
      icon: House,
      match: "/lounge",
    },
    {
      label: "Mappa",
      to: "/mappa",
      icon: Map,
      match: "/mappa",
    },
  ];

  const rightItems: NavItem[] = [
    {
      label: "Il Baretto",
      to: "/baretto",
      icon: MessageCircle,
      match: "/baretto",
    },
    {
      label: "Profilo",
      to: "/profilo",
      icon: UserCircle2,
      match: "/profilo",
    },
  ];

  const qrActive =
    location.pathname === "/scanner" ||
    location.pathname.startsWith("/scanner/");

  return (
    <>
      <style>{`
        .dw-nav-shell{
          position:fixed;
          left:0;
          right:0;
          bottom:0;
          z-index:9999;
          display:flex;
          justify-content:center;
          pointer-events:none;
        }

        .dw-nav{
          width:100%;
          max-width:720px;
          height:82px;
          background:#081120;
          border-top:1px solid rgba(255,255,255,.08);
          display:flex;
          align-items:center;
          justify-content:space-between;
          padding:0 18px;
          pointer-events:auto;
        }

        .dw-side{
          display:flex;
          align-items:center;
          gap:22px;
        }

        .dw-item{
          background:none;
          border:none;
          color:rgba(255,255,255,.7);
          display:flex;
          flex-direction:column;
          align-items:center;
          gap:4px;
          cursor:pointer;
          min-width:60px;
        }

        .dw-item-active{
          color:#52f7eb;
        }

        .dw-label{
          font-size:11px;
          font-weight:600;
        }

        .dw-qr{
          background:none;
          border:none;
          color:rgba(255,255,255,.7);
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          gap:4px;
          cursor:pointer;
          min-width:60px;
        }

        .dw-qr-active{
          color:#52f7eb;
        }

        @media (max-width:768px){

          .dw-nav{
            padding-bottom:env(safe-area-inset-bottom);
          }

          .dw-side{
            gap:14px;
          }

          .dw-item{
            min-width:54px;
          }

          .dw-label{
            font-size:10px;
          }
        }
      `}</style>

      <div className="dw-nav-shell">
        <nav className="dw-nav">

          <div className="dw-side">
            {leftItems.map((item) => {
              const Icon = item.icon;

              const active =
                location.pathname === item.match ||
                location.pathname.startsWith(item.match + "/");

              return (
                <button
                  key={item.to}
                  className={`dw-item ${
                    active ? "dw-item-active" : ""
                  }`}
                  onClick={() => navigate(item.to)}
                >
                  <Icon size={22} />
                  <span className="dw-label">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            className={`dw-qr ${
              qrActive ? "dw-qr-active" : ""
            }`}
            onClick={() => navigate("/scanner")}
          >
            <QrCode size={22} />
            <span className="dw-label">
              QR
            </span>
          </button>

          <div className="dw-side">
            {rightItems.map((item) => {
              const Icon = item.icon;

              const active =
                location.pathname === item.match ||
                location.pathname.startsWith(item.match + "/");

              return (
                <button
                  key={item.to}
                  className={`dw-item ${
                    active ? "dw-item-active" : ""
                  }`}
                  onClick={() => navigate(item.to)}
                >
                  <Icon size={22} />
                  <span className="dw-label">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

        </nav>
      </div>
    </>
  );
}