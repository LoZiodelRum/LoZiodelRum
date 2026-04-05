import "../App.css";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useParams } from "react-router-dom";
import { useUser } from "../context/UserContext"; // ✅ AGGIUNTO

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
  const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[\s\S]*?)\)/g;
  const nodes: React.ReactNode[] = [];

  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let blockIndex = 0;

  const pushTextChunk = (chunk: string) => {
    const trimmed = chunk.trim();
    if (!trimmed) return;

    const paragraphs = trimmed.split(/\n{2,}/);
    paragraphs.forEach((paragraph) => {
      const lines = paragraph.split("\n");
      const lineNodes: React.ReactNode[] = [];

      lines.forEach((line, idx) => {
        lineNodes.push(...renderInlineLinks(line, `p-${blockIndex}-${idx}`));
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

  while ((m = imageRegex.exec(content)) !== null) {
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

  if (!data) {
    return <div className="page fade-in" style={{ padding: 40 }}>Caricamento...</div>;
  }

  return (
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
            margin-bottom: -320px !important;
          }

          .article-hero-title {
            font-size: clamp(1.5rem, 7vw, 2rem) !important;
          }
          .article-hero-subtitle {
            font-size: 15px !important;
          }
          .article-wrapper {
            width: 100vw !important;
            margin-left: calc(-50vw + 50%) !important;
            margin-top: 360px !important;
            display: flex !important;
            justify-content: center !important;
          }

          .article-content {
            font-size: 16px !important;
          }
        }
      `}</style>

      {/* 🔧 EDITOR ADMIN */}
      {isAdmin && form && (
        <div style={{ padding: 20, background: "#111", marginBottom: 40 }}>
          <h2 style={{ color: "#fff" }}>Editor Articolo</h2>

          {/* IMMAGINE */}
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleImageUpload(e.target.files[0]);
              }
            }}
          />

          {uploading && <p style={{ color: "#fff" }}>Upload...</p>}

          {/* CAMPI */}
          <input
            value={form.titolo || ""}
            onChange={(e) =>
              setForm({ ...form, titolo: e.target.value })
            }
            placeholder="Titolo"
            style={{ width: "100%", marginTop: 10 }}
          />

          <input
            value={form.descrizione || ""}
            onChange={(e) =>
              setForm({ ...form, descrizione: e.target.value })
            }
            placeholder="Descrizione"
            style={{ width: "100%", marginTop: 10 }}
          />

          <input
            value={form.categoria || ""}
            onChange={(e) =>
              setForm({ ...form, categoria: e.target.value })
            }
            placeholder="Categoria"
            style={{ width: "100%", marginTop: 10 }}
          />

          <textarea
            value={form.contenuto || ""}
            onChange={(e) =>
              setForm({ ...form, contenuto: e.target.value })
            }
            placeholder="Contenuto articolo"
            style={{ width: "100%", height: 200, marginTop: 10 }}
          />

          {/* BOTTONI */}
          <div style={{ marginTop: 15 }}>
            <button
              onClick={handleSave}
              style={{ background: "green", color: "#fff", marginRight: 10 }}
            >
              Salva
            </button>

            <button
              onClick={handleDelete}
              style={{ background: "red", color: "#fff" }}
            >
              Elimina
            </button>
          </div>
        </div>
      )}

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
      <div className="article-wrapper" style={articleWrapper}>
        <div className="article-box" style={articleBox}>
          <div className="article-content" style={articleContent}>
            {renderArticleContent(data.contenuto || "")}
          </div>
        </div>
      </div>

    </div>
  );
}

/* STILI */

const container = {
  background: "#000",
  minHeight: "100vh",
};

const hero = {
  height: "clamp(220px, 45vw, 520px)",
  position: "relative" as const,
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
};

const overlay = {
  position: "absolute" as const,
  inset: 0,
  background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.82) 100%)",
};

const heroBox = {
  position: "relative" as const,
  background: "rgba(25,25,25,0.95)",
  borderRadius: 20,
  padding: "40px",
  maxWidth: "min(100%, 56rem)",
  width: "90%",
  marginBottom: -200,
  color: "#fff",
  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
};

const badge = {
  background: "#1e3a5f",
  padding: "4px 10px",
  borderRadius: 8,
  fontSize: 12,
  display: "inline-block",
  marginBottom: 10,
};

const title = {
  fontSize: "clamp(2rem, 6vw, 2.75rem)",
  margin: "10px 0",
  lineHeight: 1.2,
};

const subtitle = {
  fontSize: 18,
  color: "#ccc",
  marginBottom: 20,
};

const meta = {
  display: "flex",
  gap: 20,
  fontSize: 14,
  color: "#aaa",
};

const articleWrapper = {
  display: "flex",
  justifyContent: "center",
  marginTop: 240,
  paddingBottom: 80,
};

const articleBox = {
  maxWidth: "min(100%, 56rem)",
  width: "90%",
  background: "#111",
  borderRadius: 20,
  padding: "40px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
};

const articleContent = {
  fontSize: 18,
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