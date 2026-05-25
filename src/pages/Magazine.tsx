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

const getTranslatedField = (
  article: Article | null | undefined,
  field: string,
  language?: string
): string => {
  const lang =
    language?.toLowerCase().startsWith("es")
      ? "es"
      : language?.toLowerCase().startsWith("bg")
      ? "bg"
      : language?.toLowerCase().startsWith("it")
      ? "it"
      : "en";

  const baseField = article?.[field];

  if (lang === "it") {
    return baseField || "";
  }

  const translatedField = article?.[`${field}_${lang}`];

  if (translatedField && translatedField.trim() !== "") {
    return translatedField;
  }

  const englishField = article?.[`${field}_en`];

  return englishField || baseField || "";
};

export default function Magazine() {
  const [articles, setArticles] = useState<Article[]>([]);
  const { t, i18n } = useTranslation("translation");
  const language = i18n.resolvedLanguage || i18n.language || "it";

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

  const heroArticle = articles.find((article) => {
    const title = getTranslatedField(article, "titolo", language);
    const preview =
      getTranslatedField(article, "descrizione", language) ||
      getTranslatedField(article, "sottotitolo", language) ||
      getTranslatedField(article, "estratto", language);
    return title.trim().length > 0 && preview.trim().length > 0;
  });
  const others = heroArticle ? articles.filter((a) => a.id !== heroArticle.id) : articles;

  const heroTitle = getTranslatedField(heroArticle, "titolo", language);

  const heroDescription =
    getTranslatedField(heroArticle, "descrizione", language)
    || getTranslatedField(heroArticle, "sottotitolo", language)
    || getTranslatedField(heroArticle, "estratto", language);

  const heroCategory = getTranslatedField(heroArticle, "categoria", language);

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
          {others.map((article) => {
            const articleTitle = getTranslatedField(article, "titolo", language);
            const articleCategory = getTranslatedField(article, "categoria", language);
            const articlePreview =
              getTranslatedField(article, "descrizione", language)
              || getTranslatedField(article, "sottotitolo", language)
              || getTranslatedField(article, "estratto", language);

            return (
            <Link key={article.id} to={`/magazine/${article.id}`} className="drink-card">
              {article.immagine ? (
                <img
                  src={article.immagine}
                  alt={articleTitle || t("articleFallback")}
                  style={{ transform: "scale(0.9)", transformOrigin: "center" }}
                />
              ) : (
                <div className="no-img-placeholder" style={{ background: "#0f172a", color: "#cbd5e1", minHeight: 220 }}>
                  {t("drink.states.noImage", { defaultValue: "No image" })}
                </div>
              )}
              <div className="drink-card-overlay">
                {articleCategory && <span className="badge-category">{articleCategory}</span>}
                <h3>{articleTitle || t("articleFallback")}</h3>
                {articlePreview && (
                  <p
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {articlePreview}
                  </p>
                )}
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}