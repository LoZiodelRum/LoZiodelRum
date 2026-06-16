import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
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
  const [venueQrId, setVenueQrId] = useState("");
  const [locale, setLocale] = useState<any>(null);
  useEffect(() => {
  async function loadVenueQr() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: locale } = await supabase
      .from("Locali")
      .select("*")
      .eq("proprietario_id", user.id)
      .single();
console.log("USER ID:", user.id);
console.log("LOCALE TROVATO:", locale);

setLocale(locale);

    if (locale?.venue_qr_id) {
      setVenueQrId(locale.venue_qr_id);
    }
  }

  loadVenueQr();
}, []);
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
    padding: "14px 16px",
    marginBottom: 18,
    display: "flex",
    alignItems: "center",
    gap: 18,
    minHeight: 140,
  }}
>
  {/* QR */}
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      flexShrink: 0,
    }}
  >
    {venueQrId && (
  <div
    style={{
      background: "#ffffff",
      padding: 3,
      borderRadius: 8,
    }}
  >
    <QRCode
      value={venueQrId}
      size={100}
      bgColor="#ffffff"
      fgColor="#000000"
    />
  </div>
)}

    <button
      onClick={() => {
        const canvas = document.querySelector("canvas");
        if (!canvas) return;

        const link = document.createElement("a");
        link.download = `${locale?.nome || "drinkwise"}-qr.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }}
      style={{
        marginTop: 10,
        padding: "7px 14px",
        borderRadius: 10,
        border: "none",
        background: "#c97d2a",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: 13,
      }}
    >
      Scarica
    </button>
  </div>

  {/* INFO LOCALE */}
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        fontSize: 28,
        maxWidth: 180,
overflow: "hidden",
textOverflow: "ellipsis",
        fontWeight: 800,
        lineHeight: 1.1,
      }}
    >
      {locale?.nome || "Nome Locale"}
    </div>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: 12,
        fontSize: 15,
      }}
    >
      <MapPin size={18} />
      {locale?.citta || "Città"}
    </div>

    <div
      style={{
        display: "flex",
        gap: 10,
        marginTop: 16,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.18)",
          padding: "6px 10px",
          borderRadius: 14,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        Piano Base
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.18)",
          padding: "8px 14px",
          borderRadius: 14,
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        Attivo
      </div>
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
    flexDirection: "column",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  }}
>
  {venueQrId && (
    <>
      <QRCode
        value={venueQrId}
        size={140}
        bgColor="#ffffff"
        fgColor="#000000"
      />
    </>
  )}
</div>
         <div
  onClick={() => navigate("/gestione-qr")}
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
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
                fontSize: 28,
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
                padding: 8,
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
                padding: 8,
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
                padding: 8,
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