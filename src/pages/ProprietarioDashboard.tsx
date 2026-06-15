import { useNavigate } from "react-router-dom";
import {
  Home,
  QrCode,
  Users,
  Calendar,
  Star,
  Megaphone,
  BarChart3,
  AlertTriangle,
  Crown,
  ChevronRight,
  Bell,
  Menu,
  MapPin,
  Wallet,
  TrendingUp,
  MessageSquare,
  ScanLine,
} from "lucide-react";

export default function ProprietarioDashboard() {
  const navigate = useNavigate();
  const cardStyle: React.CSSProperties = {
    background: "#1c1c1e",
    borderRadius: 20,
    padding: 16,
    border: "1px solid rgba(255,255,255,0.06)",
  };

  const sectionTitle: React.CSSProperties = {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 12,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f10",
        color: "#fff",
        paddingBottom: 110,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: "20px 18px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              color: "#9a9a9a",
            }}
          >
            Dashboard Proprietario
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              marginTop: 2,
            }}
          >
            DrinkWise
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
          }}
        >
          <button
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              border: "none",
              background: "#1c1c1e",
              color: "#fff",
            }}
          >
            <Bell size={18} />
          </button>

          <button
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              border: "none",
              background: "#1c1c1e",
              color: "#fff",
            }}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      <div
        style={{
          padding: "0 18px",
        }}
      >
        {/* HERO */}
        <div
          style={{
            background:
              "linear-gradient(135deg,#d97706 0%,#f59e0b 45%,#fbbf24 100%)",
            borderRadius: 28,
            padding: 22,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              fontSize: 13,
              opacity: 0.9,
            }}
          >
            Locale
          </div>

          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              marginTop: 4,
            }}
          >
            Nome Locale
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 8,
              fontSize: 14,
            }}
          >
            <MapPin size={14} />
            Città
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 20,
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.18)",
                padding: "8px 12px",
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Piano Base
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.18)",
                padding: "8px 12px",
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Attivo
            </div>
          </div>
        </div>

        {/* KPI */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            {
              icon: <Users size={18} />,
              title: "Check-in",
              value: "0",
            },
            {
              icon: <Wallet size={18} />,
              title: "Incassi",
              value: "0€",
            },
            {
              icon: <Star size={18} />,
              title: "Recensioni",
              value: "0",
            },
            {
              icon: <TrendingUp size={18} />,
              title: "Punteggio",
              value: "0",
            },
          ].map((item) => (
            <div key={item.title} style={cardStyle}>
              <div
                style={{
                  color: "#f59e0b",
                  marginBottom: 10,
                }}
              >
                {item.icon}
              </div>

              <div
                style={{
                  color: "#9a9a9a",
                  fontSize: 13,
                }}
              >
                {item.title}
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  marginTop: 4,
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* QR */}
        <div
  onClick={() => navigate("/proprietario/qr")}
  style={{
    ...cardStyle,
    marginBottom: 14,
    cursor: "pointer",
  }}
>
          <div style={sectionTitle}>Gestione QR</div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  color: "#9a9a9a",
                }}
              >
                QR locale
              </div>

              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginTop: 4,
                }}
              >
                Non configurato
              </div>
            </div>

            <ScanLine size={34} />
          </div>
        </div>

        {/* CHECKIN */}
        <div style={{ ...cardStyle, marginBottom: 14 }}>
          <div style={sectionTitle}>Check-in Live</div>

          <div
            style={{
              textAlign: "center",
              padding: "10px 0",
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontWeight: 800,
              }}
            >
              0
            </div>

            <div
              style={{
                color: "#9a9a9a",
              }}
            >
              utenti presenti
            </div>
          </div>
        </div>

        {/* EVENTI */}
        <div style={{ ...cardStyle, marginBottom: 14 }}>
          <div style={sectionTitle}>Eventi</div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Nessun evento programmato</span>
            <ChevronRight size={18} />
          </div>
        </div>

        {/* STATISTICHE */}
        <div style={{ ...cardStyle, marginBottom: 14 }}>
          <div style={sectionTitle}>Statistiche</div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
            }}
          >
            <div
              style={{
                background: "#111",
                borderRadius: 16,
                padding: 12,
                textAlign: "center",
              }}
            >
              <div>0</div>
              <small>Visite</small>
            </div>

            <div
              style={{
                background: "#111",
                borderRadius: 16,
                padding: 12,
                textAlign: "center",
              }}
            >
              <div>0</div>
              <small>Click</small>
            </div>

            <div
              style={{
                background: "#111",
                borderRadius: 16,
                padding: 12,
                textAlign: "center",
              }}
            >
              <div>0</div>
              <small>Utenti</small>
            </div>
          </div>
        </div>

        {/* PROMO */}
        <div style={{ ...cardStyle, marginBottom: 14 }}>
          <div style={sectionTitle}>Promozioni</div>

          <div
            style={{
              color: "#9a9a9a",
            }}
          >
            Nessuna promozione attiva
          </div>
        </div>

        {/* RECENSIONI */}
        <div style={{ ...cardStyle, marginBottom: 14 }}>
          <div style={sectionTitle}>Recensioni</div>

          <div
            style={{
              color: "#9a9a9a",
            }}
          >
            Nessuna recensione disponibile
          </div>
        </div>

        {/* MENU */}
        <div style={{ ...cardStyle, marginBottom: 14 }}>
          <div style={sectionTitle}>Menu Locale</div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>0 prodotti caricati</span>
            <ChevronRight size={18} />
          </div>
        </div>

        {/* CLIENTI */}
        <div style={{ ...cardStyle, marginBottom: 14 }}>
          <div style={sectionTitle}>Clienti</div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>0 clienti registrati</span>
            <ChevronRight size={18} />
          </div>
        </div>

        {/* PREMIUM */}
        <div
          style={{
            background:
              "linear-gradient(135deg,#4f46e5,#7c3aed,#9333ea)",
            borderRadius: 24,
            padding: 18,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <Crown size={18} />
            <strong>DrinkWise Premium</strong>
          </div>

          <div
            style={{
              fontSize: 14,
              opacity: 0.9,
            }}
          >
            Sblocca funzioni avanzate e maggiore visibilità.
          </div>
        </div>

        {/* SEGNALAZIONI */}
        <div style={{ ...cardStyle, marginBottom: 30 }}>
          <div style={sectionTitle}>Segnalazioni</div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Nessuna segnalazione</span>
            <AlertTriangle size={18} />
          </div>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#161617",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "space-around",
          padding: "12px 0 20px",
          zIndex: 100,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            color: "#f59e0b",
          }}
        >
          <Home size={20} />
          <span style={{ fontSize: 11 }}>Home</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <QrCode size={20} />
          <span style={{ fontSize: 11 }}>QR</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Calendar size={20} />
          <span style={{ fontSize: 11 }}>Eventi</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <BarChart3 size={20} />
          <span style={{ fontSize: 11 }}>Stats</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <MessageSquare size={20} />
          <span style={{ fontSize: 11 }}>Chat</span>
        </div>
      </div>
    </div>
  );
}