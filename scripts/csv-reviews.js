#!/usr/bin/env node
/**
 * Converte Review_export.csv in src/data/reviews.js.
 * Le recensioni sono collegate ai locali tramite venue_id (per VenueDetail).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const csvPath = path.join(projectRoot, "..", "Review_export.csv");
const outPath = path.join(projectRoot, "src", "data", "reviews.js");

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

const raw = fs.readFileSync(csvPath, "utf-8");
const rows = parseCSV(raw);
const header = rows[0];
const dataRows = rows.slice(1);
const col = (name) => header.indexOf(name);

const num = (v) => {
  const n = parseFloat(String(v).trim());
  return Number.isNaN(n) ? undefined : n;
};

const reviews = dataRows
  .filter((r) => r.length > col("id") && r[col("id")])
  .map((r) => ({
    id: r[col("id")].trim(),
    venue_id: r[col("venue_id")].trim(),
    title: (r[col("title")] || "").trim(),
    content: (r[col("content")] || "").trim(),
    visit_date: (r[col("visit_date")] || "").trim(),
    drink_quality: num(r[col("drink_quality")]),
    staff_competence: num(r[col("staff_competence")]),
    atmosphere: num(r[col("atmosphere")]),
    value_for_money: num(r[col("value_for_money")]),
    overall_rating: num(r[col("overall_rating")]),
    author_name: (r[col("author_name")] || "").trim(),
    created_date: (r[col("created_date")] || "").trim(),
  }));

const jsContent = `// src/data/reviews.js - generato da Review_export.csv (recensioni dei locali)
export const reviewsData = ${JSON.stringify(reviews, null, 2)};
`;

fs.writeFileSync(outPath, jsContent, "utf-8");
console.log(`Scritte ${reviews.length} recensioni in ${outPath}`);
console.log("Le recensioni vanno mostrate nelle rispettive pagine locali (VenueDetail) tramite venue_id.");
