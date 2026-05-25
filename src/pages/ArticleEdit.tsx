import React, { useState, useEffect } from "react";
import ArticleVisualEditor, { ArticleBlock } from "../components/ArticleVisualEditor";
import { supabase } from "../lib/supabaseClient";
import { removeEmptyFields } from "../utils/removeEmptyFields";

interface ArticleEditProps {
  articleId: string;
  onClose: () => void;
}

export default function ArticleEdit({ articleId, onClose }: ArticleEditProps) {
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<ArticleBlock[]>([]);
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
      // Parsing: qui si suppone che il contenuto sia in formato JSON a blocchi, altrimenti va convertito
      let parsed: ArticleBlock[] = [];
      try {
        parsed = JSON.parse(data.contenuto);
      } catch {
        // fallback: tutto il contenuto in un solo blocco paragrafo
        parsed = [{ type: "paragraph", value: data.contenuto || "" }];
      }
      // Prepend title, excerpt, image se esistono
      const blocks: ArticleBlock[] = [];
      if (data.titolo) blocks.push({ type: "title", value: data.titolo });
      if (data.estratto) blocks.push({ type: "excerpt", value: data.estratto });
      if (data.immagine) blocks.push({ type: "image", url: data.immagine, width: "100%", align: "center" });
      setBlocks([...blocks, ...parsed]);
      setLoading(false);
    }
    fetchArticle();
  }, [articleId]);

  async function handleSave(newBlocks: ArticleBlock[]) {
    // Ricomponi titolo, estratto, immagine e contenuto
    const titolo = newBlocks.find(b => b.type === "title")?.value || "";
    const estratto = newBlocks.find(b => b.type === "excerpt")?.value || "";
    const immagine = newBlocks.find(b => b.type === "image")?.url || "";
    // Rimuovi i blocchi "meta" dal contenuto
    const contentBlocks = newBlocks.filter(b => b.type !== "title" && b.type !== "excerpt" && b.type !== "image");
    const contenuto = JSON.stringify(contentBlocks);
    const payload = removeEmptyFields({ titolo, estratto, immagine, contenuto });
    const { error } = await supabase.from("articoli").update(payload).eq("id", articleId);
    if (!error) onClose();
    else setError("Errore salvataggio");
  }

  if (loading) return <div>Caricamento...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: 32 }}>
      <ArticleVisualEditor initialBlocks={blocks} onSave={handleSave} />
      <button onClick={onClose} style={{ marginTop: 24 }}>Chiudi</button>
    </div>
  );
}
