#!/usr/bin/env node
/**
 * Sincronizzazione massiva: upsert dei 19 locali Base44 nella tabella Locali.
 * Recupera dati storici da venues.js, mappa coordinate (lat/lng → latitudine/longitudine come stringhe),
 * upsert completo con nome, citta, indirizzo, latitudine, longitudine e tutti gli altri campi.
 *
 * Uso: node scripts/sync-base44-to-locali.js
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { venuesData } from "../src/data/venues.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv(filePath) {
  try {
    const env = readFileSync(filePath, "utf8");
    for (const line of env.split("\n")) {
      const t = line.trim();
      if (t.startsWith("VITE_SUPABASE_URL="))
        process.env.VITE_SUPABASE_URL = t.slice(18).trim().replace(/^["']|["']$/g, "");
      if (t.startsWith("VITE_SUPABASE_ANON_KEY="))
        process.env.VITE_SUPABASE_ANON_KEY = t.slice(23).trim().replace(/^["']|["']$/g, "").split(/\s+\(/)[0];
    }
  } catch (_) {}
}

loadEnv(join(__dirname, "..", ".env"));
loadEnv(join(__dirname, "..", ".env.local"));

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("❌ Configura VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

function parseCityProvince(cityStr) {
  if (!cityStr || typeof cityStr !== "string") return { citta: "", provincia: null };
  const parts = cityStr.split(",").map((s) => s.trim());
  if (parts.length >= 2 && parts[1].length <= 4) {
    return { citta: parts[0], provincia: parts[1] };
  }
  return { citta: cityStr, provincia: null };
}

/** Mappa venue Base44 → riga Locali. Coordinate come stringhe. Solo colonne garantite. */
function toLocaliRow(v) {
  const { citta, provincia } = parseCityProvince(v.city || "");
  const row = {
    nome: String(v.name || ""),
    descrizione: v.description || "",
    indirizzo: v.address || "",
    citta: citta || v.city || "",
    provincia: provincia || null,
    categoria: v.category || "cocktail_bar",
    orari: v.opening_hours || "",
    telefono: v.phone || "",
    status: "approved",
    image_url: v.cover_image || null,
  };
  if (v.latitude != null && v.longitude != null) {
    row.latitudine = String(v.latitude);
    row.longitudine = String(v.longitude);
  }
  return row;
}

async function run() {
  console.log("🔄 Sincronizzazione massiva Base44 → Locali (upsert)\n");
  console.log(`   Locali da sincronizzare: ${venuesData.length}\n`);

  let inserted = 0;
  let updated = 0;

  for (const v of venuesData) {
    const row = toLocaliRow(v);
    if (!row.nome) {
      console.log(`   ⏭️  Salto: nome vuoto`);
      continue;
    }

    const { data: existing } = await supabase
      .from("Locali")
      .select("id")
      .eq("nome", row.nome)
      .eq("citta", row.citta)
      .limit(1);

    if (existing && existing.length > 0) {
      const { error } = await supabase.from("Locali").update(row).eq("id", existing[0].id);
      if (error) {
        if (error.message?.includes("latitudine") || error.message?.includes("longitudine")) {
          console.error(`\n❌ Colonne latitudine/longitudine mancanti. Esegui in Supabase SQL Editor:`);
          console.error(`   alter table public."Locali" add column if not exists latitudine text;`);
          console.error(`   alter table public."Locali" add column if not exists longitudine text;\n`);
          process.exit(1);
        }
        console.error(`   ❌ Update ${row.nome}:`, error.message);
        continue;
      }
      console.log(`   ✅ Aggiornato: ${row.nome} (${row.citta})`);
      updated++;
    } else {
      const { error } = await supabase.from("Locali").insert([row]);
      if (error) {
        if (error.message?.includes("latitudine") || error.message?.includes("longitudine")) {
          console.error(`\n❌ Colonne latitudine/longitudine mancanti. Esegui in Supabase SQL Editor:`);
          console.error(`   alter table public."Locali" add column if not exists latitudine text;`);
          console.error(`   alter table public."Locali" add column if not exists longitudine text;\n`);
          process.exit(1);
        }
        console.error(`   ❌ Insert ${row.nome}:`, error.message);
        continue;
      }
      console.log(`   ✅ Inserito: ${row.nome} (${row.citta})`);
      inserted++;
    }
  }

  console.log(`\n✅ Sincronizzazione completata: ${inserted} inseriti, ${updated} aggiornati.\n`);
}

run().catch((err) => {
  console.error("Errore:", err);
  process.exit(1);
});
