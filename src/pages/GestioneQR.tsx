import QRCode from "react-qr-code";
import { useState } from "react";
import {
  ArrowLeft,
  QrCode,
  Users,
  Calendar,
  BarChart3,
  MessageSquare,
  Home,
  Printer,
  Bluetooth,
  CheckCircle,
  X,
} from "lucide-react";

export default function GestioneQR() {
  const [showModal, setShowModal] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [drinkCount, setDrinkCount] = useState(3);
  const [totaleSpeso, setTotaleSpeso] = useState("28");

  const utentiPresenti = [
    {
      id: 1,
      username: "@mario88",
      checkin: "21:14",
    },
    {
      id: 2,
      username: "@rumlover",
      checkin: "21:37",
    },
    {
      id: 3,
      username: "@cocktailgirl",
      checkin: "22:01",
    },
    {
      id: 4,
      username: "@whiskylife",
      checkin: "22:08",
    },
  ];

  const cronologia = [
    {
      username: "@ginlover",
      checkin: "20:15",
      checkout: "22:07",
      drink: 3,
      totale: "26€",
    },
    {
      username: "@rumfan",
      checkin: "21:02",
      checkout: "22:31",
      drink: 2,
      totale: "18€",
    },
  ];

  const cardStyle: React.CSSProperties = {
    background: "#1c1c1e",
    borderRadius: 20,
    padding: 16,
    border: "1px solid rgba(255,255,255,0.06)",
  };

  const sectionTitle: React.CSSProperties = {
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 12,
  };

  const openCheckout = (user: any) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const generateQR = () => {
    setShowModal(false);
    setShowQR(true);
  };

  return (
    <>
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
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                color: "#9a9a9a",
                fontSize: 13,
              }}
            >
              DrinkWise
            </div>

            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
              }}
            >
              Gestione QR
            </div>
          </div>

          <div
            style={{
              background: "#1c1c1e",
              padding: "8px 12px",
              borderRadius: 14,
              color: "#00d84a",
              fontWeight: 700,
            }}
          >
            ● Attivo
          </div>
        </div>

        <div style={{ padding: "0 18px" }}>
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
                fontSize: 14,
                opacity: 0.9,
              }}
            >
              QR DrinkWise
            </div>

            <div
              style={{
                fontSize: 30,
                fontWeight: 800,
                marginTop: 4,
              }}
            >
              24
            </div>

            <div
              style={{
                opacity: 0.9,
              }}
            >
              QR Oggi
            </div>

            <div
              style={{
                marginTop: 20,
                display: "flex",
                gap: 12,
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,.2)",
                  borderRadius: 14,
                  padding: "8px 12px",
                }}
              >
                🟢 4 Presenti
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,.2)",
                  borderRadius: 14,
                  padding: "8px 12px",
                }}
              >
                19 Check-out
              </div>
            </div>
          </div>

          {/* KPI */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 18,
            }}
          >
            {[
              {
                title: "Settimanali",
                value: "124",
              },
              {
                title: "Mensili",
                value: "532",
              },
              {
                title: "Totali",
                value: "4218",
              },
              {
                title: "Check-out",
                value: "19",
              },
            ].map((item) => (
              <div key={item.title} style={cardStyle}>
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
                    fontSize: 26,
                    fontWeight: 800,
                    marginTop: 4,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* CHECKIN */}
          <div style={{ ...cardStyle, marginBottom: 16 }}>
            <div style={sectionTitle}>
              Check-in Attuali ({utentiPresenti.length})
            </div>

            {utentiPresenti.map((user) => (
              <div
                key={user.id}
                style={{
                  background: "#111",
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                    }}
                  >
                    🟢 {user.username}
                  </div>

                  <div
                    style={{
                      color: "#9a9a9a",
                      marginTop: 4,
                    }}
                  >
                    Check-in {user.checkin}
                  </div>
                </div>

                <button
                  onClick={() => openCheckout(user)}
                  style={{
                    border: "none",
                    background: "#f59e0b",
                    color: "#fff",
                    fontWeight: 700,
                    borderRadius: 12,
                    padding: "10px 12px",
                    cursor: "pointer",
                  }}
                >
                  CHECK-OUT
                </button>
              </div>
            ))}
          </div>

          {/* CRONOLOGIA */}
          <div style={{ ...cardStyle, marginBottom: 16 }}>
            <div style={sectionTitle}>Ultimi Check-out</div>

            {cronologia.map((item, index) => (
              <div
                key={index}
                style={{
                  background: "#111",
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                  }}
                >
                  {item.username}
                </div>

                <div
                  style={{
                    color: "#9a9a9a",
                    marginTop: 6,
                  }}
                >
                  {item.checkin} → {item.checkout}
                </div>

                <div
                  style={{
                    marginTop: 6,
                  }}
                >
                  {item.drink} drink • {item.totale}
                </div>
              </div>
            ))}
          </div>

          {/* STATISTICHE */}
          <div style={{ ...cardStyle, marginBottom: 16 }}>
            <div style={sectionTitle}>Statistiche Rapide</div>

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
                  padding: 12,
                  borderRadius: 16,
                  textAlign: "center",
                }}
              >
                <div>24€</div>
                <small>Media</small>
              </div>

              <div
                style={{
                  background: "#111",
                  padding: 12,
                  borderRadius: 16,
                  textAlign: "center",
                }}
              >
                <div>2.8</div>
                <small>Drink</small>
              </div>

              <div
                style={{
                  background: "#111",
                  padding: 12,
                  borderRadius: 16,
                  textAlign: "center",
                }}
              >
                <div>19</div>
                <small>QR</small>
              </div>
            </div>
          </div>

          {/* STAMPANTE */}
          <div style={cardStyle}>
            <div style={sectionTitle}>Stampante Bluetooth</div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div>🟢 Connessa</div>

                <div
                  style={{
                    color: "#9a9a9a",
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
                  Pronta per la stampa
                </div>
              </div>

              <Bluetooth size={28} />
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
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
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
              color: "#f59e0b",
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
            <Users size={20} />
            <span style={{ fontSize: 11 }}>Clienti</span>
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

      {/* MODAL CHECKOUT */}

      {showModal && selectedUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.85)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              background: "#1c1c1e",
              width: "100%",
              maxWidth: 420,
              borderRadius: 24,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <strong>Genera Check-out</strong>

              <X
                size={22}
                style={{ cursor: "pointer" }}
                onClick={() => setShowModal(false)}
              />
            </div>

            <div>{selectedUser.username}</div>

            <div style={{ marginTop: 10 }}>
              Check-in: {selectedUser.checkin}
            </div>

            <div style={{ marginTop: 10 }}>
              Check-out: 22:37
            </div>
<div
  style={{
    color: "#9a9a9a",
    marginTop: 16,
    marginBottom: 6,
    fontSize: 14,
  }}
>
  Numero Drink
</div>
            <input
  type="number"
  value={drinkCount}
              onChange={(e) => setDrinkCount(Number(e.target.value))}
              style={{
                width: "100%",
                marginTop: 16,
                padding: 12,
                borderRadius: 12,
                border: "none",
              }}
            />
<div
  style={{
    color: "#9a9a9a",
    marginTop: 12,
    marginBottom: 6,
    fontSize: 14,
  }}
>
  Importo Pagato (€)
</div>
            <input
  type="number"
  value={totaleSpeso}
              onChange={(e) => setTotaleSpeso(e.target.value)}
              style={{
                width: "100%",
                marginTop: 12,
                padding: 12,
                borderRadius: 12,
                border: "none",
              }}
            />

            <button
              onClick={generateQR}
              style={{
                width: "100%",
                marginTop: 16,
                border: "none",
                background: "#f59e0b",
                color: "#fff",
                fontWeight: 700,
                padding: 14,
                borderRadius: 14,
              }}
            >
              GENERA QR
            </button>
          </div>
        </div>
      )}

      {/* QR FULLSCREEN */}

      {showQR && selectedUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#0f0f10",
            zIndex: 2000,
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                marginBottom: 20,
              }}
            >
              QR CHECK-OUT
            </div>

           <div
  style={{
    width: 260,
    height: 260,
    background: "#fff",
    margin: "0 auto",
    borderRadius: 24,
    padding: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  <QRCode
    size={220}
    value={JSON.stringify({
      username: selectedUser.username,
      checkin: selectedUser.checkin,
      checkout: "22:37",
      drinks: drinkCount,
      total: totaleSpeso,
      type: "drinkwise-checkout",
    })}
  />
</div>

            <div style={{ marginTop: 20 }}>
              {selectedUser.username}
            </div>

            <div style={{ marginTop: 10 }}>
              Check-in {selectedUser.checkin}
            </div>

            <div>Check-out 22:37</div>

            <div style={{ marginTop: 10 }}>
              {drinkCount} Drink
            </div>

            <div>{totaleSpeso}€</div>

            <button
              onClick={() => setShowQR(false)}
              style={{
                width: "100%",
                marginTop: 24,
                border: "none",
                background: "#f59e0b",
                color: "#fff",
                fontWeight: 700,
                padding: 14,
                borderRadius: 14,
              }}
            >
              CHIUDI
            </button>
          </div>
        </div>
      )}
    </>
  );
}