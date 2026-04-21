import "../App.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "../context/UserContext";
import BarettoPreview from "../components/BarettoPreview";

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
      <div style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          background: "#111",
          borderRadius: 24,
          padding: "48px 48px 40px 48px",
          boxShadow: "0 4px 32px #0007",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: 320,
          maxWidth: 420,
        }}>
          <h1 style={{
            color: "#fff",
            fontWeight: 800,
            fontSize: 48,
            marginBottom: 8,
            textAlign: "center",
          }}>Registrati</h1>
          <div style={{
            color: "#aaa",
            fontSize: 22,
            marginBottom: 32,
            textAlign: "center",
          }}>Scegli il tuo ruolo</div>
          <Link to="/registrazione" style={{
            background: "#c87a2c",
            color: "#fff",
            fontWeight: 700,
            fontSize: 24,
            border: "none",
            borderRadius: 14,
            padding: "14px 0",
            marginBottom: 18,
            textAlign: "center",
            textDecoration: "none",
            transition: "background 0.2s",
            width: 320,
            maxWidth: "80vw",
            boxShadow: "0 2px 8px #0003",
            letterSpacing: 0.2,
          }}>Utente</Link>
          <Link to="/registrazione-bartender" style={{
            background: "#c87a2c",
            color: "#fff",
            fontWeight: 700,
            fontSize: 24,
            border: "none",
            borderRadius: 14,
            padding: "14px 0",
            marginBottom: 18,
            textAlign: "center",
            textDecoration: "none",
            transition: "background 0.2s",
            width: 320,
            maxWidth: "80vw",
            boxShadow: "0 2px 8px #0003",
            letterSpacing: 0.2,
          }}>Bartender</Link>
          <Link to="/registrazione-owner" style={{
            background: "#c87a2c",
            color: "#fff",
            fontWeight: 700,
            fontSize: 24,
            border: "none",
            borderRadius: 14,
            padding: "14px 0",
            marginBottom: 0,
            textAlign: "center",
            textDecoration: "none",
            transition: "background 0.2s",
            width: 320,
            maxWidth: "80vw",
            boxShadow: "0 2px 8px #0003",
            letterSpacing: 0.2,
          }}>Proprietario</Link>
        </div>
      </div>

      <div>
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
            <p className="hero-mobile-badge" style={{ display: "none" }}>La community del bere consapevole</p>
            <h1 className="hero-mobile-title" style={{ fontSize: "clamp(28px, 7vw, 48px)", marginBottom: 20, fontWeight: 800, lineHeight: 1.2, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <span className="hero-mobile-title-line" style={{ color: "#ffffff" }}>Scopri i migliori</span>
              <span className="hero-mobile-title-line" style={{ color: "#f5a623" }}>locali del mondo</span>
            </h1>
            <p className="hero-mobile-subtitle" style={{ opacity: 0.85, marginBottom: 30, fontSize: "clamp(14px, 2.5vw, 18px)" }}>
              Recensioni autentiche, esperienze uniche, cultura del bere. Trova cocktail bar, rum bar e locali d'eccellenza nella tua citta.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", padding: "32px 20px 0" }}>
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
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <ArrowRight size={20} strokeWidth={2.5} />
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
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <MapPin size={20} strokeWidth={2.5} />
            Vedi Mappa
          </button>
        </div>

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
                {editingLocaleId === l.id && localeDraft ? (
                  <>
                    <img src={l.image_url ?? "https://via.placeholder.com/400x300"} alt={l.nome} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.92), rgba(0,0,0,0.55))", zIndex: 1 }} />
                    <div style={{ position: "relative", zIndex: 2, width: "100%", padding: 12, display: "grid", gap: 8 }}>
                      <input
                        value={localeDraft.nome ?? ""}
                        onChange={(e) => setLocaleDraft((prev) => ({ ...(prev || {}), nome: e.target.value }))}
                        placeholder="Nome locale"
                        style={{ borderRadius: 8, border: "1px solid #334155", background: "rgba(2,6,23,0.72)", color: "#fff", padding: "6px 8px", fontSize: 13 }}
                      />
                      <input
                        value={localeDraft.citta ?? ""}
                        onChange={(e) => setLocaleDraft((prev) => ({ ...(prev || {}), citta: e.target.value }))}
                        placeholder="Citta"
                        style={{ borderRadius: 8, border: "1px solid #334155", background: "rgba(2,6,23,0.72)", color: "#fff", padding: "6px 8px", fontSize: 13 }}
                      />
                      <textarea
                        value={localeDraft.descrizione ?? ""}
                        onChange={(e) => setLocaleDraft((prev) => ({ ...(prev || {}), descrizione: e.target.value }))}
                        placeholder="Testo breve"
                        rows={2}
                        style={{ borderRadius: 8, border: "1px solid #334155", background: "rgba(2,6,23,0.72)", color: "#fff", padding: "6px 8px", fontSize: 12, resize: "none" }}
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => saveLocaleEdit(l.id)}
                          disabled={savingLocaleId === l.id}
                          style={{ border: "none", borderRadius: 8, background: "#16a34a", color: "#fff", fontWeight: 700, fontSize: 12, padding: "6px 10px", cursor: "pointer", opacity: savingLocaleId === l.id ? 0.7 : 1 }}
                        >
                          {savingLocaleId === l.id ? "Salvataggio..." : "Salva"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelLocaleEdit}
                          style={{ border: "1px solid #64748b", borderRadius: 8, background: "rgba(15,23,42,0.8)", color: "#fff", fontWeight: 600, fontSize: 12, padding: "6px 10px", cursor: "pointer" }}
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <img src={l.image_url ?? "https://via.placeholder.com/400x300"} alt={l.nome} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)", zIndex: 2 }} />
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => startLocaleEdit(l)}
                        style={{ position: "absolute", top: 10, left: 10, zIndex: 3, border: "none", borderRadius: 8, background: "rgba(245,166,35,0.95)", color: "#111", fontWeight: 700, fontSize: 12, padding: "6px 10px", cursor: "pointer" }}
                      >
                        Modifica
                      </button>
                    )}
                    <div className="card-content" style={{ position: "relative", zIndex: 3, padding: 16, width: "100%" }}>
                      <h3 className="card-title" style={{ margin: "0 0 4px 0", fontSize: 18 }}>{l.nome}</h3>
                      <p className="card-subtitle" style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>{l.citta}</p>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        </section>

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

        <section className="content-section community-section" style={{ padding: "40px 60px", maxWidth: 1400, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 44px)", marginBottom: 16, fontWeight: 800 }}>Unisciti alla community</h2>
          <p style={{ fontSize: "clamp(14px, 2vw, 18px)", color: "#aaa", maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.6 }}>
            Condividi le tue esperienze, scopri nuovi locali e contribuisci alla cultura del bere consapevole.
          </p>
        </section>

        <div style={{ height: 60 }} />
        {/* Barra fissa in fondo con i tasti di registrazione */}
        <div style={{
          position: "fixed",
          left: 0,
          bottom: 0,
          width: "100vw",
          background: "#181818e6",
          boxShadow: "0 -2px 16px #0008",
          padding: "18px 0 22px 0",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          gap: 18,
          zIndex: 100,
        }}>
          <Link to="/registrazione" style={{
            background: "#c87a2c",
            color: "#fff",
            fontWeight: 700,
            fontSize: 20,
            border: "none",
            borderRadius: 12,
            padding: "12px 36px",
            textAlign: "center",
            textDecoration: "none",
            transition: "background 0.2s",
            minWidth: 160,
            boxShadow: "0 2px 8px #0003",
            letterSpacing: 0.2,
          }}>Utente</Link>
          <Link to="/registrazione-bartender" style={{
            background: "#c87a2c",
            color: "#fff",
            fontWeight: 700,
            fontSize: 20,
            border: "none",
            borderRadius: 12,
            padding: "12px 36px",
            textAlign: "center",
            textDecoration: "none",
            transition: "background 0.2s",
            minWidth: 160,
            boxShadow: "0 2px 8px #0003",
            letterSpacing: 0.2,
          }}>Bartender</Link>
          <Link to="/registrazione-owner" style={{
            background: "#c87a2c",
            color: "#fff",
            fontWeight: 700,
            fontSize: 20,
            border: "none",
            borderRadius: 12,
            padding: "12px 36px",
            textAlign: "center",
            textDecoration: "none",
            transition: "background 0.2s",
            minWidth: 160,
            boxShadow: "0 2px 8px #0003",
            letterSpacing: 0.2,
          }}>Proprietario</Link>
        </div>
      </div>
    </div>
  );
}
