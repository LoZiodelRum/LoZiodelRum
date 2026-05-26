import { useNavigate } from "react-router-dom";

export default function LoungeHome() {
  const navigate = useNavigate();

  const isMobile = window.innerWidth < 980;

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #071326 0%, #020817 45%, #01040d 100%)",
    padding: isMobile ? "16px" : "28px",
    color: "white",
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(7,15,35,0.88)",
    borderRadius: 32,
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 0 30px rgba(0,255,255,0.08)",
    backdropFilter: "blur(18px)",
  };

  return (
    <div style={pageStyle}>
      <div
        style={{
          maxWidth: 1600,
          margin: "0 auto",
        }}
      >
        {/* TOP CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(260px,1fr))",
            gap: 22,
            marginBottom: 26,
          }}
        >
          {[
            {
              value: "14",
              title: "Premium Bars",
              color: "#ff6b35",
            },
            {
              value: "3",
              title: "Events Tonight",
              color: "#5b5fff",
            },
            {
              value: "28",
              title: "New Reviews",
              color: "#22e6c9",
            },
            {
              value: "7",
              title: "New Bottles",
              color: "#b05cff",
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                ...cardStyle,
                padding: 32,
                border: `1px solid ${item.color}`,
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? 46 : 58,
                  fontWeight: 900,
                  color: item.color,
                  marginBottom: 12,
                }}
              >
                {item.value}
              </div>

              <div
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                }}
              >
                {item.title}
              </div>
            </div>
          ))}
        </div>

        {/* SCORE SECTION */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
            gap: 24,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              ...cardStyle,
              padding: isMobile ? 20 : 24,
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 30,
                fontSize: isMobile ? 28 : 34,
              }}
            >
              DrinkWise Score
            </h2>

            <div
              style={{
                display: "flex",
                gap: 42,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: isMobile ? 170 : 180,
                  height: isMobile ? 170 : 180,
                  borderRadius: "50%",
                  border: "18px solid #3ffff2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isMobile ? 42 : 48,
                  fontWeight: 900,
                  boxShadow: "0 0 20px #3ffff244",
                }}
              >
                78
              </div>

              <div
                style={{
                  flex: 1,
                  minWidth: 280,
                }}
              >
                {[
                  ["Tastings", 64],
                  ["Experiences", 58],
                  ["Community", 70],
                  ["Knowledge", 71],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      marginBottom: 30,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 12,
                       fontSize: isMobile ? 18 : 16,
                      }}
                    >
                      <span>{label}</span>
                      <span>{value}</span>
                    </div>

                    <div
                      style={{
                        width: isMobile ? "100%" : "420px",
                        height: 16,
                        borderRadius: 24,
                        background: "rgba(255,255,255,0.08)",
                      }}
                    >
                      <div
                        style={{
                          width: `${value}%`,
                          height: "100%",
                          borderRadius: 24,
                          background:
                            "linear-gradient(90deg,#3ffff2,#5b5fff)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <div
              style={{
                ...cardStyle,
                padding: 34,
              }}
            >
              <div
                style={{
                  opacity: 0.7,
                  marginBottom: 18,
                  fontSize: 26,
                }}
              >
                Top City
              </div>

              <div
                style={{
                  fontSize: isMobile ? 34 : 38,
                  fontWeight: 900,
                }}
              >
                Milan
              </div>
            </div>

            <div
              style={{
                ...cardStyle,
                padding: 34,
              }}
            >
              <div
                style={{
                  opacity: 0.7,
                  marginBottom: 18,
                  fontSize: 26,
                }}
              >
                Trending Cocktail
              </div>

              <div
                style={{
                  fontSize: isMobile ? 52 : 68,
                  fontWeight: 900,
                }}
              >
                Daiquiri
              </div>
            </div>
          </div>
        </div>

        {/* EVENTS + STORIES */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 24,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              ...cardStyle,
              padding: 32,
            }}
          >
            <div
              style={{
                color: "#ffcc66",
                fontSize: isMobile ? 20 : 24,
                fontWeight: 800,
                marginBottom: 24,
              }}
            >
              Tonight’s Events
            </div>

            <img
              src="https://images.unsplash.com/photo-1514933651103-005eec06c04b"
              alt="event"
              style={{
                width: "100%",
                height: 260,
                objectFit: "cover",
                borderRadius: 24,
                marginBottom: 24,
              }}
            />

            <div
              style={{
                fontSize: isMobile ? 30 : 38,
                lineHeight: 1,
                fontWeight: 900,
                marginBottom: 20,
              }}
            >
              Caribbean
              <br />
              Rum Night
            </div>

            <div
              style={{
                color: "#ff944d",
                fontWeight: 800,
                fontSize: 28,
                marginBottom: 12,
              }}
            >
              ● LIVE
            </div>

            <div
              style={{
                opacity: 0.8,
                fontSize: 24,
              }}
            >
              8:00 PM · 24 going
            </div>
          </div>

          <div
            style={{
              ...cardStyle,
              padding: 32,
            }}
          >
            <div
              style={{
                color: "#ff66cc",
                fontSize: 30,
                fontWeight: 800,
                marginBottom: 26,
              }}
            >
              New from Lounge
            </div>

            <div
              style={{
                display: "flex",
                gap: 18,
                marginBottom: 30,
              }}
            >
              {[
                "https://randomuser.me/api/portraits/men/32.jpg",
                "https://randomuser.me/api/portraits/women/44.jpg",
                "https://randomuser.me/api/portraits/men/85.jpg",
              ].map((img) => (
                <img
                  key={img}
                  src={img}
                  alt="avatar"
                  style={{
                    width: 110,
                    height: 110,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "4px solid #ff66cc",
                  }}
                />
              ))}
            </div>

            <div
              style={{
                fontSize: isMobile ? 30 : 42,
                lineHeight: 1,
                fontWeight: 900,
                marginBottom: 24,
              }}
            >
              12 new bartender stories
            </div>

            <div
              style={{
                opacity: 0.82,
                fontSize: 28,
              }}
            >
              See what they’re sharing ✨
            </div>
          </div>
        </div>

        {/* PICKS */}
        <div
          style={{
            ...cardStyle,
            padding: 32,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              fontSize: isMobile ? 24 : 32,
              fontWeight: 800,
              marginBottom: 24,
            }}
          >
            DrinkWise Picks
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(260px,1fr))",
              gap: 20,
            }}
          >
            {[
              "Rum suggestion",
              "Find bars near you",
              "Cocktail for tonight",
            ].map((item) => (
              <div
                key={item}
                style={{
                  padding: 30,
                  borderRadius: 24,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/baretto")}
          style={{
            width: "100%",
            padding: isMobile ? "14px 18px" : "18px 28px",
            borderRadius: 24,
            border: "none",
            cursor: "pointer",
            background:
              "linear-gradient(90deg,#42f5df,#5df7d3,#6ffff0)",
            color: "#04131e",
            fontWeight: 900,
            fontSize: isMobile ? 34 : 54,
            boxShadow: "0 0 40px #42f5df66",
          }}
        >
          Entra nel Baretto
        </button>
      </div>
    </div>
  );
}