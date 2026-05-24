import Navbar from "../components/Navbar";
import "../App.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getTranslatedField } from "../utils/getTranslatedField";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../lib/supabaseClient";

type Article = {
  id: string;
  titolo: string;
  titolo_en?: string | null;
  titolo_bg?: string | null;
  descrizione: string;
  descrizione_en?: string | null;
  descrizione_bg?: string | null;
  estratto?: string | null;
  estratto_en?: string | null;
  estratto_bg?: string | null;
  immagine: string;
  categoria: string;
  data_creazione: string;
  [key: string]: any;
};

function normalizeArticleLanguage(language?: string): "it" | "en" | "bg" {
  const short = String(language || "it").toLowerCase().split(/[-_]/)[0];
  if (short === "en" || short === "bg") return short;
  return "it";
}

function pickArticleTitle(article: Article, language?: string): string {
  const normalized = normalizeArticleLanguage(language);

  if (normalized === "en") return article.titolo_en || article.titolo || "";
  if (normalized === "bg") return article.titolo_bg || article.titolo || "";

  return article.titolo || "";
}

function pickArticlePreview(article: Article, language?: string): string {
  const normalized = normalizeArticleLanguage(language);

  if (normalized === "en") {
    return article.descrizione_en || article.estratto_en || article.descrizione || article.estratto || "";
  }

  if (normalized === "bg") {
    return article.descrizione_bg || article.estratto_bg || article.descrizione || article.estratto || "";
  }

  return article.descrizione || article.estratto || "";
}

export default function Magazine() {
  const [articles, setArticles] = useState<Article[]>([]);
  const { t, i18n } = useTranslation("translation");
  const currentLanguage = i18n.resolvedLanguage || i18n.language || "it";

  useEffect(() => {
    load();
  }, []);

  async function load() {
    let rows: any[] = [];

    const response = await fetch(`${SUPABASE_URL}/rest/v1/articoli?select=*`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (response.ok) {
      const dataRows = await response.json().catch(() => []);
      rows = Array.isArray(dataRows) ? dataRows : [];
    }

    setArticles(rows.map((a: any) => ({
      ...a,
      descrizione: a.descrizione || a.estratto || a.contenuto || "",
      immagine: a.immagine || a.image || null,
    })));
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
            style={hero.immagine ? { backgroundImage: `url(${hero.immagine})` } : { background: "#0f172a" }}
          >
            <div className="magazine-hero-overlay">
              {hero.categoria && <span className="badge-category">{getTranslatedField(hero as any, "categoria", currentLanguage, hero.categoria)}</span>}
              <h1 className="magazine-hero-title-single">{pickArticleTitle(hero, currentLanguage) || t("articleFallback")}</h1>
              <p>{pickArticlePreview(hero, currentLanguage)}</p>
            </div>
          </Link>
        )}
        {/* GRID */}
        <h2 className="mobile-articles-title">{t("articlesTitle")}</h2>
        <div className="cocktail-grid">
          {others.map((a) => (
            <Link key={a.id} to={`/magazine/${a.id}`} className="drink-card">
              {a.immagine ? (
                <img
                  src={a.immagine}
                  alt={pickArticleTitle(a, currentLanguage) || t("articleFallback")}
                  style={{ transform: "scale(0.9)", transformOrigin: "center" }}
                />
              ) : (
                <div className="no-img-placeholder" style={{ background: "#0f172a", color: "#cbd5e1", minHeight: 220 }}>
                  {t("drink.states.noImage", { defaultValue: "No image" })}
                </div>
              )}
              <div className="drink-card-overlay">
                {a.categoria && <span className="badge-category">{getTranslatedField(a as any, "categoria", currentLanguage, a.categoria)}</span>}
                <h3>{pickArticleTitle(a, currentLanguage) || t("articleFallback")}</h3>
                {pickArticlePreview(a, currentLanguage) && <p>{pickArticlePreview(a, currentLanguage)}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}