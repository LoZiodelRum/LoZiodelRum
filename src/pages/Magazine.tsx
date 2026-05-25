import Navbar from "../components/Navbar";
import "../App.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../lib/supabaseClient";

type Article = {
  id: string;
  titolo: string;
  titolo_it?: string | null;
  titolo_es?: string | null;
  titolo_en?: string | null;
  sottotitolo?: string | null;
  sottotitolo_it?: string | null;
  sottotitolo_es?: string | null;
  sottotitolo_en?: string | null;
  descrizione: string;
  descrizione_it?: string | null;
  descrizione_es?: string | null;
  descrizione_en?: string | null;
  categoria_it?: string | null;
  categoria_es?: string | null;
  categoria_en?: string | null;
  immagine: string;
  categoria: string;
  data_creazione: string;
  [key: string]: any;
};

function normalizeArticleLanguage(language?: string): "it" | "en" | "es" {
  const short = String(language || "it").toLowerCase().split(/[-_]/)[0];
  if (short === "it") return "it";
  if (short === "es") return "es";
  return "en";
}

function firstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return "";
}

function pickArticleTitle(article: Article, language?: string): string {
  const normalized = normalizeArticleLanguage(language);

  if (normalized === "it") {
    return firstNonEmpty(article.titolo_it, article.titolo);
  } else if (normalized === "es") {
    return firstNonEmpty(article.titolo_es, article.titolo);
  }

  return firstNonEmpty(article.titolo_en, article.titolo);
}

function pickArticlePreview(article: Article, language?: string): string {
  const normalized = normalizeArticleLanguage(language);

  const basePreview = firstNonEmpty(article.sottotitolo, article.descrizione);
  const itPreview = firstNonEmpty(article.sottotitolo_it, article.descrizione_it, basePreview);
  const enPreview = firstNonEmpty(article.sottotitolo_en, article.descrizione_en, basePreview);
  const esPreview = firstNonEmpty(article.sottotitolo_es, article.descrizione_es, basePreview);

  if (normalized === "it") {
    return itPreview;
  } else if (normalized === "es") {
    return esPreview;
  }

  return enPreview;
}

function pickArticleCategory(article: Article, language?: string): string {
  const normalized = normalizeArticleLanguage(language);

  if (normalized === "it") {
    return firstNonEmpty(article.categoria_it, article.categoria);
  } else if (normalized === "es") {
    return firstNonEmpty(article.categoria_es, article.categoria);
  }

  return firstNonEmpty(article.categoria_en, article.categoria);
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
      descrizione: a.descrizione || "",
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
              {hero.categoria && <span className="badge-category">{pickArticleCategory(hero, currentLanguage)}</span>}
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
                {a.categoria && <span className="badge-category">{pickArticleCategory(a, currentLanguage)}</span>}
                <h3>{pickArticleTitle(a, currentLanguage) || t("articleFallback")}</h3>
                {pickArticlePreview(a, currentLanguage) && (
                  <p
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {pickArticlePreview(a, currentLanguage)}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}