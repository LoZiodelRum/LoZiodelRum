import React, { useEffect, useState } from "react";
import ArticleBlockEditor, { ArticleBlock } from "../components/admin/ArticleBlockEditor";
import { supabase } from "../lib/supabaseClient";

interface ArticleBlockEditProps {
  articleId: string;
  onClose: () => void;
}

function parseContentToBlocks(contenuto: string): ArticleBlock[] {
  // Split by line, treat image URLs as image blocks, short lines as section-title
  const lines = (contenuto || "").split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const blocks: ArticleBlock[] = [];
  for (const line of lines) {
    if (/^https?:\/\//.test(line) && (line.endsWith(".jpg") || line.endsWith(".jpeg") || line.endsWith(".png") || line.endsWith(".webp") || line.endsWith(".gif"))) {
      blocks.push({ type: "image", url: line, width: "100%", align: "center" });
    } else if (line.length < 50 && !line.endsWith(".")) {
      blocks.push({ type: "section-title", value: line });
    } else {
      blocks.push({ type: "paragraph", value: line });
    }
  }
  return blocks;
}

function blocksToContent(blocks: ArticleBlock[]): string {
  return blocks
    .map(b => {
      if (b.type === "image") return b.url;
      return b.value;
    })
    .join("\n");
}

export default function ArticleBlockEdit({ articleId, onClose }: ArticleBlockEditProps) {
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<ArticleBlock[]>([]);
  const [titolo, setTitolo] = useState("");
  const [estratto, setEstratto] = useState("");
  const [immagine, setImmagine] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      setLoading(true);
      const { data, error } = await supabase.from("articoli").select("id, titolo, estratto, immagine, contenuto").eq("id", articleId).single();
      if (error || !data) {
        setError("Articolo non trovato");
        setLoading(false);
        return;
      }
      setTitolo(data.titolo || "");
      setEstratto(data.estratto || "");
      setImmagine(data.immagine || "");
      setBlocks(parseContentToBlocks(data.contenuto || ""));
      setLoading(false);
    }
    fetchArticle();
  }, [articleId]);

  async function handleSave(newBlocks: ArticleBlock[]) {
    const contenuto = blocksToContent(newBlocks);
    const { error } = await supabase.from("articoli").update({ titolo, estratto, immagine, contenuto }).eq("id", articleId);
    if (!error) onClose();
    else setError("Errore salvataggio");
  }

  if (loading) return <div>Caricamento...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontWeight: 600 }}>Titolo</label>
        <input value={titolo} onChange={e => setTitolo(e.target.value)} style={{ width: "100%", fontSize: 22, marginBottom: 8 }} />
        <label style={{ fontWeight: 600 }}>Estratto</label>
        <textarea value={estratto} onChange={e => setEstratto(e.target.value)} style={{ width: "100%", fontSize: 16, marginBottom: 8 }} rows={2} />
        <label style={{ fontWeight: 600 }}>Immagine principale (URL)</label>
        <input value={immagine} onChange={e => setImmagine(e.target.value)} style={{ width: "100%", fontSize: 16, marginBottom: 8 }} />
      </div>
      <ArticleBlockEditor initialBlocks={blocks} onSave={handleSave} />
      <button onClick={onClose} style={{ marginTop: 24 }}>Chiudi</button>
    </div>
  );
}
