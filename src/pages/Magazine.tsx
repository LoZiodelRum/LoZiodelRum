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
    return <div className="page fade-in" style={{ padding: 40 }}>Nessun articolo</div>;
  }

  const hero = articles[0];
  const others = articles.slice(1);

  return (
    <div className="page fade-in">

      {/* HERO */}
      <Link
        to={`/magazine/${hero.id}`}
        className="magazine-hero"
        style={{ backgroundImage: `url(${hero.immagine})` }}
      >
        <div className="magazine-hero-overlay">
          <span className="badge-category">{hero.categoria}</span>
          <h1>{hero.titolo}</h1>
          <p>{hero.descrizione}</p>
        </div>
      </Link>

      {/* GRID */}
      <div className="cocktail-grid">
        {others.map((a) => (
          <Link key={a.id} to={`/magazine/${a.id}`} className="drink-card">
            <img src={a.immagine} alt={a.titolo} />
            <div className="drink-card-overlay">
              <span className="badge-category">{a.categoria}</span>
              <h3>{a.titolo}</h3>
              <p>{a.descrizione}</p>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}