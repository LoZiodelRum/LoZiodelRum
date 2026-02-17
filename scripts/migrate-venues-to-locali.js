#!/usr/bin/env node
/**
 * Migrazione: inserisce i 19 locali da src/data/venues.js nella tabella Locali di Supabase.
 * Esegui UNA VOLTA dopo aver configurato Supabase.
 *
 * Uso: node scripts/migrate-venues-to-locali.js
 *
 * Mapping: name->nome, city->citta, address->indirizzo, category->categoria, status='approved', ecc.
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

/** Estrae citta e provincia da "Canicattì, AG" -> { citta: "Canicattì", provincia: "AG" } */
function parseCityProvince(cityStr) {
  if (!cityStr || typeof cityStr !== "string") return { citta: "", provincia: null };
  const parts = cityStr.split(",").map((s) => s.trim());
  if (parts.length >= 2 && parts[1].length <= 4) {
    return { citta: parts[0], provincia: parts[1] };
  }
  return { citta: cityStr, provincia: null };
}

/** Mappa un venue da venues.js al formato Locali */
function mapToLocali(v) {
  const { citta, provincia } = parseCityProvince(v.city || "");
  const row = {
    nome: v.name || "",
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
    row.latitudine = v.latitude;
    row.longitudine = v.longitude;
  }
  return row;
}

async function run() {
  console.log("📦 Migrazione locali da venues.js → Locali (Supabase)\n");
  console.log(`   Locali da migrare: ${venuesData.length}\n`);

  let inserted = 0;
  let skipped = 0;

  for (const v of venuesData) {
    const row = mapToLocali(v);
    if (!row.nome) {
      console.log(`   ⏭️  Salto: nome vuoto`);
      skipped++;
      continue;
    }

    const { data: existing } = await supabase
      .from("Locali")
      .select("id")
      .eq("nome", row.nome)
      .eq("citta", row.citta)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`   ⏭️  Già presente: ${row.nome} (${row.citta})`);
      skipped++;
      continue;
    }

    const { error } = await supabase.from("Locali").insert([row]);
    if (error) {
      console.error(`   ❌ Errore ${row.nome}:`, error.message);
      continue;
    }
    console.log(`   ✅ Inserito: ${row.nome} (${row.citta})`);
    inserted++;
  }

  console.log(`\n✅ Migrazione completata: ${inserted} inseriti, ${skipped} saltati.\n`);
}

run().catch((err) => {
  console.error("Errore:", err);
  process.exit(1);
});
