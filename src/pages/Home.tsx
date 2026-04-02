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
      {/* NAVBAR */}
      {false && (
      <div
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
          <span onClick={() => navigate("/")}>Home</span>
          <span onClick={() => navigate("/mappa")}>Mappa</span>
          <span onClick={() => navigate("/drink")}>Drink</span>
          <span onClick={() => navigate("/magazine")}>Magazine</span>
          <span onClick={() => navigate("/community")}>Community</span>
          <span onClick={() => navigate("/dashboard")}>Dashboard</span>

          <span
            style={{ color: "#f5a623", fontWeight: "bold" }}
            onClick={() => navigate("/crea")}
          >
            Crea
          </span>

          {/* 🔥 CHIAVE (RESA VISIBILE) */}
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
      )}

      {/* HERO */}
      <div
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
              padding: "14px 22px",
              borderRadius: 8,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Entra nella Community
          </button>
        </div>
      </div>

      {/* COCKTAIL */}
      <div className="page fade-in">
        <div className="content-wrapper">
          <h2 className="mt-20" style={{ marginBottom: 12, color: "#1f2937", fontSize: "16px" }}>Cocktail</h2>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            <Link className="btn-primary btn-small" to="/categoria/cocktail">Cocktail</Link>
            <Link className="btn-primary btn-small" to="/categoria/rum">Rum</Link>
            <Link className="btn-primary btn-small" to="/categoria/whisky">Whisky</Link>
            <Link className="btn-primary btn-small" to="/drinks">Tutti</Link>
          </div>

          <div
            className="grid-wrapper"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {drinks.map((d) => (
              <Link
                key={d.id}
                to={`/drink/${d.id}`}
                style={{
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#111",
                  cursor: "pointer",
                  display: "block",
                }}
              >
                <img
                  src={
                    d.immagine ||
                    "https://via.placeholder.com/400x200?text=Drink"
                  }
                  style={{ width: "100%", height: "56px", objectFit: "cover" }}
                  className="img-mobile-small"
                />

                <div style={{ padding: 8 }}>
                  <h3 style={{ fontSize: "11px", margin: "3px 0" }}>{d.nome || "Drink"}</h3>
                  <p style={{ opacity: 0.7, margin: 0, textTransform: "capitalize", fontSize: "10px" }}>{d.categoria}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* LOCALI */}
      <div style={{ padding: "0 20px 30px 20px" }}>
        <h2 style={{ marginBottom: 12, fontSize: "18px" }}>Locali</h2>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <Link className="btn-primary btn-small" to="/venues">Tutti</Link>
        </div>

        <div
          className="grid-wrapper"
          style={{
            gap: 12,
          }}
        >
          {locali.map((l) => (
            <Link
              key={l.id}
              to={`/venue/${l.id}`}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                background: "#111",
                cursor: "pointer",
                display: "block",
              }}
            >
              <img
                src={
                  l.image_url ||
                  "https://via.placeholder.com/400x200?text=Locale"
                }
                style={{ width: "100%", height: "70px", objectFit: "cover" }}
                className="img-mobile-small"
              />
              <div style={{ padding: 10 }}>
                <h3 style={{ fontSize: "12px", margin: "2px 0" }}>{l.nome}</h3>
                <p style={{ opacity: 0.6, fontSize: "10px", margin: 0 }}>{l.citta}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* MAGAZINE */}
      <div style={{ padding: "0 20px 30px 20px" }}>
        <h2 style={{ marginBottom: 12, fontSize: "18px" }}>Magazine</h2>

        <div className="grid-wrapper" style={{ gap: 12 }}>
          {articoli.map((a) => (
            <Link
              key={a.id}
              to={`/magazine/${a.id}`}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                background: "#111",
                cursor: "pointer",
                display: "block",
              }}
            >
              <img
                src={
                  a.immagine ||
                  "https://via.placeholder.com/400x200?text=Articolo"
                }
                style={{ width: "100%", height: "70px", objectFit: "cover" }}
                className="img-mobile-small"
              />

              <div style={{ padding: 10 }}>
                <h3 style={{ fontSize: "12px", margin: 0 }}>{a.titolo || "Articolo"}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}