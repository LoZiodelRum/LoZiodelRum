import "../App.css";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

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
  const fallbackArticleImage = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1600";

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("articoli")
      .select("*")
      .order("data_creazione", { ascending: false });

    if (data) {
      setArticles(data);
    }
  }

  if (!articles.length) {
    return <div className="page fade-in" style={{ padding: 40, marginTop: 24 }}>Nessun articolo</div>;
  }

  const hero = articles.find((a) => (a.titolo || "").trim().length > 0 && (a.descrizione || "").trim().length > 0);
  const others = hero ? articles.filter((a) => a.id !== hero.id) : articles;

  return (
    <div className="page fade-in magazine-page-mobile" style={{ paddingTop: 24 }}>

      {/* HERO */}
      {hero && (
        <Link
          to={`/magazine/${hero.id}`}
          className="magazine-hero"
          style={{ backgroundImage: `url(${hero.immagine || fallbackArticleImage})` }}
        >
          <div className="magazine-hero-overlay">
            {hero.categoria && <span className="badge-category">{hero.categoria}</span>}
            <h1 className="magazine-hero-title-single">{hero.titolo}</h1>
            <p>{hero.descrizione}</p>
          </div>
        </Link>
      )}

      {/* GRID */}
      <h2 className="mobile-articles-title">Articoli</h2>
      <div className="cocktail-grid">
        {others.map((a) => (
          <Link key={a.id} to={`/magazine/${a.id}`} className="drink-card">
            <img
              src={a.immagine || fallbackArticleImage}
              alt={a.titolo || "Articolo"}
              style={{ transform: "scale(0.9)", transformOrigin: "center" }}
            />
            <div className="drink-card-overlay">
              {a.categoria && <span className="badge-category">{a.categoria}</span>}
              <h3>{a.titolo || "Articolo senza titolo"}</h3>
              {a.descrizione && <p>{a.descrizione}</p>}
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}