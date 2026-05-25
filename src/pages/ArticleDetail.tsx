import "../App.css";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useParams } from "react-router-dom";
import { useUser } from "../context/UserContext"; // ✅ AGGIUNTO
import Navbar from "../components/Navbar";
import { useTranslation } from "react-i18next";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../lib/supabaseClient";
import { getTranslatedField } from "../utils/getTranslatedField";

import { hero, overlay, heroBox, badge, title, subtitle, meta, articleWrapper } from "./articleDetailStyles";

function normalizeUrl(url: string) {
  return url.replace(/\s+/g, "").trim();
}

function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function renderInlineLinks(text: string, keyBase: string) {
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const pieces: React.ReactNode[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = linkRegex.exec(text)) !== null) {
    if (m.index > lastIndex) {
      pieces.push(text.slice(lastIndex, m.index));
    }

    pieces.push(
      <a key={`${keyBase}-link-${i}`} href={m[2]} target="_blank" rel="noreferrer" style={articleLink}>
        {m[1]}
      </a>
    );

    lastIndex = m.index + m[0].length;
    i += 1;
  }

  if (lastIndex < text.length) {
    pieces.push(text.slice(lastIndex));
  }

  return pieces;
}


// Riconosce url immagini (estensioni e domini richiesti)
function isImageUrl(url: string) {
  if (!/^https?:\/\//.test(url)) return false;
  // Estensioni immagini
  if (/(\.jpg|\.jpeg|\.png|\.webp|\.gif)(\?.*)?$/i.test(url)) return true;
  // Domini immagini
  if (/gstatic\.com\/images|encrypted-tbn/.test(url)) return true;
  return false;
}

// Rendering contenuto articolo: ogni riga con solo url immagine -> <img>, resto testo
function renderArticleContent(raw: string, imageAlt: string) {
  const content = raw || "";
  const lines = content.split(/\r?\n/);
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (isImageUrl(trimmed)) {
      return (
        <img
          key={`img-line-${idx}`}
          src={trimmed}
          alt={imageAlt}
          className="magazine-article-inline-image"
          loading="lazy"
        />
      );
    }
    return <p key={`p-line-${idx}`} style={articleParagraph}>{line}</p>;
  });
}

