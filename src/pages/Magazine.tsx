import Navbar from "../components/Navbar";
import "../App.css";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getTranslatedField } from "../utils/getTranslatedField";

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
  const { t, i18n } = useTranslation("translation");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("articoli")
      .select("id, titolo, titolo_en, titolo_bg, descrizione, descrizione_en, descrizione_bg, immagine, categoria, categoria_en, categoria_bg, data_creazione")
      .order("data_creazione", { ascending: false });

    if (data) {
      setArticles(data);
    }
  }

  if (!articles.length) {
    return <><Navbar /><div className="page fade-in" style={{ padding: 40 }}>{t("noArticles")}</div></>;
  }

  const hero = articles.find((a) => (a.titolo || "").trim().length > 0 && (a.descrizione || "").trim().length > 0);
  const others = hero ? articles.filter((a) => a.id !== hero.id) : articles;

  return (
    <>
      <Navbar />
      <div className="page fade-in magazine-page-mobile" style={{ paddingTop: 32 }}>
        {/* HERO */}
        {hero && (
          <Link
            to={`/magazine/${hero.id}`}
            className="magazine-hero"
            style={{ backgroundImage: `url(${hero.immagine || fallbackArticleImage})` }}
          >
            <div className="magazine-hero-overlay">
              {hero.categoria && <span className="badge-category">{getTranslatedField(hero as any, "categoria", i18n.language, hero.categoria)}</span>}
              <h1 className="magazine-hero-title-single">{getTranslatedField(hero as any, "titolo", i18n.language, hero.titolo)}</h1>
              <p>{getTranslatedField(hero as any, "descrizione", i18n.language, hero.descrizione)}</p>
            </div>
          </Link>
        )}
        {/* GRID */}
        <h2 className="mobile-articles-title">{t("articlesTitle")}</h2>
        <div className="cocktail-grid">
          {others.map((a) => (
            <Link key={a.id} to={`/magazine/${a.id}`} className="drink-card">
              <img
                src={a.immagine || fallbackArticleImage}
                alt={getTranslatedField(a as any, "titolo", i18n.language, t("articleFallback"))}
                style={{ transform: "scale(0.9)", transformOrigin: "center" }}
              />
              <div className="drink-card-overlay">
                {a.categoria && <span className="badge-category">{getTranslatedField(a as any, "categoria", i18n.language, a.categoria)}</span>}
                <h3>{getTranslatedField(a as any, "titolo", i18n.language, t("articleFallback"))}</h3>
                {a.descrizione && <p>{getTranslatedField(a as any, "descrizione", i18n.language, a.descrizione)}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}