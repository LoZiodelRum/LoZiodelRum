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
      label: "Lounge",
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
          position:relative;
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
          position:absolute;
          left:50%;
          top:-20px;
          transform:translateX(-50%);
          width:68px;
          height:68px;
          border-radius:40%;
          border:4px solid #081120;
          background:linear-gradient(
            135deg,
            #f5b942,
            #ffd978
          );
          display:flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
          box-shadow:
            0 0 0 8px rgba(245,185,66,.08),
            0 0 30px rgba(245,185,66,.35);
        }

        .dw-qr svg{
          color:#081120;
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
            className="dw-qr"
            onClick={() => navigate("/scanner")}
          >
            <QrCode size={34} />
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