import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";

export default function HomeNew() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#0b0b0b", color: "#fff", minHeight: "100vh" }}>
      
      {/* HERO */}
      <div
        style={{
          height: "100vh",
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        >
          <source src="/home-hero.mp4" type="video/mp4" />
        </video>

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.9))",
          }}
        />

        <div style={{ position: "relative", zIndex: 2, marginBottom: 80 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800 }}>
            Scopri i migliori
            <br />
            <span style={{ color: "#f5a623" }}>locali del mondo</span>
          </h1>

          <p style={{ opacity: 0.8, marginTop: 10 }}>
            Cultura del bere, esperienze autentiche
          </p>

          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              marginTop: 30,
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => navigate("/venues")}
              style={{
                background: "#f5a623",
                color: "#0b0b0b",
                border: "none",
                padding: "14px 32px",
                borderRadius: 8,
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <ArrowRight size={18} />
              Esplora Locali
            </button>

            <button
              onClick={() => navigate("/mappa")}
              style={{
                background: "#f5a623",
                color: "#0b0b0b",
                border: "none",
                padding: "14px 32px",
                borderRadius: 8,
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <MapPin size={18} />
              Vedi Mappa
            </button>
          </div>
        </div>
      </div>

      {/* ===== TEST BLOCCO ===== */}
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2 style={{ color: "#f5a623" }}>
          TEST NUOVA HOME FUNZIONANTE
        </h2>
      </div>

      {/* ===== BARETTO ===== */}
      <section style={{ padding: "40px 16px", maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            background: "linear-gradient(135deg,#3a2a00,#5a3e00)",
            borderRadius: 24,
            padding: 24,
          }}
        >
          <h2 style={{ color: "#fff", marginBottom: 8 }}>
            Il Baretto Community
          </h2>

          <p style={{ color: "#ddd", marginBottom: 20 }}>
            Il club digitale dove esperti e appassionati scambiano esperienze da bancone.
          </p>

          <button
            onClick={() => navigate("/baretto")}
            style={{
              width: "100%",
              background: "#f5a623",
              border: "none",
              padding: "14px",
              borderRadius: 12,
              fontWeight: "bold",
              cursor: "pointer",
              color: "#0b0b0b",
            }}
          >
            Accedi alla chat
          </button>
        </div>
      </section>
    </div>
  );
}