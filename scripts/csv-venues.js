#!/usr/bin/env node
/**
 * Converte Venue_export.csv in src/data/venues.js (locali).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const csvPath = path.join(projectRoot, "..", "Venue_export.csv");
const outPath = path.join(projectRoot, "src", "data", "venues.js");

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

const venues = dataRows
  .filter((r) => r.length > col("id") && r[col("id")])
  .map((r) => ({
    id: r[col("id")].trim(),
    name: (r[col("name")] || "").trim(),
    slug: (r[col("slug")] || "").trim(),
    description: (r[col("description")] || "").trim(),
    city: (r[col("city")] || "").trim(),
    country: (r[col("country")] || "").trim(),
    address: (r[col("address")] || "").trim(),
    latitude: num(r[col("latitude")]),
    longitude: num(r[col("longitude")]),
    cover_image: (r[col("cover_image")] || "").trim(),
    category: (r[col("category")] || "").trim(),
    price_range: (r[col("price_range")] || "").trim(),
    phone: (r[col("phone")] || "").trim(),
    website: (r[col("website")] || "").trim(),
    instagram: (r[col("instagram")] || "").trim(),
    opening_hours: (r[col("opening_hours")] || "").trim(),
    avg_drink_quality: num(r[col("avg_drink_quality")]),
    avg_staff_competence: num(r[col("avg_staff_competence")]),
    avg_atmosphere: num(r[col("avg_atmosphere")]),
    avg_value: num(r[col("avg_value")]),
    overall_rating: num(r[col("overall_rating")]),
    review_count: num(r[col("review_count")]) || 0,
    featured: (r[col("featured")] || "").toLowerCase() === "true",
    verified: (r[col("verified")] || "").toLowerCase() === "true",
  }));

const jsContent = "// src/data/venues.js - generato da Venue_export.csv\nexport const venuesData = " + JSON.stringify(venues, null, 2) + ";\n";

fs.writeFileSync(outPath, jsContent, "utf-8");
console.log("Scritti " + venues.length + " locali in " + outPath);
