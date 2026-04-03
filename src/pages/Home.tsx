import "../App.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

type Locale = {
  id: string;
  nome: string;
  citta: string;
  image_url: string | null;
};

type Articolo = {
  id: string;
  titolo: string;
  immagine: string | null;
};

type Recensione = {
  id: string;
  locale_id: string;
  locale_nome?: string;
  immagine?: string | null;
  rating: number;
  autore: string;
};

type RecensioneRow = {
  id: string;
  locale_id: string;
  rating: number | null;
  autore: string | null;
  Locali?: {
    nome?: string | null;
    image_url?: string | null;
  } | null;
};

export default function Home() {
  const [locali, setLocali] = useState<Locale[]>([]);
  const [articoli, setArticoli] = useState<Articolo[]>([]);
  const [recensioni, setRecensioni] = useState<Recensione[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    void fetchLocali();
    void fetchArticoli();
    void fetchRecensioni();
  }, []);

  async function fetchLocali() {
    const { data, error } = await supabase
      .from("Locali")
      .select("*")
      .eq("status", "approved")
      .limit(6);

    if (error) {
      console.error("Errore locali:", error);
      return;
    }

    setLocali(data ?? []);
  }

  async function fetchArticoli() {
    const { data, error } = await supabase
      .from("articoli")
      .select("*")
      .eq("pubblicato", true)
      .limit(6);

    if (error) {
      console.error("Errore articoli:", error);
      return;
    }

    setArticoli(data ?? []);
  }

  async function fetchRecensioni() {
    const { data, error } = await supabase
      .from("Recensioni")
      .select("id, locale_id, rating, autore, Locali(nome, image_url)")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) {
      console.error("Errore recensioni:", error);
      return;
    }

    const rows = (data ?? []) as RecensioneRow[];
    const mapped = rows.map((r) => ({
      id: r.id,
      locale_id: r.locale_id,
      locale_nome: r.Locali?.nome ?? "Locale",
      immagine: r.Locali?.image_url ?? null,
      rating: r.rating ?? 0,
      autore: r.autore ?? "Utente",
    }));

    setRecensioni(mapped);
  }

  return (
    <div
      style={{
        background: "#0b0b0b",
        color: "#fff",
        margin: 0,
        padding: 0,
        minHeight: "100vh",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .hero-section {
            display: flex !important;
            min-height: 84vh !important;
            width: 100vw !important;
            margin-left: calc(50% - 50vw) !important;
            margin-right: calc(50% - 50vw) !important;
            padding-top: calc(96px + env(safe-area-inset-top)) !important;
            padding-bottom: 72px !important;
            align-items: flex-start !important;
          }
          .hero-mobile-content { margin-top: 34px !important; padding-bottom: 10px !important; }
          .hero-mobile-badge {
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
            border: 1px solid rgba(245, 166, 35, 0.35) !important;
            background: rgba(245, 166, 35, 0.14) !important;
            color: #f5a623 !important;
            border-radius: 999px !important;
            font-size: 16px !important;
            padding: 8px 14px !important;
            margin-bottom: 22px !important;
          }
          .hero-mobile-title { font-size: clamp(38px, 11vw, 52px) !important; line-height: 1.06 !important; }
          .hero-mobile-subtitle { font-size: clamp(14px, 5vw, 20px) !important; line-height: 1.4 !important; }
          .hero-mobile-buttons {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 14px !important;
            margin-top: 34px !important;
            margin-bottom: 72px !important;
          }
          .hero-mobile-btn {
            width: 100% !important;
            justify-content: center !important;
            font-size: 20px !important;
            padding: 16px 18px !important;
            border-radius: 18px !important;
          }
          .content-section { padding: clamp(12px, 3.6vw, 18px) !important; }
          .content-section-first { padding-top: 92px !important; margin-top: 64px !important; }
          .section-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: clamp(10px, 3vw, 14px) !important; }
          .card-box { height: auto !important; aspect-ratio: 1 / 1 !important; border-radius: 18px !important; }
          .section-header { margin-bottom: 16px !important; }
          .section-title { font-size: clamp(26px, 7vw, 34px) !important; line-height: 1.08 !important; }
          .section-subtitle { display: block !important; color: #8f8f8f !important; margin-top: 6px !important; font-size: clamp(14px, 3.8vw, 16px) !important; }
          .section-link { display: none !important; }
          .card-title { font-size: clamp(15px, 5.2vw, 22px) !important; line-height: 1.1 !important; }
          .card-subtitle { font-size: clamp(13px, 4.3vw, 16px) !important; }
          .card-rating { font-size: clamp(12px, 3.6vw, 14px) !important; padding: 5px 10px !important; top: 10px !important; right: 10px !important; }
          .card-title-clamp {
            display: -webkit-box !important;
            -webkit-line-clamp: 5;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }

        @media (max-width: 1024px) {
        }

        @media (min-width: 481px) and (max-width: 768px) {
          .card-box { border-radius: 20px !important; }
        }

        @media (min-width: 390px) and (max-width: 430px) {
          .content-section { padding: 14px 16px !important; }
          .section-grid { gap: 12px !important; }
          .section-title { font-size: 32px !important; }
          .card-box { border-radius: 16px !important; }
          .card-title { font-size: 18px !important; }
          .card-subtitle { font-size: 14px !important; }
          .card-title-clamp {
            -webkit-line-clamp: 4;
          }
        }

        @media (max-width: 380px) {
          .hero-mobile-title { font-size: 42px !important; }
          .hero-mobile-btn { font-size: 18px !important; }
          .content-section { padding: 12px !important; }
          .section-grid { gap: 10px !important; }
          .card-box { border-radius: 14px !important; }
          .card-title-clamp {
            -webkit-line-clamp: 4;
          }
        }

        @media (min-width: 769px) {
          .content-section { padding: 40px 60px !important; }
          .content-section-first { margin-top: 56px !important; }
          .section-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 20px !important; }
          .card-box { height: 220px !important; aspect-ratio: auto !important; }
        }
      `}</style>

      <div
        className="hero-section"
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          backgroundImage: "url('https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1920')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          paddingTop: 70,
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.9))" }} />
        <div className="hero-mobile-content" style={{ position: "relative", zIndex: 2, maxWidth: "90%", padding: "0 20px" }}>
          <p className="hero-mobile-badge" style={{ display: "none" }}>✨ La community del bere consapevole</p>
          <h1 className="hero-mobile-title" style={{ fontSize: "clamp(28px, 7vw, 48px)", marginBottom: 20, fontWeight: 800, lineHeight: 1.2 }}>
            Scopri i migliori <br />
            <span style={{ color: "#f5a623" }}>locali del mondo</span>
          </h1>
          <p className="hero-mobile-subtitle" style={{ opacity: 0.85, marginBottom: 30, fontSize: "clamp(14px, 2.5vw, 18px)" }}>
            Recensioni autentiche, esperienze uniche, cultura del bere. Trova cocktail bar, rum bar e locali d'eccellenza nella tua citta.
          </p>
          <div className="hero-mobile-buttons" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              className="hero-mobile-btn"
              onClick={() => navigate("/venues")}
              style={{
                background: "#f5a623",
                color: "#0b0b0b",
                border: "none",
                padding: "14px 32px",
                borderRadius: 8,
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              Esplora Locali
            </button>
            <button
              className="hero-mobile-btn"
              onClick={() => navigate("/mappa")}
              style={{
                background: "#f5a623",
                color: "#0b0b0b",
                border: "none",
                padding: "14px 32px",
                borderRadius: 8,
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              Vedi Mappa
            </button>
          </div>
        </div>
      </div>

      <section className="content-section content-section-first" style={{ padding: "40px 60px", maxWidth: 1400, margin: "56px auto 0" }}>
        <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h2 className="section-title" style={{ fontSize: "clamp(24px, 4vw, 32px)", margin: 0 }}>Locali in evidenza</h2>
            <p className="section-subtitle" style={{ display: "none", marginTop: 12 }}>Selezionati dalla nostra redazione</p>
          </div>
          <Link className="section-link" to="/venues" style={{ color: "#f5a623", textDecoration: "none" }}>Vedi tutti</Link>
        </div>
        <div className="section-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 20 }}>
          {locali.map((l) => (
            <Link
              key={l.id}
              to={`/venue/${l.id}`}
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
              <img src={l.image_url ?? "https://via.placeholder.com/400x300"} alt={l.nome} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)", zIndex: 1 }} />
              <div style={{ position: "relative", zIndex: 2, padding: 16, width: "100%" }}>
                <h3 className="card-title" style={{ margin: "0 0 4px 0", fontSize: 18 }}>{l.nome}</h3>
                <p className="card-subtitle" style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>{l.citta}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-section" style={{ padding: "40px 60px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 32px)", margin: 0 }}>Ultimi Articoli</h2>
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
              <img src={a.immagine ?? "https://via.placeholder.com/400x300"} alt={a.titolo} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)", zIndex: 1 }} />
              <div style={{ position: "relative", zIndex: 2, padding: 16, width: "100%" }}>
                <h3 className="card-title card-title-clamp" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{a.titolo}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="content-section" style={{ padding: "40px 60px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 32px)", margin: 0 }}>Ultime Recensioni</h2>
        </div>
        <div className="section-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 20 }}>
          {recensioni.map((r) => (
            <div
              key={r.id}
              className="card-box"
              style={{
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                height: 220,
                display: "flex",
                alignItems: "flex-end",
                color: "#fff",
              }}
            >
              <img src={r.immagine ?? "https://via.placeholder.com/400x300"} alt={r.locale_nome ?? "Locale"} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)", zIndex: 1 }} />
              <div className="card-rating" style={{ position: "absolute", top: 12, right: 12, background: "#f5a623", color: "#0b0b0b", padding: "6px 12px", borderRadius: 8, fontWeight: "bold", fontSize: 14, zIndex: 3 }}>
                {`★ ${r.rating.toFixed(1)}`}
              </div>
              <div style={{ position: "relative", zIndex: 2, padding: 16, width: "100%" }}>
                <h3 className="card-title" style={{ margin: "0 0 4px 0", fontSize: 16 }}>{r.locale_nome ?? "Locale"}</h3>
                <p className="card-subtitle" style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>{`Lo Zio del Rum - ${r.autore}`}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section community-section" style={{ padding: "40px 60px", maxWidth: 1400, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(28px, 5vw, 44px)", marginBottom: 16, fontWeight: 800 }}>Unisciti alla community</h2>
        <p style={{ fontSize: "clamp(14px, 2vw, 18px)", color: "#aaa", maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.6 }}>
          Condividi le tue esperienze, scopri nuovi locali e contribuisci alla cultura del bere consapevole.
        </p>
        <button onClick={() => navigate("/crea")} style={{ background: "#f5a623", color: "#0b0b0b", border: "none", padding: "14px 32px", borderRadius: 8, fontWeight: "bold", cursor: "pointer", fontSize: 16 }}>
          Inizia a recensire
        </button>
      </section>

      <div style={{ height: 60 }} />
    </div>
  );
}
