#!/usr/bin/env node
/**
 * Aggiunge al file src/data/venues.js i locali presenti in un export JSON
 * ma non già nel file (utile quando un locale è stato aggiunto dal mobile
 * e quindi esiste solo in localStorage, non nel repo).
 *
 * Uso:
 *   1. Dal telefono: Profilo > accesso admin > Dashboard > Esporta dati.
 *      Salva il file JSON (es. export.json) e trasferiscilo sul PC.
 *   2. Da terminale nel progetto:
 *      node scripts/merge-venues-from-export.js percorso/export.json
 *
 * Esempio:
 *   node scripts/merge-venues-from-export.js ./export.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const venuesPath = path.join(projectRoot, "src", "data", "venues.js");

const exportPath = process.argv[2];
if (!exportPath) {
  console.error("Uso: node scripts/merge-venues-from-export.js <file-export.json>");
  process.exit(1);
}

const exportFullPath = path.isAbsolute(exportPath) ? exportPath : path.join(process.cwd(), exportPath);
if (!fs.existsSync(exportFullPath)) {
  console.error("File non trovato:", exportFullPath);
  process.exit(1);
}

let exported;
try {
  exported = JSON.parse(fs.readFileSync(exportFullPath, "utf-8"));
} catch (e) {
  console.error("Il file non è un JSON valido:", e.message);
  process.exit(1);
}

const newVenues = Array.isArray(exported.venues) ? exported.venues : [];
if (newVenues.length === 0) {
  console.log("Nessun locale nell'export.");
  process.exit(0);
}

const venuesJs = fs.readFileSync(venuesPath, "utf-8");
const existingIds = new Set(venuesJs.match(/"id":\s*"([^"]+)"/g)?.map((m) => m.replace(/"id":\s*"([^"]+)"/, "$1")) || []);

const toAdd = newVenues.filter((v) => v.id && !existingIds.has(v.id));
if (toAdd.length === 0) {
  console.log("Tutti i locali dell'export sono già presenti in venues.js.");
  process.exit(0);
}

// Formato oggetto come nel file (2 spazi per il primo livello)
function formatVenue(venue) {
  const str = JSON.stringify(venue, null, 2);
  return str
    .split("\n")
    .map((line) => "  " + line)
    .join("\n");
}

// Inseriamo prima della chiusura "];"
const insert = toAdd.map(formatVenue).join(",\n");
const lastBracket = venuesJs.lastIndexOf("];");
if (lastBracket === -1) {
  console.error("Impossibile trovare la fine dell'array in venues.js");
  process.exit(1);
}

const before = venuesJs.slice(0, lastBracket).trimEnd();
const needsComma = !before.endsWith(",");
const newContent =
  before + (needsComma ? "," : "") + "\n" + insert + "\n];\n";

fs.writeFileSync(venuesPath, newContent, "utf-8");
console.log("Aggiunti", toAdd.length, "locale/i a src/data/venues.js:", toAdd.map((v) => v.name).join(", "));
