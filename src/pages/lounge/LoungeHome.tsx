import { useNavigate } from "react-router-dom";
import React from "react";
import LoungeBottomNavigation from "../../components/lounge/LoungeBottomNavigation";
import { useTranslation } from "react-i18next";

export default function LoungeHome() {
  const navigate = useNavigate();
  const { t } = useTranslation("lounge");

  const isMobile = window.innerWidth < 980;

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #071326 0%, #020817 45%, #01040d 100%)",
    padding: isMobile ? "100px 14px 40px" : "120px 24px 40px",
    color: "white",
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(7,15,35,0.88)",
    borderRadius: isMobile ? 24 : 30,
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 0 24px rgba(0,255,255,0.08)",
    backdropFilter: "blur(18px)",
    overflow: "hidden",
  };

  const topCards = [
    {
      value: "0",
      title: t("home.topCards.premiumVenues"),
      color: "#f5a623",
      path: "/locali",
    },
    {
      value: "0",
      title: t("home.topCards.eventsTonight"),
      color: "#f5a623",
      path: "/eventi",
    },
    {
      value: "0",
      title: t("home.topCards.newReviews"),
      color: "#f5a623",
      path: "/recensioni",
    },
    {
      value: "0",
      title: t("home.topCards.newCocktails"),
      color: "#f5a623",
      path: "/drink",
    },
  ];

  const openNearbyBars = () => {
    navigate("/mappa");
  };

  return (
    <>
      <LoungeBottomNavigation />
      <div style={pageStyle}>
      <div
        style={{
          maxWidth: 1450,
          margin: "0 auto",
        }}
      >
        {/* TOP CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "repeat(2,minmax(0,1fr))"
              : "repeat(auto-fit,minmax(240px,1fr))",
            gap: isMobile ? 14 : 20,
            marginBottom: isMobile ? 18 : 26,
          }}
        >
          {topCards.map((item) => (
            <div
              key={item.title}
              onClick={() => navigate(item.path)}
              style={{
                ...cardStyle,
                padding: isMobile ? 18 : 26,
                border: `1px solid ${item.color}55`,
                cursor: "pointer",
                transition: "0.2s ease",
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? 28 : 42,
                  fontWeight: 900,
                  color: item.color,
                  marginBottom: 8,
                  lineHeight: 1,
                }}
              >
                {item.value}
              </div>

              <div
                style={{
                  fontSize: isMobile ? 13 : 18,
                  fontWeight: 700,
                  opacity: 0.92,
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
            gridTemplateColumns: isMobile ? "1fr" : "1.8fr 0.9fr",
            gap: isMobile ? 16 : 22,
            marginBottom: isMobile ? 18 : 26,
          }}
        >
          <div
            style={{
              ...cardStyle,
              padding: isMobile ? 18 : 24,
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: isMobile ? 20 : 28,
                fontSize: isMobile ? 22 : 30,
                fontWeight: 800,
              }}
            >
              {t("home.score.title")}
            </h2>

            <div
              style={{
                display: "flex",
                gap: isMobile ? 22 : 34,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: isMobile ? 120 : 160,
                  height: isMobile ? 120 : 160,
                  borderRadius: "50%",
                  border: isMobile
                    ? "10px solid #ffcc66"
                    : "14px solid #ffcc66",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isMobile ? 30 : 44,
                  fontWeight: 900,
                  boxShadow: "0 0 18px #f5a623",
                  flexShrink: 0,
                }}
              >
                78
              </div>

              <div
                style={{
                  flex: 1,
                  minWidth: isMobile ? "100%" : 260,
                }}
              >
                {[
                  [t("home.score.tastings"), 64],
                  [t("home.score.experiences"), 58],
                  [t("home.score.community"), 70],
                  [t("home.score.knowledge"), 71],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      marginBottom: isMobile ? 18 : 24,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                        fontSize: isMobile ? 13 : 15,
                        fontWeight: 600,
                      }}
                    >
                      <span>{label}</span>
                      <span>{value}</span>
                    </div>

                    <div
                      style={{
                        width: "100%",
                        height: isMobile ? 10 : 12,
                        borderRadius: 20,
                        background: "rgba(255,255,255,0.08)",
                      }}
                    >
                      <div
                        style={{
                          width: `${value}%`,
                          height: "100%",
                          borderRadius: 20,
                          background:
                            "linear-gradient(90deg, #ffd27a 0%, #f5a623 45%, #c97d00 100%)",
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
              flexDirection: isMobile ? "row" : "column",
              gap: isMobile ? 14 : 20,
            }}
          >
            <div
              style={{
                ...cardStyle,
                padding: isMobile ? 18 : 28,
                flex: 1,
              }}
            >
              <div
                style={{
                  opacity: 0.7,
                  marginBottom: 10,
                  fontSize: isMobile ? 12 : 18,
                  fontWeight: 600,
                }}
              >
                {t("home.score.topCity")}
              </div>

              <div
                style={{
                  fontSize: isMobile ? 22 : 34,
                  fontWeight: 900,
                }}
              >
                Milano
              </div>
            </div>

            <div
              style={{
                ...cardStyle,
                padding: isMobile ? 18 : 28,
                flex: 1,
              }}
            >
              <div
                style={{
                  opacity: 0.7,
                  marginBottom: 10,
                  fontSize: isMobile ? 12 : 18,
                  fontWeight: 600,
                }}
              >
                {t("home.score.cocktailOfMoment")}
              </div>

              <div
                style={{
                  fontSize: isMobile ? 20 : 32,
                  fontWeight: 900,
                  lineHeight: 1.1,
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
            gap: isMobile ? 16 : 22,
            marginBottom: isMobile ? 18 : 26,
          }}
        >
          <div
            onClick={() => navigate("/eventi")}
            style={{
              ...cardStyle,
              padding: isMobile ? 18 : 28,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                color: "#ffcc66",
                fontSize: isMobile ? 16 : 22,
                fontWeight: 800,
                marginBottom: 18,
              }}
            >
              {t("home.eventsTonight")}
            </div>

            <img
              src="https://images.unsplash.com/photo-1514933651103-005eec06c04b"
              alt="event"
              style={{
                width: "100%",
                height: isMobile ? 180 : 240,
                objectFit: "cover",
                borderRadius: 20,
                marginBottom: 20,
              }}
            />

            <div
              style={{
                fontSize: isMobile ? 24 : 34,
                lineHeight: 1.05,
                fontWeight: 900,
                marginBottom: 16,
              }}
            >
              {t("home.events.headlineTop")}
              <br />
              {t("home.events.headlineBottom")}
            </div>

            <div
              style={{
                color: "#ff944d",
                fontWeight: 800,
                fontSize: isMobile ? 16 : 22,
                marginBottom: 10,
              }}
            >
              ● {t("home.events.liveBadge")}
            </div>

            <div
              style={{
                opacity: 0.8,
                fontSize: isMobile ? 14 : 18,
              }}
            >
              {t("home.events.eventMeta")}
            </div>
          </div>

          <div
            style={{
              ...cardStyle,
              padding: isMobile ? 18 : 28,
            }}
          >
            <div
              style={{
                color: "#ff6b35",
                fontSize: isMobile ? 18 : 24,
                fontWeight: 800,
                marginBottom: 22,
              }}
            >
              {t("home.news.title")}
            </div>

            <div
              style={{
                display: "flex",
                gap: isMobile ? 10 : 16,
                marginBottom: 24,
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
                    width: isMobile ? 58 : 82,
                    height: isMobile ? 58 : 82,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid #f5a623",
                  }}
                />
              ))}
            </div>

            <div
              style={{
                fontSize: isMobile ? 22 : 36,
                lineHeight: 1.08,
                fontWeight: 900,
                marginBottom: 18,
              }}
            >
              {t("home.news.bartenderStories")}
            </div>

            <div
              style={{
                opacity: 0.82,
                fontSize: isMobile ? 14 : 18,
              }}
            >
              {t("home.news.watchSharing")}
            </div>
          </div>
        </div>

        {/* PICKS */}
        <div
          style={{
            ...cardStyle,
            padding: isMobile ? 18 : 28,
            marginBottom: isMobile ? 18 : 26,
          }}
        >
          <div
            style={{
              fontSize: isMobile ? 20 : 28,
              fontWeight: 800,
              marginBottom: 20,
            }}
          >
            {t("home.suggestions.title")}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(auto-fit,minmax(240px,1fr))",
              gap: isMobile ? 14 : 18,
            }}
          >
            <div
              onClick={() => navigate("/drink")}
              style={{
                padding: isMobile ? 18 : 24,
                borderRadius: 20,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: isMobile ? 15 : 20,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {t("home.suggestions.rum")}
            </div>

            <div
              onClick={openNearbyBars}
              style={{
                padding: isMobile ? 18 : 24,
                borderRadius: 20,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: isMobile ? 15 : 20,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {t("home.suggestions.nearbyBars")}
            </div>

            <div
              onClick={() => navigate("/drink")}
              style={{
                padding: isMobile ? 18 : 24,
                borderRadius: 20,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: isMobile ? 15 : 20,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {t("home.suggestions.cocktailTonight")}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: isMobile ? 14 : 10,
          }}
        >
          <button
            onClick={() => navigate("/baretto")}
            style={{
              padding: isMobile ? "12px 24px" : "14px 34px",
              borderRadius: 18,
              border: "1px solid rgba(66,245,223,0.35)",
              cursor: "pointer",
              background:
                "linear-gradient(90deg,#42f5df,#5df7d3,#6ffff0)",
              color: "#04131e",
              fontWeight: 900,
              fontSize: isMobile ? 16 : 18,
              boxShadow: "0 0 24px #42f5df44",
              transition: "0.2s ease",
              minWidth: isMobile ? "unset" : 260,
            }}
          >
            {t("home.enterBaretto")}
          </button>
        </div>

        <div style={{ height: 140 }} />
      </div>
    </div>
    </>
  );
}