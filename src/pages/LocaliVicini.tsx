import { useLocation } from "react-router-dom";
import { useLoungeSwipe } from "../components/lounge/LoungeSwipeNavigation";

export default function LocaliVicini() {
  const location = useLocation();
  const swipe = useLoungeSwipe("/eventi", "/baretto");

  const query = new URLSearchParams(location.search);

  const lat = query.get("lat");
  const lng = query.get("lng");

  return (
    <div
      {...swipe}
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #071326 0%, #020817 45%, #01040d 100%)",
        color: "white",
        padding: "120px 20px 40px",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: 42,
            fontWeight: 900,
            marginBottom: 24,
          }}
        >
          Locali Vicini
        </h1>

        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
            padding: 30,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 20,
              marginBottom: 12,
            }}
          >
            Geolocalizzazione rilevata
          </div>

          <div
            style={{
              opacity: 0.8,
              lineHeight: 1.8,
            }}
          >
            Latitudine: {lat || "non disponibile"}
            <br />
            Longitudine: {lng || "non disponibile"}
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
            padding: 30,
          }}
        >
          Nessun locale trovato nelle vicinanze
        </div>
      </div>
    </div>
  );
}