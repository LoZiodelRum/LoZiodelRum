#!/usr/bin/env node
/**
 * Converte Review_export.csv in src/data/articles.js per la pagina Magazine.
 * Ogni recensione viene trattata come articolo (title, content, excerpt, date, author, category).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const csvPath = path.join(projectRoot, "..", "Review_export.csv");
const outPath = path.join(projectRoot, "src", "data", "articles.js");

function parseCSV(text) {
  const rows = [];
  let i = 0;
  const len = text.length;
  while (i < len) {
    const row = [];
    while (i < len) {
      if (text[i] === "\n") { i++; break; }
      if (text[i] === "\r") { i++; if (text[i] === "\n") i++; break; }
      let field = "";
      if (text[i] === '"') {
        i++;
        while (i < len) {
          if (text[i] === '"') {
            i++;
            if (text[i] === '"') { field += '"'; i++; }
            else break;
          } else { field += text[i]; i++; }
        }
        row.push(field);
        if (i < len && (text[i] === "," || text[i] === "\r" || text[i] === "\n")) {
          if (text[i] === ",") i++;
          continue;
        }
      } else {
        while (i < len && text[i] !== "," && text[i] !== "\n" && text[i] !== "\r") {
          field += text[i];
          i++;
        }
        row.push(field);
        if (i < len && text[i] === ",") i++;
      }
    }
    if (row.length > 0) rows.push(row);
  }
  return rows;
}

const defaultCover = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800";
const categories = ["cultura", "cocktail", "guida", "intervista", "evento", "rum"];

const raw = fs.readFileSync(csvPath, "utf-8");
const rows = parseCSV(raw);
const header = rows[0];
const dataRows = rows.slice(1);
const col = (name) => header.indexOf(name);

const idx = {
  title: col("title"),
  content: col("content"),
  created_date: col("created_date"),
  author_name: col("author_name"),
  id: col("id"),
};

const articles = dataRows
  .filter((r) => r.length > idx.id && r[idx.id])
  .map((r, i) => {
    const content = (r[idx.content] || "").trim();
    const excerpt = content.length > 160 ? content.slice(0, 160).trim() + "..." : content;
    return {
      id: (r[idx.id] || "").trim(),
      title: (r[idx.title] || "").trim(),
      content,
      excerpt,
      created_date: (r[idx.created_date] || "").trim(),
      author_name: (r[idx.author_name] || "").trim(),
      category: categories[i % categories.length],
      cover_image: defaultCover,
      views: 0,
    };
  });

const jsContent = `// src/data/articles.js - generato da Review_export.csv per Magazine
export const articlesData = ${JSON.stringify(articles, null, 2)};
`;

fs.writeFileSync(outPath, jsContent, "utf-8");
console.log(`Scritti ${articles.length} articoli in ${outPath}`);
