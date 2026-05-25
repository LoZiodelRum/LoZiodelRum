import Navbar from "../components/Navbar";
import "../App.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../lib/supabaseClient";

type Article = {
  id: string;
  titolo: string;
  titolo_es?: string | null;
  titolo_en?: string | null;
  titolo_bg?: string | null;
  sottotitolo?: string | null;
  sottotitolo_es?: string | null;
  sottotitolo_en?: string | null;
  sottotitolo_bg?: string | null;
  descrizione: string;
  descrizione_es?: string | null;
  descrizione_en?: string | null;
  descrizione_bg?: string | null;
  estratto?: string | null;
  estratto_es?: string | null;
  estratto_en?: string | null;
  estratto_bg?: string | null;
  categoria_es?: string | null;
  categoria_en?: string | null;
  categoria_bg?: string | null;
  immagine: string;
  categoria: string;
  data_creazione: string;
  [key: string]: any;
};

function firstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return "";
}

function pickArticleTitle(article: Article, normalizedLanguage: "it" | "en" | "es" | "bg", language?: string): string {
  if (normalizedLanguage === "it") {
    return firstNonEmpty(article.titolo);
  } else if (normalizedLanguage === "es") {
    return firstNonEmpty(article.titolo_es, article.titolo_en, article.titolo);
  } else if (normalizedLanguage === "bg") {
    return firstNonEmpty(article.titolo_bg, article.titolo_en, article.titolo);
  }

  return firstNonEmpty(article.titolo_en, article.titolo);
}

function pickArticlePreview(article: Article, normalizedLanguage: "it" | "en" | "es" | "bg"): string {

  const basePreview = firstNonEmpty(article.sottotitolo, article.descrizione, article.estratto);
  const enPreview = firstNonEmpty(article.sottotitolo_en, article.descrizione_en, article.estratto_en, basePreview);
  const esPreview = firstNonEmpty(article.sottotitolo_es, article.descrizione_es, article.estratto_es, enPreview, basePreview);
  const bgPreview = firstNonEmpty(article.sottotitolo_bg, article.descrizione_bg, article.estratto_bg, enPreview, basePreview);

  if (normalizedLanguage === "it") {
    return basePreview;
  } else if (normalizedLanguage === "es") {
    return esPreview;
  } else if (normalizedLanguage === "bg") {
    return bgPreview;
  }

  return enPreview;
}

function pickArticleCategory(article: Article, normalizedLanguage: "it" | "en" | "es" | "bg"): string {

  if (normalizedLanguage === "it") {
    return firstNonEmpty(article.categoria);
  } else if (normalizedLanguage === "es") {
    return firstNonEmpty(article.categoria_es, article.categoria_en, article.categoria);
  } else if (normalizedLanguage === "bg") {
    return firstNonEmpty(article.categoria_bg, article.categoria_en, article.categoria);
  }

  return firstNonEmpty(article.categoria_en, article.categoria);
}

export default function Magazine() {
  const [articles, setArticles] = useState<Article[]>([]);
  const { t, i18n } = useTranslation("translation");
  const language = i18n.resolvedLanguage || i18n.language || "it";
  const normalizedLanguage: "it" | "en" | "es" | "bg" =
    language?.toLowerCase().startsWith("es")
      ? "es"
      : language?.toLowerCase().startsWith("bg")
      ? "bg"
      : language?.toLowerCase().startsWith("it")
      ? "it"
      : "en";

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
      descrizione: a.descrizione || a.estratto || "",
      immagine: a.immagine || a.image || null,
    })));
  }

  if (!articles.length) {
    return <><Navbar /><div className="page fade-in" style={{ padding: 40 }}>{t("noArticles")}</div></>;
  }

  const heroArticle = articles.find((a) => (a.titolo || "").trim().length > 0 && (a.descrizione || "").trim().length > 0);
  const others = heroArticle ? articles.filter((a) => a.id !== heroArticle.id) : articles;

  const heroTitle = heroArticle
    ? normalizedLanguage === "es"
      ? heroArticle.titolo_es || heroArticle.titolo_en || heroArticle.titolo
      : normalizedLanguage === "bg"
      ? heroArticle.titolo_bg || heroArticle.titolo_en || heroArticle.titolo
      : normalizedLanguage === "it"
      ? heroArticle.titolo
      : heroArticle.titolo_en || heroArticle.titolo
    : "";

  const heroDescription = heroArticle
    ? normalizedLanguage === "es"
      ? firstNonEmpty(heroArticle.descrizione_es, heroArticle.sottotitolo_es, heroArticle.descrizione_en, heroArticle.sottotitolo_en, heroArticle.descrizione, heroArticle.sottotitolo)
      : normalizedLanguage === "bg"
      ? firstNonEmpty(heroArticle.descrizione_bg, heroArticle.sottotitolo_bg, heroArticle.descrizione_en, heroArticle.sottotitolo_en, heroArticle.descrizione, heroArticle.sottotitolo)
      : normalizedLanguage === "it"
      ? firstNonEmpty(heroArticle.descrizione, heroArticle.sottotitolo)
      : firstNonEmpty(heroArticle.descrizione_en, heroArticle.sottotitolo_en, heroArticle.descrizione, heroArticle.sottotitolo)
    : "";

  const heroCategory = heroArticle
    ? normalizedLanguage === "es"
      ? heroArticle.categoria_es || heroArticle.categoria_en || heroArticle.categoria
      : normalizedLanguage === "bg"
      ? heroArticle.categoria_bg || heroArticle.categoria_en || heroArticle.categoria
      : normalizedLanguage === "it"
      ? heroArticle.categoria
      : heroArticle.categoria_en || heroArticle.categoria
    : "";

  return (
    <>
      <Navbar />
      <div className="page fade-in magazine-page-mobile" style={{ paddingTop: 32 }}>
        {/* HERO */}
        {heroArticle && (
          <Link
            to={`/magazine/${heroArticle.id}`}
            className="magazine-hero"
            style={heroArticle.immagine ? { backgroundImage: `url(${heroArticle.immagine})` } : { background: "#0f172a" }}
          >
            <div className="magazine-hero-overlay">
              {heroCategory && <span className="badge-category">{heroCategory}</span>}
              <h1 className="magazine-hero-title-single">{heroTitle || t("articleFallback")}</h1>
              <p>{heroDescription}</p>
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
                  alt={pickArticleTitle(a, normalizedLanguage, language) || t("articleFallback")}
                  style={{ transform: "scale(0.9)", transformOrigin: "center" }}
                />
              ) : (
                <div className="no-img-placeholder" style={{ background: "#0f172a", color: "#cbd5e1", minHeight: 220 }}>
                  {t("drink.states.noImage", { defaultValue: "No image" })}
                </div>
              )}
              <div className="drink-card-overlay">
                {a.categoria && <span className="badge-category">{pickArticleCategory(a, normalizedLanguage)}</span>}
                <h3>{pickArticleTitle(a, normalizedLanguage, language) || t("articleFallback")}</h3>
                {pickArticlePreview(a, normalizedLanguage) && (
                  <p
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {pickArticlePreview(a, normalizedLanguage)}
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