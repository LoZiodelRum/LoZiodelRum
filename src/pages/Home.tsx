import "../App.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";

type Locale = {
  id: string;
  nome: string;
  citta: string;
  descrizione?: string | null;
  descrizione_completa?: string | null;
  image_url: string | null;
};

type Articolo = {
  id: string;
  titolo: string;
  immagine: string | null;
  pubblicato?: boolean;
};

const HOME_HERO_VIDEO_VERSION = "2026-04-15-07";
const heroVideoSrc = `/public/hero-video.mp4?v=${HOME_HERO_VIDEO_VERSION}`;

export default function Home() {
    // Funzioni placeholder per evitare errori di compilazione
    function saveLocaleEdit(id: string) {}
    function cancelLocaleEdit() {}
    function startLocaleEdit(l: Locale) {}
  const { isAdmin } = useUser();
  const [locali, setLocali] = useState<Locale[]>([]);
  const [articoli, setArticoli] = useState<Articolo[]>([]);
  const [editingLocaleId, setEditingLocaleId] = useState<string | null>(null);
  const [localeDraft, setLocaleDraft] = useState<Partial<Locale> | null>(null);
  const [savingLocaleId, setSavingLocaleId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    void fetchLocali();
    void fetchArticoli();
  }, []);

  async function fetchLocali() {
    const { data, error } = await supabase
      .from("Locali")
      .select("id, nome, citta, descrizione, descrizione_completa, image_url")
      .eq("status", "approved")
      .limit(6);

    if (error) {
      console.error("Errore locali:", error);
      return;
    }
    setLocali(data ?? []);
  }

  // Funzione fetchArticoli
  async function fetchArticoli() {
    const { data, error } = await supabase
      .from("Articoli")
      .select("id, titolo, immagine, pubblicato")
      .eq("pubblicato", true)
      .order("id", { ascending: false })
      .limit(4);
    if (error) {
      console.error("Errore articoli:", error);
      return;
    }
    setArticoli(data ?? []);
  }

  // Ritorno del JSX
  return (
    <div style={{ background: "#0b0b0b", minHeight: "100vh", width: "100vw" }}>
      {/* HERO VIDEO */}
      <div
        className="hero-section"
        style={{
          height: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          marginLeft: 0,
          marginRight: 0,
          paddingTop: 0,
          paddingBottom: "clamp(72px, 11vh, 132px)",
          borderRadius: 0,
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        >
          <source src={heroVideoSrc} type="video/mp4" />
        </video>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0.38) 45%, rgba(0,0,0,0.86) 100%)", zIndex: 1 }} />
        <div className="hero-mobile-content" style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1180, padding: "0 20px 6px" }}>
          <h1 className="hero-mobile-title" style={{ fontSize: "clamp(28px, 7vw, 48px)", marginBottom: 20, fontWeight: 800, lineHeight: 1.2, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <span className="hero-mobile-title-line" style={{ color: "#ffffff" }}>Scopri i migliori</span>
            <span className="hero-mobile-title-line" style={{ color: "#f5a623" }}>locali del mondo</span>
          </h1>
          <p className="hero-mobile-subtitle" style={{ opacity: 0.85, marginBottom: 30, fontSize: "clamp(14px, 2.5vw, 18px)" }}>
            Recensioni autentiche, esperienze uniche, cultura del bere. Trova cocktail bar, rum bar e locali d'eccellenza nella tua citta.
          </p>
        </div>
      </div>

      {/* SEZIONE LOCALi IN EVIDENZA */}
      <section className="content-section content-section-first locali-section" style={{ padding: "40px 60px", maxWidth: 1400, margin: "68px auto 0" }}>
        <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h2 className="section-title" style={{ fontSize: "clamp(24px, 4vw, 32px)", margin: 0 }}>Locali in evidenza</h2>
          </div>
          <Link className="section-link" to="/venues" style={{ color: "#f5a623", textDecoration: "none" }}>Vedi tutti</Link>
        </div>
        <div className="section-grid locali-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 20 }}>
          {locali.map((l) => (
            <article
              key={l.id}
              className="card-box locali-card"
              style={{
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                textDecoration: "none",
                height: 220,
                display: "flex",
                alignItems: "flex-end",
                color: "#fff",
                cursor: "pointer",
                transition: "transform 0.3s ease, filter 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.filter = "brightness(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.filter = "brightness(1)";
              }}
              onClick={() => navigate(`/venue/${l.id}`)}
            >
              <img src={l.image_url ?? "https://via.placeholder.com/400x300"} alt={l.nome} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)", zIndex: 2 }} />
              <div className="card-content" style={{ position: "relative", zIndex: 3, padding: 16, width: "100%" }}>
                <h3 className="card-title" style={{ margin: "0 0 4px 0", fontSize: 18 }}>{l.nome}</h3>
                <p className="card-subtitle" style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>{l.citta}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SEZIONE ARTICOLI */}
      <section className="content-section" style={{ padding: "40px 60px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h2 className="section-title" style={{ fontSize: "clamp(24px, 4vw, 32px)", margin: 0 }}>Ultimi Articoli</h2>
        </div>
        <div className="section-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 20 }}>
          {articoli.map((a) => (
            <Link
              key={a.id}
              to={`/magazine/${a.id}`}
              className="card-box"
              style={{
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                cursor: "pointer",
                textDecoration: "none",
                height: 220,
                display: "flex",
                alignItems: "flex-end",
                color: "#fff",
              }}
            >
              <img src={a.immagine ?? "https://via.placeholder.com/400x300"} alt={a.titolo} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scale(0.9)", transformOrigin: "center", zIndex: 0 }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 35%, transparent 65%)", zIndex: 1 }} />
              <div className="card-content" style={{ position: "relative", zIndex: 2, padding: "16px 16px 8px 16px", width: "100%" }}>
                <h3 className="card-title card-title-clamp" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{a.titolo}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BARRA FISSA IN FONDO CON I 3 TASTI PICCOLI */}
      <div style={{
        position: "fixed",
        left: 0,
        bottom: 0,
        width: "100vw",
        background: "#181818e6",
        boxShadow: "0 -2px 16px #0008",
        padding: "10px 0 12px 0",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        zIndex: 100,
      }}>
        <Link to="/registrazione" style={{
          background: "#c87a2c",
          color: "#fff",
          fontWeight: 700,
          fontSize: 15,
          border: "none",
          borderRadius: 8,
          padding: "7px 18px",
          textAlign: "center",
          textDecoration: "none",
          transition: "background 0.2s",
          minWidth: 80,
          boxShadow: "0 2px 8px #0003",
          letterSpacing: 0.2,
        }}>Utente</Link>
        <Link to="/registrazione-bartender" style={{
          background: "#c87a2c",
          color: "#fff",
          fontWeight: 700,
          fontSize: 15,
          border: "none",
          borderRadius: 8,
          padding: "7px 18px",
          textAlign: "center",
          textDecoration: "none",
          transition: "background 0.2s",
          minWidth: 80,
          boxShadow: "0 2px 8px #0003",
          letterSpacing: 0.2,
        }}>Bartender</Link>
        <Link to="/registrazione-owner" style={{
          background: "#c87a2c",
          color: "#fff",
          fontWeight: 700,
          fontSize: 15,
          border: "none",
          borderRadius: 8,
          padding: "7px 18px",
          textAlign: "center",
          textDecoration: "none",
          transition: "background 0.2s",
          minWidth: 80,
          boxShadow: "0 2px 8px #0003",
          letterSpacing: 0.2,
        }}>Proprietario</Link>
      </div>
    </div>
  );
}