export default function ArticleDetail() {
  const { id } = useParams();
  const { role } = useUser(); // ✅
  const isAdmin = role === "admin"; // ✅
  const { t, i18n } = useTranslation("translation");

  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState<any>(null); // ✅
  const [uploading, setUploading] = useState(false); // ✅
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [id]);
  async function load() {
    if (!id) {
      setData(null);
      setForm(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/articoli?select=*&id=eq.${encodeURIComponent(id)}`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });

      const payload = response.ok ? await response.json().catch(() => []) : [];
      const loaded = Array.isArray(payload) ? payload[0] ?? null : null;
      setData(loaded);
      setForm(loaded);
    } catch (error) {
      console.error("Article detail load failed:", error);
      setData(null);
      setForm(null);
    } finally {
      setLoading(false);
    }
  }

  // ✅ SAVE
  async function handleSave() {
    const { error } = await supabase
      .from("articoli")
      .update({
        ...form,
        immagine: form.immagine,
      })
      .eq("id", form.id);

    if (error) {
      alert(t("saveError"));
      return;
    }

    setData(form);
    alert(t("saved"));
  }
  // ...existing code...

  // ✅ DELETE
  async function handleDelete() {
    const ok = confirm(t("deleteArticleConfirm"));
    if (!ok) return;

    await supabase.from("articoli").delete().eq("id", form.id);

    window.location.href = "/magazine";
  }

  // ✅ UPLOAD IMMAGINE
  async function handleImageUpload(file: File) {
    if (!file) return;

    setUploading(true);

    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("drink-images")
      .upload(fileName, file);

    if (error) {
      alert(t("uploadError"));
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("drink-images")
      .getPublicUrl(fileName);

    const url = data.publicUrl;

    setForm({
      ...form,
      immagine: url,
    });

    setUploading(false);
  }

  // ---
  return (
    <>
        <Navbar />
        {/* NOTA: Nessun menu laterale custom/mobile drawer viene montato qui. Solo Navbar gestisce il menu mobile. */}
        {loading ? (
          <div className="page fade-in" style={{ padding: 40 }}>{t("loading")}</div>
        ) : !data ? (
          <div className="page fade-in" style={{ padding: 40 }}>{t("notFound", { defaultValue: "Articolo non trovato" })}</div>
      ) : (
        <main>
          <div className="page page-full-bleed fade-in">
            <style>{`
              .magazine-article-container {
                max-width: 900px;
                margin: 0 auto;
                width: 100%;
              }

              .magazine-article-content img,
              .magazine-article-content figure img,
              .magazine-article-inline-image {
                max-width: 700px;
                width: 100%;
                height: auto;
                display: block;
                margin: 40px auto;
                border-radius: 18px;
                object-fit: cover;
              }

              .magazine-article-content figure {
                margin: 40px 0;
              }

              .article-hero-box,
              .article-box {
                width: min(94vw, 64rem) !important;
                max-width: none !important;
                margin-left: auto !important;
                margin-right: auto !important;
              }

              @media (max-width: 1023px) {
                .magazine-article-content img,
                .magazine-article-content figure img,
                .magazine-article-inline-image {
                  max-width: 600px;
                }
              }

              @media (max-width: 768px) {
                .article-hero {
                  border-radius: 0 !important;
                  width: 100vw !important;
                  margin-left: calc(-50vw + 50%) !important;
                }

                .article-hero-box,
                .article-box {
                  width: calc(100vw - 16px) !important;
                  max-width: none !important;
                  padding: 24px 18px !important;
                  border-radius: 16px !important;
                }

                .article-hero-box {
                  margin-bottom: -170px !important;
                }

                .article-hero-title {
                  font-size: clamp(1.35rem, 6.2vw, 1.85rem) !important;
                }
                .article-hero-subtitle {
                  font-size: 15px !important;
                }
                .article-wrapper {
                  width: 100vw !important;
                  margin-left: calc(-50vw + 50%) !important;
                  margin-top: 220px !important;
                  display: flex !important;
                  justify-content: center !important;
                }

                .article-content {
                  font-size: 18px !important;
                }
                .article-content p,
                .article-content span,
                .article-content li {
                  font-size: 18px !important;
                }

                .magazine-article-content img,
                .magazine-article-content figure img,
                .magazine-article-inline-image {
                  max-width: 100%;
                  margin: 24px auto;
                }
              }
            `}</style>

            {/* HERO */}
            <div
              className="article-hero"
              style={{
                ...hero,
                backgroundImage: `url(${data.immagine})`,
              }}
            >
              <div style={overlay} />

              <div className="article-hero-box" style={heroBox}>
                <span style={badge}>{getTranslatedField(data as any, "categoria", i18n.language, data.categoria || "-")}</span>

                <h1 className="article-hero-title" style={title}>{getTranslatedField(data as any, "titolo", i18n.language, data.titolo || t("articleFallback"))}</h1>

                <p className="article-hero-subtitle" style={subtitle}>
                  {
                    getTranslatedField(data as any, "sottotitolo", i18n.language, "")
                    || getTranslatedField(data as any, "estratto", i18n.language, "")
                    || getTranslatedField(data as any, "contenuto", i18n.language, "").slice(0, 260)
                    || getTranslatedField(data as any, "descrizione", i18n.language, "")
                    || data.sottotitolo
                    || data.estratto
                    || data.contenuto?.slice?.(0, 260)
                    || data.descrizione
                    || ""
                  }
                </p>

                <div style={meta}>
                  <span>Lo Zio del Rum</span>
                </div>
              </div>
            </div>

            {/* 🔥 BOX ARTICOLO COMPLETO */}
            <div className="article-wrapper magazine-article-container" style={{ ...articleWrapper, width: '100%', overflowX: 'hidden' }}>
              <div className="article-box" style={articleBox}>
                <div className="article-content magazine-article-content" style={articleContent}>
                  {renderArticleContent(
                    getTranslatedField(data as any, "contenuto", i18n.language, data.contenuto || ""),
                    t("articleImageAlt")
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </>
  );
}

const articleBox = {
  maxWidth: "min(100%, 56rem)",
  width: "90%",
  background: "#111",
  borderRadius: 20,
  padding: "40px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
};

const articleContent = {
  fontSize: 19,
  lineHeight: 1.8,
  color: "#ddd",
};

const articleParagraph = {
  margin: "0 0 18px 0",
};

const articleFigure = {
  margin: "18px 0",
};

const articleImage = {
  width: "100%",
  maxHeight: "26rem",
  objectFit: "cover" as const,
  borderRadius: 14,
  display: "block",
};

const articleVideo = {
  width: "100%",
  maxHeight: "26rem",
  borderRadius: 14,
  background: "#000",
  display: "block",
};

const articleCaption = {
  marginTop: 8,
  color: "#aaa",
  fontSize: 13,
};

const articleLink = {
  color: "#f5a623",
};