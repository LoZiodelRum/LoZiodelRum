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
  const [menuOpen, setMenuOpen] = useState(false);
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

  function handleAdminAccess() {
    const password = window.prompt("Inserisci la password admin");

    if (password === "850877") {
      navigate("/admin/users");
      return;
    }

    if (password !== null) {
      alert("Password errata");
    }
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
          .navbar-desktop { display: none !important; }
          .navbar-mobile { display: flex !important; }
          .hero-section { display: none !important; }
          .content-section { padding: 16px !important; }
          .content-section-first { padding-top: 92px !important; }
          .section-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 14px !important; }
          .card-box { height: auto !important; aspect-ratio: 1 / 1 !important; border-radius: 18px !important; }
          .section-header { margin-bottom: 16px !important; }
          .section-title { font-size: 54px !important; line-height: 1.08 !important; }
          .section-subtitle { display: block !important; color: #8f8f8f !important; margin-top: 6px !important; font-size: 16px !important; }
          .section-link { display: none !important; }
          .community-section { display: none !important; }
        }
        @media (min-width: 769px) {
          .navbar-mobile { display: none !important; }
          .navbar-desktop { display: flex !important; }
          .menu-mobile { display: none !important; }
          .content-section { padding: 40px 60px !important; }
          .section-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 20px !important; }
          .card-box { height: 220px !important; aspect-ratio: auto !important; }
        }
      `}</style>

      <nav
        className="navbar-mobile"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          background: "#0b0808",
          padding: "12px 16px",
          display: "none",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 1000,
          boxSizing: "border-box",
        }}
      >
        <div
          onClick={() => navigate("/")}
          style={{
            fontWeight: "bold",
            color: "#f5a623",
            fontSize: 18,
            cursor: "pointer",
          }}
        >
          Lo Zio del Rum
        </div>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            width: 40,
            height: 40,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
          }}
          aria-label="Apri menu"
        >
          <div
            style={{
              width: 24,
              height: 2,
              background: "#fff",
              transition: "all .25s ease",
              transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
            }}
          />
          <div
            style={{
              width: 24,
              height: 2,
              background: "#fff",
              opacity: menuOpen ? 0 : 1,
              transition: "opacity .25s ease",
            }}
          />
          <div
            style={{
              width: 24,
              height: 2,
              background: "#fff",
              transition: "all .25s ease",
              transform: menuOpen ? "rotate(-45deg) translate(6px, -6px)" : "none",
            }}
          />
        </button>
      </nav>

      {menuOpen && (
        <div
          className="menu-mobile"
          style={{
            position: "fixed",
            top: 60,
            left: 0,
            right: 0,
            background: "rgba(0, 0, 0, 0.98)",
            backdropFilter: "blur(10px)",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            zIndex: 999,
          }}
        >
          <Link to="/" onClick={() => setMenuOpen(false)} style={{ color: "#fff", textDecoration: "none", padding: 10 }}>Home</Link>
          <Link to="/mappa" onClick={() => setMenuOpen(false)} style={{ color: "#fff", textDecoration: "none", padding: 10 }}>Mappa</Link>
          <Link to="/drink" onClick={() => setMenuOpen(false)} style={{ color: "#fff", textDecoration: "none", padding: 10 }}>Drink</Link>
          <Link to="/magazine" onClick={() => setMenuOpen(false)} style={{ color: "#fff", textDecoration: "none", padding: 10 }}>Magazine</Link>
          <Link to="/community" onClick={() => setMenuOpen(false)} style={{ color: "#fff", textDecoration: "none", padding: 10 }}>Community</Link>
          <Link to="/crea" onClick={() => setMenuOpen(false)} style={{ color: "#f5a623", textDecoration: "none", padding: 10, fontWeight: "bold" }}>Crea</Link>
        </div>
      )}

      <div
        className="navbar-desktop"
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          height: 70,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          zIndex: 1000,
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontWeight: "bold", color: "#f5a623", cursor: "pointer" }} onClick={() => navigate("/")}>Lo Zio del Rum</div>
        <div style={{ display: "flex", gap: 25, alignItems: "center" }}>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>Home</span>
          <span onClick={() => navigate("/mappa")} style={{ cursor: "pointer" }}>Mappa</span>
          <span onClick={() => navigate("/drink")} style={{ cursor: "pointer" }}>Drink</span>
          <span onClick={() => navigate("/magazine")} style={{ cursor: "pointer" }}>Magazine</span>
          <span onClick={() => navigate("/community")} style={{ cursor: "pointer" }}>Community</span>
          <span onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>Dashboard</span>
          <span style={{ color: "#f5a623", fontWeight: "bold", cursor: "pointer" }} onClick={() => navigate("/crea")}>Crea</span>
          <span style={{ cursor: "pointer", fontSize: 26, marginLeft: 10, display: "flex", alignItems: "center" }} onClick={handleAdminAccess} title="Accesso amministratore">🔑</span>
        </div>
      </div>

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
        <div style={{ position: "relative", zIndex: 2, maxWidth: "90%", padding: "0 20px" }}>
          <p style={{ color: "#f5a623", marginBottom: 10, fontSize: "clamp(14px, 3vw, 16px)" }}>La community del bere consapevole</p>
          <h1 style={{ fontSize: "clamp(28px, 7vw, 48px)", marginBottom: 20, fontWeight: 800, lineHeight: 1.2 }}>
            Scopri i migliori <br />
            <span style={{ color: "#f5a623" }}>locali del mondo</span>
          </h1>
          <p style={{ opacity: 0.85, marginBottom: 30, fontSize: "clamp(14px, 2.5vw, 18px)" }}>
            Recensioni autentiche, esperienze uniche, cultura del bere.
          </p>
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
            }}
          >
            Esplora Locali
          </button>
        </div>
      </div>

      <section className="content-section content-section-first" style={{ padding: "40px 60px", maxWidth: 1400, margin: "0 auto" }}>
        <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h2 className="section-title" style={{ fontSize: "clamp(24px, 4vw, 32px)", margin: 0 }}>⭐ Locali in Evidenza</h2>
            <p className="section-subtitle" style={{ display: "none" }}>Selezionati dalla nostra redazione</p>
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
                <h3 style={{ margin: "0 0 4px 0", fontSize: 18 }}>{l.nome}</h3>
                <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>{l.citta}</p>
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
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{a.titolo}</h3>
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
              <div style={{ position: "absolute", top: 12, right: 12, background: "#f5a623", color: "#0b0b0b", padding: "6px 12px", borderRadius: 8, fontWeight: "bold", fontSize: 14, zIndex: 3 }}>
                {`★ ${r.rating.toFixed(1)}`}
              </div>
              <div style={{ position: "relative", zIndex: 2, padding: 16, width: "100%" }}>
                <h3 style={{ margin: "0 0 4px 0", fontSize: 16 }}>{r.locale_nome ?? "Locale"}</h3>
                <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>{`Lo Zio del Rum - ${r.autore}`}</p>
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
