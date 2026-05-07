import "../App.css";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useParams } from "react-router-dom";
import { useUser } from "../context/UserContext"; // ✅ AGGIUNTO
import Navbar from "../components/Navbar";

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

function renderArticleContent(raw: string) {
  const content = raw || "";
  // Regex per immagini markdown e link diretti a immagini
  const imageMarkdownRegex = /!\[([^\]]*)\]\((https?:\/\/[^\n]+)\)/g;
  const directImageRegex = /(https?:\/\/(?:[^\s]+)\.(?:jpg|jpeg|png|gif|webp|avif|svg))/gi;
  const nodes: React.ReactNode[] = [];

  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let blockIndex = 0;

  const pushTextChunk = (chunk: string) => {
    const trimmed = chunk.trim();
    if (!trimmed) return;

    // Sostituisci i link diretti a immagini con un tag <img>
    let imgIndex = 0;
    const replaced = trimmed.replace(directImageRegex, (url) => {
      imgIndex++;
      return `[[IMG-${blockIndex}-${imgIndex}:${url}]]`;
    });

    const paragraphs = replaced.split(/\n{2,}/);
    paragraphs.forEach((paragraph) => {
      const lines = paragraph.split("\n");
      const lineNodes: React.ReactNode[] = [];

      lines.forEach((line, idx) => {
        // Sostituisci i placeholder con <img>
        const imgPlaceholderRegex = /\[\[IMG-(\d+)-(\d+):([^\]]+)\]\]/g;
        let lastImgIdx = 0;
        let imgMatch: RegExpExecArray | null;
        const acc: React.ReactNode[] = [];
        while ((imgMatch = imgPlaceholderRegex.exec(line)) !== null) {
          if (imgMatch.index > lastImgIdx) {
            acc.push(line.slice(lastImgIdx, imgMatch.index));
          }
          acc.push(
            <img
              key={`img-inline-${blockIndex}-${idx}-${imgMatch[2]}`}
              src={imgMatch[3]}
              alt="Immagine"
              style={{ maxWidth: "100%", maxHeight: 320, borderRadius: 10, margin: "10px 0", display: "block" }}
              loading="lazy"
            />
          );
          lastImgIdx = imgMatch.index + imgMatch[0].length;
        }
        if (lastImgIdx < line.length) {
          acc.push(line.slice(lastImgIdx));
        }
        if (acc.length > 0) {
          lineNodes.push(...acc);
        } else {
          lineNodes.push(...renderInlineLinks(line, `p-${blockIndex}-${idx}`));
        }
        if (idx < lines.length - 1) lineNodes.push(<br key={`br-${blockIndex}-${idx}`} />);
      });

      nodes.push(
        <p key={`p-${blockIndex}`} style={articleParagraph}>
          {lineNodes}
        </p>
      );
      blockIndex += 1;
    });
  };

  // Prima gestisci le immagini markdown
  while ((m = imageMarkdownRegex.exec(content)) !== null) {
    const before = content.slice(lastIndex, m.index);
    pushTextChunk(before);

    const alt = m[1] || "Immagine articolo";
    const src = normalizeUrl(m[2]);

    if (isVideoUrl(src)) {
      nodes.push(
        <figure key={`video-${blockIndex}`} style={articleFigure}>
          <video style={articleVideo} controls preload="metadata">
            <source src={src} />
          </video>
          <figcaption style={articleCaption}>{alt}</figcaption>
        </figure>
      );
    } else {
      nodes.push(
        <figure key={`img-${blockIndex}`} style={articleFigure}>
          <img src={src} alt={alt} style={articleImage} loading="lazy" />
          <figcaption style={articleCaption}>{alt}</figcaption>
        </figure>
      );
    }
    blockIndex += 1;
    lastIndex = m.index + m[0].length;
  }

  // Gestisci il testo rimanente (inclusi link diretti a immagini)
  pushTextChunk(content.slice(lastIndex));
  return nodes;
}

export default function ArticleDetail() {
  const { id } = useParams();
  const { role } = useUser(); // ✅
  const isAdmin = role === "admin"; // ✅

  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState<any>(null); // ✅
  const [uploading, setUploading] = useState(false); // ✅
  useEffect(() => {
    load();
  }, [id]);
  async function load() {
    const { data } = await supabase
      .from("articoli")
      .select("*")
      .eq("id", id)
      .single();

    setData(data);
    setForm(data); // ✅
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
      alert("Errore salvataggio");
      return;
    }

    setData(form);
    alert("Salvato ✅");
  }
  // ...existing code...

  // ✅ DELETE
  async function handleDelete() {
    const ok = confirm("Eliminare articolo?");
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
      alert("Errore upload");
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
      {!data ? (
        <div className="page fade-in" style={{ padding: 40 }}>Caricamento...</div>
      ) : (
        <main>
          <div className="page page-full-bleed fade-in">
            <style>{`
              .article-hero-box,
              .article-box {
                width: min(94vw, 64rem) !important;
                max-width: none !important;
                margin-left: auto !important;
                margin-right: auto !important;
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
                <span style={badge}>{data.categoria}</span>

                <h1 className="article-hero-title" style={title}>{data.titolo}</h1>

                <p className="article-hero-subtitle" style={subtitle}>{data.descrizione}</p>

                <div style={meta}>
                  <span>Lo Zio del Rum</span>
                </div>
              </div>
            </div>

            {/* 🔥 BOX ARTICOLO COMPLETO */}
            <div className="article-wrapper" style={{ ...articleWrapper, width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
              <div className="article-box" style={articleBox}>
                <div className="article-content" style={articleContent}>
                  {renderArticleContent(data.contenuto || "")}
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