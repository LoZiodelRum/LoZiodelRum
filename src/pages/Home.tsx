import "../App.css";
import React from "react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

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

export default function Home() {
  const [locali, setLocali] = useState<Locale[]>([]);
  const [articoli, setArticoli] = useState<Articolo[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLocali();
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

    setLocali(data || []);
  }

  async function fetchArticoli() {
    const { data, error } = await supabase
      .from("articoli")
      .select("*")
      .eq("pubblicato", true)
      .limit(8);

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

      {/* LOCALI */}
      <div style={{ padding: "60px 40px" }}>
        <h2 style={{ marginBottom: 20 }}>Locali</h2>

        <div
          className="grid-wrapper"
          style={{
            gap: 20,
          }}
        >
          {locali.map((l) => (
            <div
              key={l.id}
              onClick={() => navigate(`/locale/${l.id}`)}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                background: "#111",
                cursor: "pointer",
              }}
            >
              <img
                src={
                  l.image_url ||
                  "https://via.placeholder.com/400x200?text=Locale"
                }
                style={{ width: "100%", height: 180, objectFit: "cover" }}
              />
              <div style={{ padding: 15 }}>
                <h3>{l.nome}</h3>
                <p style={{ opacity: 0.6 }}>{l.citta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ARTICOLI */}
      <div style={{ padding: "0 40px 60px 40px" }}>
        <h2 style={{ marginBottom: 20 }}>Articoli</h2>

        {articoli.length === 0 && <p>Nessun articolo trovato</p>}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
          }}
        >
          {articoli.map((a) => (
            <div
              key={a.id}
              onClick={() => navigate(`/articolo/${a.id}`)}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                background: "#111",
                cursor: "pointer",
              }}
            >
              <img
                src={
                  a.immagine ||
                  "https://via.placeholder.com/400x200?text=Articolo"
                }
                style={{ width: "100%", height: 180, objectFit: "cover" }}
              />

              <div style={{ padding: 15 }}>
                <h3>{a.titolo || "Articolo"}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}