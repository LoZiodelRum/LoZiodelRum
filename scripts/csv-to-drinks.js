#!/usr/bin/env node
/**
 * Converte Drink_export.csv (export base44) in src/data/drinks.js
 * così che ogni drink abbia la sua immagine corretta (allineamento nome ↔ foto).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const csvPath = path.join(projectRoot, "..", "Drink_export.csv");
const outPath = path.join(projectRoot, "src", "data", "drinks.js");

// Parse CSV con gestione virgolette (campi tra "...")
function parseCSV(text) {
  const rows = [];
  let i = 0;
  const len = text.length;

  while (i < len) {
    const row = [];
    while (i < len) {
      // skip newline between fields
      if (text[i] === "\n") {
        i++;
        break;
      }
      if (text[i] === "\r") {
        i++;
        if (text[i] === "\n") i++;
        break;
      }
      let field = "";
      if (text[i] === '"') {
        i++;
        while (i < len) {
          if (text[i] === '"') {
            i++;
            if (text[i] === '"') {
              field += '"';
              i++;
            } else {
              break;
            }
          } else {
            field += text[i];
            i++;
          }
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

const raw = fs.readFileSync(csvPath, "utf-8");
const rows = parseCSV(raw);
const header = rows[0];
const dataRows = rows.slice(1);

const col = (name) => header.indexOf(name);
const idx = {
  name: col("name"),
  category: col("category"),
  subcategory: col("subcategory"),
  brand: col("brand"),
  origin: col("origin"),
  description: col("description"),
  image: col("image"),
  abv: col("abv"),
  age: col("age"),
  avg_rating: col("avg_rating"),
  id: col("id"),
};

const drinks = dataRows
  .filter((r) => r.length > idx.id && r[idx.id])
  .map((r) => {
    const abvVal = r[idx.abv];
    const numAbv = abvVal ? parseFloat(String(abvVal).trim()) : 0;
    const avgRatingVal = r[idx.avg_rating];
    const numAvgRating = avgRatingVal ? parseFloat(String(avgRatingVal).trim()) : 0;
    return {
      id: (r[idx.id] || "").trim(),
      name: (r[idx.name] || "").trim(),
      category: (r[idx.category] || "").trim(),
      brand: (r[idx.brand] || "").trim(),
      origin: (r[idx.origin] || "").trim(),
      description: (r[idx.description] || "").trim(),
      image: (r[idx.image] || "").trim(),
      abv: Number.isNaN(numAbv) ? 0 : numAbv,
      avg_rating: Number.isNaN(numAvgRating) ? 0 : numAvgRating,
    };
  });

const jsContent = `// src/data/drinks.js - generato da Drink_export.csv (base44)
export const drinksData = ${JSON.stringify(drinks, null, 2)};
`;

fs.writeFileSync(outPath, jsContent, "utf-8");
console.log(`Scritti ${drinks.length} drink in ${outPath}`);
console.log("Prime 3:", drinks.slice(0, 3).map((d) => ({ name: d.name, image: d.image?.slice(0, 50) + "..." })));
