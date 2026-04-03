import "../App.css";
import React from "react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";

type Locale = {
  id: string;
  nome: string;
  citta: string;
  image_url: string | null;
};

type Drink = {
  id: string;
  nome: string;
  tipo: "cocktail" | "distillato";
  categoria: string;
  immagine: string | null;
};

type Articolo = {
  id: string;
  titolo: string;
  immagine: string | null;
};

export default function Home() {
  const [locali, setLocali] = useState<Locale[]>([]);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [articoli, setArticoli] = useState<Articolo[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLocali();
    fetchDrinks();
    fetchArticoli();
  }, []);

  async function fetchLocali() {
    const { data, error } = await supabase
      .from("Locali")
      .select("*")
      .eq("status", "approved")
      .limit(8);

    if (error) {
      console.error("Errore locali:", error);
      return;
    }

    setLocali((data || []).slice(0, 6));
  }

  async function fetchDrinks() {
    const [{ data: cocktailData, error: cocktailError }, { data: distillatiData, error: distillatiError }] = await Promise.all([
      supabase.from("cocktail").select("id,nome,immagine,immagine_url").limit(6),
      supabase.from("distillati").select("id,nome,categoria,immagine,immagine_url").limit(6),
    ]);

    if (cocktailError || distillatiError) {
      console.error("Errore drink:", cocktailError || distillatiError);
      return;
    }

    const cocktail = (cocktailData || []).map((c: any) => ({
      id: c.id,
      nome: c.nome,
      tipo: "cocktail" as const,
      categoria: "cocktail",
      immagine: c.immagine || c.immagine_url || null,
    }));

    const distillati = (distillatiData || []).map((d: any) => {
      const categoria = String(d.categoria || "altri").toLowerCase();
      return {
        id: d.id,
        nome: d.nome,
        tipo: "distillato" as const,
        categoria,
        immagine: d.immagine || d.immagine_url || null,
      };
    });

    setDrinks([...cocktail, ...distillati].slice(0, 6));
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

    setArticoli(data || []);
  }

  function handleAdminAccess() {
    const password = window.prompt("Inserisci la password admin");

    if (password === "850877") {
      navigate("/admin/users");
    } else if (password !== null) {
      alert("Password errata");
    }
  }

  return (
    <div
      className="page page-full-bleed fade-in"
      style={{
        background: "#0b0b0b",
        color: "#fff",
        margin: 0,
        padding: 0,
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .navbar-desktop { display: none !important; }
          .navbar-mobile { display: flex !important; }
          .hero-section { padding-top: 60px !important; }
        }
        @media (min-width: 769px) {
          .navbar-mobile { display: none !important; }
          .navbar-desktop { display: flex !important; }
          .menu-mobile { display: none !important; }
        }
      `}</style>

      {/* NAVBAR MOBILE CON HAMBURGER MENU */}
      <nav
        className="navbar-mobile"
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          background: "rgba(0, 0, 0, 0.95)",
          backdropFilter: "blur(10px)",
          padding: "12px 16px",
          display: "none",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 1000,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          style={{
            fontWeight: "bold",
            color: "#f5a623",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          Lo Zio del Rum
        </div>

        {/* HAMBURGER MENU BUTTON */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "24px",
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "2px",
              background: "#fff",
              transition: "all 0.3s",
              transform: menuOpen ? "rotate(45deg) translate(8px, 8px)" : "none",
            }}
          />
          <div
            style={{
              width: "24px",
              height: "2px",
              background: "#fff",
              opacity: menuOpen ? 0 : 1,
              transition: "opacity 0.3s",
            }}
          />
          <div
            style={{
              width: "24px",
              height: "2px",
              background: "#fff",
              transition: "all 0.3s",
              transform: menuOpen ? "rotate(-45deg) translate(8px, -8px)" : "none",
            }}
          />
        </button>
      </nav>

      {/* MOBILE MENU DROPDOWN */}
      {menuOpen && (
        <div
          className="menu-mobile"
          style={{
            position: "fixed",
            top: "60px",
            left: 0,
            right: 0,
            background: "rgba(0, 0, 0, 0.98)",
            backdropFilter: "blur(10px)",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            zIndex: 999,
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            style={{ color: "#fff", textDecoration: "none", padding: "10px" }}
          >
            Home
          </Link>
          <Link
            to="/mappa"
            onClick={() => setMenuOpen(false)}
            style={{ color: "#fff", textDecoration: "none", padding: "10px" }}
          >
            Mappa
          </Link>
          <Link
            to="/drink"
            onClick={() => setMenuOpen(false)}
            style={{ color: "#fff", textDecoration: "none", padding: "10px" }}
          >
            Drink
          </Link>
          <Link
            to="/magazine"
            onClick={() => setMenuOpen(false)}
            style={{ color: "#fff", textDecoration: "none", padding: "10px" }}
          >
            Magazine
          </Link>
          <Link
            to="/community"
            onClick={() => setMenuOpen(false)}
            style={{ color: "#fff", textDecoration: "none", padding: "10px" }}
          >
            Community
          </Link>
          <Link
            to="/crea"
            onClick={() => setMenuOpen(false)}
            style={{
              color: "#f5a623",
              textDecoration: "none",
              padding: "10px",
              fontWeight: "bold",
            }}
          >
            Crea
          </Link>
        </div>
      )}

      {/* NAVBAR DESKTOP */}
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
        }}
      >
        <div
          style={{ fontWeight: "bold", color: "#f5a623", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          Lo Zio del Rum
        </div>

        <div style={{ display: "flex", gap: 25, alignItems: "center" }}>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            Home
          </span>
          <span onClick={() => navigate("/mappa")} style={{ cursor: "pointer" }}>
            Mappa
          </span>
          <span onClick={() => navigate("/drink")} style={{ cursor: "pointer" }}>
            Drink
          </span>
          <span onClick={() => navigate("/magazine")} style={{ cursor: "pointer" }}>
            Magazine
          </span>
          <span onClick={() => navigate("/community")} style={{ cursor: "pointer" }}>
            Community
          </span>
          <span onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
            Dashboard
          </span>

          <span
            style={{ color: "#f5a623", fontWeight: "bold", cursor: "pointer" }}
            onClick={() => navigate("/crea")}
          >
            Crea
          </span>

          <span
            style={{
              cursor: "pointer",
              fontSize: 26,
              marginLeft: 10,
              display: "flex",
              alignItems: "center",
            }}
            onClick={handleAdminAccess}
            title="Accesso amministratore"
          >
            🔑
          </span>
        </div>
      </div>

      {/* HERO */}
      <div
        className="hero-section"
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1920')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          paddingTop: 70,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.95))",
          }}
        />

        <div style={{ position: "relative", zIndex: 2, maxWidth: "min(100%, 50rem)" }}>
          <p style={{ color: "#f5a623", marginBottom: 10 }}>
            La community del bere consapevole
          </p>

          <h1 style={{ fontSize: "clamp(2rem, 7vw, 3.25rem)", marginBottom: 20 }}>
            Scopri i migliori <br />
            <span style={{ color: "#f5a623" }}>locali del mondo</span>
          </h1>

          <p style={{ opacity: 0.8 }}>
            Recensioni autentiche, esperienze uniche, cultura del bere.
          </p>

          {/* CTA */}
          <button
            onClick={() => navigate("/auth")}
            style={{
              marginTop: 20,
              background: "#f5a623",
              border: "none",
              padding: "14px 28px",
              borderRadius: 8,
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            Entra nella Community
          </button>
        </div>
      </div>

      {/* DRINK */}
      <div className="page page-section fade-in" style={{ minHeight: 0 }}>
        <div className="content-wrapper" style={{ width: "min(100%, 420px)", padding: "14px 16px" }}>
          <div className="section-header" style={{ justifyContent: "flex-start", alignItems: "center", gap: 14, marginBottom: 0 }}>
            <h2 className="section-title" style={{ color: "#f5a623" }}>Drink</h2>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: 4 }}>
              <Link className="btn-primary btn-small" to="/categoria/cocktail">Cocktail</Link>
              <Link className="btn-primary btn-small" to="/drink">Distillati</Link>
            </div>
          </div>
        </div>
      </div>

      {/* LOCALI */}
      <div className="page page-section" style={{ minHeight: 0 }}>
        <div className="section-header">
          <h2 className="section-title" style={{ color: "#fff" }}>Locali</h2>
          <Link className="btn-primary btn-small" to="/venues">Vedi tutti</Link>
        </div>

        <div className="content-grid">
          {locali.map((l) => (
            <Link key={l.id} to={`/venue/${l.id}`} className="preview-card">
              <img
                src={l.image_url || "https://via.placeholder.com/400x200?text=Locale"}
                alt={l.nome}
              />
              <div className="preview-card-body">
                <h3>{l.nome}</h3>
                <p>{l.citta}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* MAGAZINE */}
      <div className="page page-section" style={{ minHeight: 0, paddingBottom: 40 }}>
        <div className="section-header">
          <h2 className="section-title" style={{ color: "#fff" }}>Magazine</h2>
        </div>

        <div className="content-grid">
          {articoli.map((a) => (
            <Link key={a.id} to={`/magazine/${a.id}`} className="preview-card">
              <img
                src={a.immagine || "https://via.placeholder.com/400x200?text=Articolo"}
                alt={a.titolo}
              />
              <div className="preview-card-body">
                <h3>{a.titolo || "Articolo"}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}