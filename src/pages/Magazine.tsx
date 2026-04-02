import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

type Article = {
  id: string;
  titolo: string;
  descrizione: string;
  immagine: string;
  categoria: string;
  data_creazione: string;
};

export default function Magazine() {
  const [articles, setArticles] = useState<Article[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("articoli")
      .select("*")
      .order("data_creazione", { ascending: false });

    if (data) {
      setArticles(data.slice(0, 6)); // 👉 SOLO 6 ANTEPRIME
    }
  }

  if (!articles.length) {
    return <div style={{ padding: 40 }}>Nessun articolo</div>;
  }

  const hero = articles[0];
  const others = articles.slice(1);

  return (
    <div style={container}>
      
      {/* HERO */}
      <div
        style={{
          ...heroBox,
          backgroundImage: `url(${hero.immagine})`,
        }}
        onClick={() => navigate(`/magazine/${hero.id}`)}
      >
        <div style={overlay}>
          <span style={badge}>{hero.categoria}</span>
          <h1 style={heroTitle}>{hero.titolo}</h1>
          <p style={heroDesc}>{hero.descrizione}</p>
        </div>
      </div>

      {/* GRID */}
      <div style={grid}>
        {others.map((a) => (
          <div
            key={a.id}
            style={card}
            onClick={() => navigate(`/magazine/${a.id}`)}
          >
            <img src={a.immagine} style={img} />

            <div style={cardOverlay}>
              <span style={badge}>{a.categoria}</span>
              <h3 style={cardTitle}>{a.titolo}</h3>
              <p style={cardDesc}>{a.descrizione}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* STILI */

const container = {
  padding: 20,
  background: "#000",
  minHeight: "100vh",
};

const heroBox = {
  height: 400,
  borderRadius: 20,
  backgroundSize: "cover",
  backgroundPosition: "center",
  marginBottom: 30,
  cursor: "pointer",
  position: "relative" as const,
};

const overlay = {
  position: "absolute" as const,
  bottom: 0,
  padding: 30,
  background: "linear-gradient(transparent, rgba(0,0,0,0.9))",
  width: "100%",
};

const heroTitle = {
  color: "#fff",
  fontSize: 36,
  margin: "10px 0",
};

const heroDesc = {
  color: "#ccc",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 20,
};

const card = {
  borderRadius: 16,
  overflow: "hidden",
  cursor: "pointer",
  position: "relative" as const,
};

const img = {
  width: "100%",
  height: 200,
  objectFit: "cover" as const,
};

const cardOverlay = {
  position: "absolute" as const,
  bottom: 0,
  padding: 15,
  background: "linear-gradient(transparent, rgba(0,0,0,0.9))",
  width: "100%",
};

const cardTitle = {
  color: "#fff",
  fontSize: 16,
};

const cardDesc = {
  color: "#bbb",
  fontSize: 12,
};

const badge = {
  background: "#2e7e79",
  color: "#fff",
  padding: "4px 8px",
  borderRadius: 6,
  fontSize: 12,
};