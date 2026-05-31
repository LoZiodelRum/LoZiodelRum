import Navbar from "../components/Navbar";
import "../App.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../lib/supabaseClient";
import { getTranslatedField } from "../utils/getTranslatedField";
import { buildArticleLanguagePatch } from "../utils/articleAutoTranslate";

type Article = {
  id: string;
  titolo: string;
  titolo_de?: string | null;
  titolo_en?: string | null;
  titolo_bg?: string | null;
  sottotitolo?: string | null;
  sottotitolo_de?: string | null;
  sottotitolo_en?: string | null;
  sottotitolo_bg?: string | null;
  descrizione: string;
  descrizione_de?: string | null;
  descrizione_en?: string | null;
  descrizione_bg?: string | null;
  estratto?: string | null;
  estratto_de?: string | null;
  estratto_en?: string | null;
  estratto_bg?: string | null;
  categoria_de?: string | null;
  categoria_en?: string | null;
  categoria_bg?: string | null;
  immagine: string;
  categoria: string;
  data_creazione: string;
  [key: string]: any;
};

export default function Magazine() {
  const [rawArticles, setRawArticles] = useState<Article[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const { t, i18n } = useTranslation("translation");
  const language = i18n.resolvedLanguage || i18n.language || "it";

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrateArticlesForLanguage() {
      if (!rawArticles.length) {
        setArticles([]);
        return;
      }

      const normalizedLanguage = String(language || "").toLowerCase().split(/[-_]/)[0];
      if (normalizedLanguage !== "de" && normalizedLanguage !== "es" && normalizedLanguage !== "bg") {
        setArticles(rawArticles);
        return;
      }

      const translatedRows: Article[] = [];
      for (const article of rawArticles) {
        const patch = await buildArticleLanguagePatch(article as any, normalizedLanguage, [
          "titolo",
          "sottotitolo",
          "estratto",
          "descrizione",
          "categoria",
        ]);

        translatedRows.push(patch ? ({ ...article, ...patch } as Article) : article);
      }

      if (!cancelled) {
        setArticles(translatedRows);
      }
    }

    void hydrateArticlesForLanguage();

    return () => {
      cancelled = true;
    };
  }, [rawArticles, language]);

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

    setRawArticles(rows.map((a: any) => ({
      ...a,
      descrizione: a.descrizione || a.estratto || "",
      immagine: a.immagine || a.image || null,
    })));
  }

  if (!articles.length) {
    return <><Navbar /><div className="page fade-in" style={{ padding: 40 }}>{t("noArticles")}</div></>;
  }


  function getArticleField(article: any, field: string) {
    const lang = (i18n.language || "it").split("-")[0].toLowerCase();
    return getTranslatedField(article, field, lang, "");
  }

  return (
    <>
      <Navbar />
      <div className="page fade-in magazine-page-mobile" style={{ paddingTop: 32 }}>
        <style>{`
          .magazine-uniform-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 24px;
          }
          .magazine-uniform-card {
            display: flex;
            flex-direction: column;
            min-height: 360px;
            height: 360px;
            width: 100%;
            border-radius: 18px;
            overflow: hidden;
            text-decoration: none;
          }
          .magazine-uniform-image {
            width: 100%;
            height: 190px;
            object-fit: cover;
            display: block;
          }
          .magazine-uniform-overlay {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
          }
          .magazine-uniform-title {
            margin: 0;
          }
          .magazine-uniform-excerpt {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          @media (max-width: 1023px) {
            .magazine-uniform-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }
          @media (max-width: 767px) {
            .magazine-uniform-grid {
              grid-template-columns: minmax(0, 1fr);
            }
          }
        `}</style>
        <h2 className="mobile-articles-title">{t("articlesTitle")}</h2>
        <div className="magazine-uniform-grid">
          {articles.map((article) => {
            const articleTitle = getArticleField(article, "titolo");
            const articlePreview =
              getArticleField(article, "sottotitolo")
              || getArticleField(article, "estratto")
              || getArticleField(article, "descrizione")
              || getArticleField(article, "contenuto");

            return (
            <Link key={article.id} to={`/magazine/${article.id}`} className="drink-card magazine-uniform-card">
              {article.immagine ? (
                <img
                  src={article.immagine}
                  alt={articleTitle || t("articleFallback")}
                  className="magazine-uniform-image"
                />
              ) : (
                <div className="no-img-placeholder magazine-uniform-image" style={{ background: "#0f172a", color: "#cbd5e1" }}>
                  {t("drink.states.noImage", { defaultValue: "No image" })}
                </div>
              )}
              <div className="drink-card-overlay magazine-uniform-overlay">
                <h3 className="magazine-uniform-title">{articleTitle || t("articleFallback")}</h3>
                {articlePreview && (
                  <p className="magazine-uniform-excerpt">
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