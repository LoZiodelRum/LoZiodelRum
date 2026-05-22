import "../App.css";
// MainLayout ora solo via router
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
};

const HOME_HERO_VIDEO_VERSION = "2026-04-15-07";

export default function Home() {
  const { isAdmin } = useUser();
  const [locali, setLocali] = useState<Locale[]>([]);
  const [articoli, setArticoli] = useState<Articolo[]>([]);
  const [editingLocaleId, setEditingLocaleId] = useState<string | null>(null);
  const [localeDraft, setLocaleDraft] = useState<Partial<Locale> | null>(null);
  const [savingLocaleId, setSavingLocaleId] = useState<string | null>(null);
  const [heroVideoFailed, setHeroVideoFailed] = useState(false);
  const [heroVideoReady, setHeroVideoReady] = useState(false);
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

  function startLocaleEdit(locale: Locale) {
    setEditingLocaleId(locale.id);
    setLocaleDraft({
      nome: locale.nome || "",
      citta: locale.citta || "",
      descrizione: locale.descrizione || "",
      descrizione_completa: locale.descrizione_completa || "",
    });
  }

  function cancelLocaleEdit() {
    setEditingLocaleId(null);
    setLocaleDraft(null);
  }

  async function saveLocaleEdit(localeId: string) {
    if (!localeDraft) return;

    const adminPassword =
      localStorage.getItem("adminPassword") ||
      import.meta.env.VITE_ADMIN_PASSWORD ||
      "";

    if (!adminPassword) {
      alert("Password admin non disponibile. Esci e rientra come admin.");
      return;
    }

    const changes = {
      nome: (localeDraft.nome || "").trim(),
      citta: (localeDraft.citta || "").trim(),
      descrizione: (localeDraft.descrizione || "").trim() || null,
      descrizione_completa: (localeDraft.descrizione_completa || "").trim() || null,
    };

    if (!changes.nome) {
      alert("Il nome del locale non puo essere vuoto.");
      return;
    }

    setSavingLocaleId(localeId);

    const endpoints = [
      "/api/admin-save-locale",
      "/.netlify/functions/admin-save-locale",
    ];

    let lastMessage = "Salvataggio locale fallito lato server.";

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-password": adminPassword,
          },
          body: JSON.stringify({
            mode: "update",
            id: localeId,
            changes,
          }),
        });

        const payload = await response.json().catch(() => ({}));
        if (response.ok && payload?.ok) {
          lastMessage = "";
          break;
        }

        lastMessage = payload?.message || `HTTP ${response.status} su ${endpoint}`;
      } catch (e: any) {
        lastMessage = e?.message || `Errore di rete su ${endpoint}`;
      }
    }

    setSavingLocaleId(null);

    if (lastMessage) {
      alert(lastMessage);
      return;
    }

    setLocali((prev) =>
      prev.map((locale) =>
        locale.id === localeId
          ? {
              ...locale,
              ...changes,
            }
          : locale
      )
    );

    cancelLocaleEdit();
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

  const heroVideoSrc = `/home-hero.mp4?v=${HOME_HERO_VIDEO_VERSION}`;
  const heroVideoPoster =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1600">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1a130d" />
            <stop offset="55%" stop-color="#0d0f14" />
            <stop offset="100%" stop-color="#050608" />
          </linearGradient>
        </defs>
        <rect width="1200" height="1600" fill="url(#g)" />
        <circle cx="600" cy="620" r="220" fill="#f5a623" fill-opacity="0.10" />
        <text x="600" y="820" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" fill="#f5a623" font-weight="700">DrinkWise</text>
      </svg>
    `);

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
            min-height: 100svh !important;
            width: 100% !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            padding-top: 0 !important;
            padding-bottom: 72px !important;
            align-items: flex-end !important;
          }
          .hero-mobile-content {
            margin-top: 0 !important;
            padding: 0 16px 12px !important;
            width: 100% !important;
            max-width: none !important;
          }
          .hero-mobile-badge {
            display: inline-flex !important;
            align-items: center !important;
            gap: 8px !important;
            border: 1px solid rgba(245, 166, 35, 0.35) !important;
            background: rgba(245, 166, 35, 0.14) !important;
            color: #f5a623 !important;
            border-radius: 999px !important;
            width: fit-content !important;
            font-size: 12px !important;
            padding: 6px 10px !important;
            margin: 0 auto 16px auto !important;
          }
          .hero-mobile-title { font-size: clamp(28px, 7.2vw, 38px) !important; line-height: 1.08 !important; }
          .hero-mobile-title span {
            font-size: inherit !important;
            line-height: inherit !important;
            font-weight: inherit !important;
          }
          .hero-mobile-title-line {
            display: block !important;
            white-space: nowrap !important;
          }
          .hero-mobile-subtitle {
            font-size: clamp(14px, 5vw, 20px) !important;
            line-height: 1.4 !important;
            max-width: 300px !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .hero-mobile-buttons {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            margin-top: 24px !important;
            margin-bottom: 0 !important;
          }
          .hero-mobile-buttons {
            flex-direction: column !important;
            align-items: center !important;
            width: 100% !important;
          }
          .hero-mobile-btn {
            width: 52% !important;
            justify-content: flex-start !important;
            font-size: 0.7rem !important;
            padding: 8px 16px !important;
            border-radius: 10px !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
          }
          .content-section {
            padding: 10px 2px !important;
            max-width: 100% !important;
          }
          .content-section-first { padding-top: 104px !important; margin-top: 76px !important; }
          .section-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            padding: 0 2px !important;
          }
          .card-box {
            width: calc(100vw - 8px) !important;
            max-width: none !important;
            margin: 0 auto !important;
            height: auto !important;
            aspect-ratio: 16 / 10 !important;
            border-radius: 18px !important;
          }
          .section-header { margin-bottom: 16px !important; }
          .section-title { font-size: clamp(16px, 4.5vw, 20px) !important; line-height: 1.08 !important; }
          .community-section h2 { font-size: clamp(16px, 4.5vw, 20px) !important; }
          .community-section p { font-size: clamp(11px, 3vw, 13px) !important; }
          .section-subtitle { display: block !important; color: #8f8f8f !important; margin-top: 6px !important; font-size: clamp(14px, 3.8vw, 16px) !important; }
          .section-link { display: none !important; }
          .card-title { font-size: clamp(11px, 3.2vw, 14px) !important; line-height: 1.15 !important; }
          .card-subtitle { font-size: clamp(10px, 2.8vw, 12px) !important; }
          .card-rating { font-size: clamp(10px, 2.8vw, 12px) !important; padding: 4px 8px !important; top: 8px !important; right: 8px !important; }
          .card-content { padding: 10px !important; }
          .card-title-clamp {
            display: -webkit-box !important;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          /* Solo Locali: box piu larghi su mobile, testo invariato */
          .locali-section {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          .locali-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .locali-card {
            width: 100% !important;
            min-height: 220px !important;
            aspect-ratio: 16 / 10 !important;
            border-radius: 18px !important;
          }
        }

        @media (max-width: 1024px) {
        }

        @media (min-width: 481px) and (max-width: 768px) {
          .card-box { border-radius: 20px !important; }
        }

        @media (min-width: 390px) and (max-width: 430px) {
          .content-section { padding: 10px 2px !important; }
          .section-grid { gap: 12px !important; }
          .section-title { font-size: 18px !important; }
          .card-box { border-radius: 16px !important; }
          .card-title { font-size: 13px !important; }
          .card-subtitle { font-size: 10px !important; }
          .card-content { padding: 10px !important; }
          .card-title-clamp {
            -webkit-line-clamp: 3;
          }
        }

        @media (max-width: 380px) {
          .hero-mobile-title { font-size: 32px !important; }
          .hero-mobile-btn { font-size: 0.65rem !important; padding: 7px 14px !important; }
          .content-section { padding: 10px 2px !important; }
          .section-grid { gap: 10px !important; }
          .card-box { border-radius: 14px !important; }
          .card-title { font-size: 11px !important; }
          .card-subtitle { font-size: 10px !important; }
          .card-content { padding: 8px !important; }
          .card-rating { font-size: 10px !important; padding: 3px 6px !important; }
          .card-title-clamp {
            -webkit-line-clamp: 3;
          }
        }

        @media (min-width: 769px) {
          .content-section { padding: 40px 60px !important; }
          .content-section-first { margin-top: 68px !important; }
          .section-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 20px !important; }
          .card-box { height: 220px !important; aspect-ratio: auto !important; }
          .hero-section {
            align-items: flex-end !important;
            justify-content: center !important;
            padding: 0 28px 112px !important;
          }
          .hero-mobile-content {
            width: min(100%, 1180px) !important;
            max-width: 1180px !important;
            padding: 0 24px !important;
          }
          .hero-mobile-buttons {
            margin-top: 24px !important;
          }
        }

        @media (min-width: 1024px) {
          .hero-video-desktop {
            object-fit: cover !important;
            object-position: center 38% !important;
            transform: scale(0.95) !important;
            transform-origin: center center !important;
          }
        }
      `}</style>

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
          backgroundColor: "#0b0b0b",
          backgroundImage: "linear-gradient(180deg, rgba(26,19,13,1) 0%, rgba(13,15,20,1) 55%, rgba(5,6,8,1) 100%)",
        }}
      >
        <video
          className="hero-video-desktop"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={heroVideoPoster}
          aria-hidden="true"
          onLoadedData={() => setHeroVideoReady(true)}
          onError={() => setHeroVideoFailed(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
            opacity: heroVideoFailed ? 0 : heroVideoReady ? 1 : 0,
            transition: "opacity 240ms ease",
          }}
        >
          <source src={heroVideoSrc} type="video/mp4" />
        </video>
        {heroVideoFailed && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(26,19,13,1) 0%, rgba(13,15,20,1) 55%, rgba(5,6,8,1) 100%)",
              zIndex: 0,
            }}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0.38) 45%, rgba(0,0,0,0.86) 100%)", zIndex: 1 }} />
        <div className="hero-mobile-content" style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1180, padding: "0 20px 6px" }}>
          <p className="hero-mobile-badge" style={{ display: "none" }}>La community del bere consapevole</p>
          <h1 className="hero-mobile-title" style={{ fontSize: "clamp(20px, 4vw, 32px)", marginBottom: 20, fontWeight: 800, lineHeight: 1.2, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
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
                  {/* Modifica rimossa su richiesta */}
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
              <img src={a.immagine ?? "https://via.placeholder.com/400x300"} alt={a.titolo} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scale(0.9)", transformOrigin: "center", zIndex: 0, borderRadius: 18 }} />
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

    </div>
  );
}