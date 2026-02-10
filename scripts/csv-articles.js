#!/usr/bin/env node
/**
 * Converte Article_export.csv in src/data/articles.js per la pagina Magazine.
 * Gestisce campi tra virgolette con newline (es. content).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const csvPath = path.join(projectRoot, "..", "Article_export.csv");
const outPath = path.join(projectRoot, "src", "data", "articles.js");

/** Parse CSV: newline dentro "..." non fa nuova riga */
function parseCSV(text) {
  const rows = [];
  let i = 0;
  const len = text.length;
  while (i < len) {
    const row = [];
    while (i < len) {
      const c = text[i];
      if (c === "\r") {
        i++;
        if (text[i] === "\n") i++;
        break;
      }
      if (c === "\n") {
        i++;
        break;
      }
      let field = "";
      if (c === '"') {
        i++;
        while (i < len) {
          if (text[i] === '"') {
            i++;
            if (text[i] === '"') {
              field += '"';
              i++;
            } else break;
          } else {
            field += text[i];
            i++;
          }
        }
        row.push(field);
        if (i < len && text[i] === ",") i++;
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

const raw = fs.readFileSync(csvPath, "utf-8");
const rows = parseCSV(raw);
const header = rows[0];
const dataRows = rows.slice(1);
const col = (name) => header.indexOf(name);

const idx = {
  title: col("title"),
  slug: col("slug"),
  excerpt: col("excerpt"),
  content: col("content"),
  cover_image: col("cover_image"),
  category: col("category"),
  author_name: col("author_name"),
  reading_time: col("reading_time"),
  published: col("published"),
  views: col("views"),
  likes: col("likes"),
  id: col("id"),
  created_date: col("created_date"),
};

const articles = dataRows
  .filter((r) => r.length > idx.id && r[idx.id])
  .filter((r) => (r[idx.published] || "").toLowerCase() === "true")
  .map((r) => {
    const views = parseInt(r[idx.views], 10);
    return {
      id: (r[idx.id] || "").trim(),
      title: (r[idx.title] || "").trim(),
      slug: (r[idx.slug] || "").trim(),
      excerpt: (r[idx.excerpt] || "").trim(),
      content: (r[idx.content] || "").trim(),
      cover_image: (r[idx.cover_image] || "").trim(),
      category: (r[idx.category] || "cultura").trim().toLowerCase(),
      author_name: (r[idx.author_name] || "").trim(),
      reading_time: (r[idx.reading_time] || "").trim(),
      views: Number.isNaN(views) ? 0 : views,
      likes: parseInt(r[idx.likes], 10) || 0,
      created_date: (r[idx.created_date] || "").trim(),
    };
  });

const jsContent = `// src/data/articles.js - generato da Article_export.csv
export const articlesData = ${JSON.stringify(articles, null, 2)};
`;

fs.writeFileSync(outPath, jsContent, "utf-8");
console.log(`Scritti ${articles.length} articoli in ${outPath}`);
