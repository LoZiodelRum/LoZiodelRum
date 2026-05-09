import React, { useState } from "react";

export type ArticleBlock =
  | { type: "section-title"; value: string }
  | { type: "paragraph"; value: string }
  | {
      type: "image";
      url: string;
      width: "25%" | "50%" | "75%" | "100%";
      align: "left" | "center" | "right";
    };

export interface ArticleBlockEditorProps {
  initialBlocks: ArticleBlock[];
  onSave: (blocks: ArticleBlock[]) => void;
}

export default function ArticleBlockEditor({ initialBlocks, onSave }: ArticleBlockEditorProps) {
  const [blocks, setBlocks] = useState<ArticleBlock[]>(initialBlocks);

  function updateBlock(idx: number, newBlock: ArticleBlock) {
    setBlocks(blocks => blocks.map((b, i) => (i === idx ? newBlock : b)));
  }

  function removeBlock(idx: number) {
    setBlocks(blocks => blocks.filter((_, i) => i !== idx));
  }

  function moveBlock(idx: number, dir: -1 | 1) {
    setBlocks(blocks => {
      const arr = [...blocks];
      const tgt = arr.splice(idx, 1)[0];
      arr.splice(idx + dir, 0, tgt);
      return arr;
    });
  }

  function addBlock(type: ArticleBlock["type"]) {
    let block: ArticleBlock;
    if (type === "section-title") block = { type: "section-title", value: "Nuovo titolo sezione" };
    else if (type === "image") block = { type: "image", url: "", width: "100%", align: "center" };
    else block = { type: "paragraph", value: "Nuovo paragrafo" };
    setBlocks(blocks => [...blocks, block]);
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", background: "#fff", borderRadius: 12, padding: 24 }}>
      {blocks.map((block, idx) => {
        if (block.type === "section-title")
          return (
            <div key={idx} style={{ margin: "18px 0 8px 0", display: "flex", alignItems: "center" }}>
              <input
                value={block.value}
                onChange={e => updateBlock(idx, { ...block, value: e.target.value })}
                style={{ fontSize: 20, fontWeight: 600, width: "100%", border: "none", background: "#f8fafc", padding: 6 }}
              />
              <button onClick={() => moveBlock(idx, -1)} disabled={idx === 0}>↑</button>
              <button onClick={() => moveBlock(idx, 1)} disabled={idx === blocks.length - 1}>↓</button>
              <button onClick={() => removeBlock(idx)} style={{ marginLeft: 8 }}>Elimina</button>
            </div>
          );
        if (block.type === "image")
          return (
            <div key={idx} style={{ margin: "18px 0", textAlign: block.align, display: "flex", flexDirection: "column", alignItems: block.align === "center" ? "center" : block.align === "right" ? "flex-end" : "flex-start" }}>
              {block.url && (
                <img
                  src={block.url}
                  alt=""
                  style={{
                    width: block.width,
                    maxWidth: "100%",
                    borderRadius: 8,
                    display: "inline-block",
                  }}
                />
              )}
              <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
                <input
                  value={block.url}
                  onChange={e => updateBlock(idx, { ...block, url: e.target.value })}
                  placeholder="URL immagine"
                  style={{ flex: 1, padding: 4 }}
                />
                <button onClick={() => updateBlock(idx, { ...block, url: "" })}>Sostituisci</button>
                <button onClick={() => removeBlock(idx)}>Elimina</button>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                {["25%", "50%", "75%", "100%"].map(w => (
                  <button
                    key={w}
                    style={{ fontWeight: block.width === w ? 700 : 400 }}
                    onClick={() => updateBlock(idx, { ...block, width: w as any })}
                  >
                    {w}
                  </button>
                ))}
                {["left", "center", "right"].map(a => (
                  <button
                    key={a}
                    style={{ fontWeight: block.align === a ? 700 : 400 }}
                    onClick={() => updateBlock(idx, { ...block, align: a as any })}
                  >
                    {a}
                  </button>
                ))}
                <button onClick={() => moveBlock(idx, -1)} disabled={idx === 0}>↑</button>
                <button onClick={() => moveBlock(idx, 1)} disabled={idx === blocks.length - 1}>↓</button>
              </div>
            </div>
          );
        // paragraph
        return (
          <div key={idx} style={{ margin: "12px 0", display: "flex", alignItems: "center" }}>
            <textarea
              value={block.value}
              onChange={e => updateBlock(idx, { ...block, value: e.target.value })}
              style={{ fontSize: 16, width: "100%", border: "none", background: "#f1f5f9", padding: 8 }}
              rows={3}
            />
            <button onClick={() => moveBlock(idx, -1)} disabled={idx === 0}>↑</button>
            <button onClick={() => moveBlock(idx, 1)} disabled={idx === blocks.length - 1}>↓</button>
            <button onClick={() => removeBlock(idx)} style={{ marginLeft: 8 }}>Elimina</button>
          </div>
        );
      })}
      <div style={{ margin: "24px 0", display: "flex", gap: 8 }}>
        <button onClick={() => addBlock("paragraph")}>Aggiungi paragrafo</button>
        <button onClick={() => addBlock("image")}>Aggiungi immagine</button>
        <button onClick={() => addBlock("section-title")}>Aggiungi titolo sezione</button>
      </div>
      <button
        style={{ background: "#22c55e", color: "#fff", fontWeight: 700, padding: "12px 32px", borderRadius: 8, fontSize: 18 }}
        onClick={() => onSave(blocks)}
      >
        Salva
      </button>
    </div>
  );
}
