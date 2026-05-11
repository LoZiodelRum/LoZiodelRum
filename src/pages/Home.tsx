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

  return (
    <div style={{ background: "#0b0b0b", minHeight: "100vh", width: "100vw" }}>
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

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0.38) 45%, rgba(0,0,0,0.86) 100%)",
              zIndex: 1,
            }}
          />

          <div
            className="hero-mobile-content"
            style={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              maxWidth: 1180,
              padding: "0 20px 6px",
            }}
          >
            <h1
              className="hero-mobile-title"
              style={{
                fontSize: "clamp(28px, 7vw, 48px)",
                marginBottom: 20,
                fontWeight: 800,
                lineHeight: 1.2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <span style={{ color: "#ffffff" }}>
                Scopri i migliori
              </span>

              <span style={{ color: "#f5a623" }}>
                locali del mondo
              </span>
            </h1>

            <p
              className="hero-mobile-subtitle"
              style={{
                opacity: 0.85,
                marginBottom: 30,
                fontSize: "clamp(14px, 2.5vw, 18px)",
                color: "#fff",
              }}
            >
              Recensioni autentiche, esperienze uniche, cultura del bere.
              Trova cocktail bar, rum bar e locali d'eccellenza nella tua città.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
            padding: "32px 20px 0",
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

        <section
          style={{
            padding: "40px 60px",
            maxWidth: 1400,
            margin: "68px auto 0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 28,
            }}
          >
            <h2
              style={{
                fontSize: "clamp(24px, 4vw, 32px)",
                margin: 0,
                color: "#fff",
              }}
            >
              Locali in evidenza
            </h2>

            <Link
              to="/venues"
              style={{
                color: "#f5a623",
                textDecoration: "none",
              }}
            >
              Vedi tutti
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 20,
            }}
          >
            {locali.map((l) => (
              <article
                key={l.id}
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
                }}
                onClick={() => navigate(`/venue/${l.id}`)}
              >
                <img
                  src={l.image_url ?? "https://via.placeholder.com/400x300"}
                  alt={l.nome}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    zIndex: 0,
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                    zIndex: 2,
                  }}
                />

                <div
                  style={{
                    position: "relative",
                    zIndex: 3,
                    padding: 16,
                    width: "100%",
                  }}
                >
                  <h3 style={{ margin: "0 0 4px 0", fontSize: 18 }}>
                    {l.nome}
                  </h3>

                  <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>
                    {l.citta}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          style={{
            padding: "40px 60px",
            maxWidth: 1400,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 28,
            }}
          >
            <h2
              style={{
                fontSize: "clamp(24px, 4vw, 32px)",
                margin: 0,
                color: "#fff",
              }}
            >
              Ultimi Articoli
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 20,
            }}
          >
            {articoli.map((a) => (
              <Link
                key={a.id}
                to={`/magazine/${a.id}`}
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
                <img
                  src={a.immagine ?? "https://via.placeholder.com/400x300"}
                  alt={a.titolo}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    zIndex: 0,
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 35%, transparent 65%)",
                    zIndex: 1,
                  }}
                />

                <div
                  style={{
                    position: "relative",
                    zIndex: 2,
                    padding: "16px 16px 8px 16px",
                    width: "100%",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 600,
                    }}
                  >
                    {a.titolo}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section
          style={{
            padding: "40px 60px",
            maxWidth: 1400,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(28px, 5vw, 44px)",
              marginBottom: 16,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            Unisciti alla community
          </h2>

          <p
            style={{
              fontSize: "clamp(14px, 2vw, 18px)",
              color: "#aaa",
              maxWidth: 600,
              margin: "0 auto 32px",
              lineHeight: 1.6,
            }}
          >
            Condividi le tue esperienze, scopri nuovi locali e contribuisci alla
            cultura del bere consapevole.
          </p>

        </section>

        <div style={{ height: 120 }} />

        {/* Barra fissa */}
        <div
          style={{
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
          }}
        >
          <Link
            to="/registrazione"
            style={{
              background: "#c87a2c",
              color: "#fff",
              fontWeight: 700,
              fontSize: 20,
              borderRadius: 12,
              padding: "12px 36px",
              textAlign: "center",
              textDecoration: "none",
              minWidth: 160,
            }}
          >
            Utente
          </Link>

          <Link
            to="/registrazione-bartender"
            style={{
              background: "#c87a2c",
              color: "#fff",
              fontWeight: 700,
              fontSize: 20,
              borderRadius: 12,
              padding: "12px 36px",
              textAlign: "center",
              textDecoration: "none",
              minWidth: 160,
            }}
          >
            Bartender
          </Link>

          <Link
            to="/registrazione-owner"
            style={{
              background: "#c87a2c",
              color: "#fff",
              fontWeight: 700,
              fontSize: 20,
              borderRadius: 12,
              padding: "12px 36px",
              textAlign: "center",
              textDecoration: "none",
              minWidth: 160,
            }}
          >
            Proprietario
          </Link>
        </div>
      </div>
    </div>
  );
}