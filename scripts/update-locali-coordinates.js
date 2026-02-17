#!/usr/bin/env node
/**
 * Aggiorna latitudine e longitudine nella tabella Locali usando i dati da venues.js.
 * Match per nome + citta.
 *
 * Uso: node scripts/update-locali-coordinates.js
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
// Nessun dato locale: la Dashboard usa SOLO Supabase tabella Locali
const venuesData = [];

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

async function run() {
  console.log("📍 Aggiornamento coordinate Locali da venues.js\n");

  let updated = 0;
  let notFound = 0;

  for (const v of venuesData) {
    if (v.latitude == null || v.longitude == null) continue;
    const { citta } = parseCityProvince(v.city || "");
    const searchCitta = citta || v.city || "";

    const { data: rows } = await supabase
      .from("Locali")
      .select("id, nome, citta")
      .eq("nome", v.name || "")
      .eq("citta", searchCitta)
      .limit(1);

    if (!rows || rows.length === 0) {
      console.log(`   ⏭️  Non trovato: ${v.name} (${searchCitta})`);
      notFound++;
      continue;
    }

    const { error } = await supabase
      .from("Locali")
      .update({ latitudine: String(v.latitude), longitudine: String(v.longitude) })
      .eq("id", rows[0].id);

    if (error) {
      if (error.message?.includes("latitudine") || error.message?.includes("longitudine")) {
        console.error(`\n❌ Le colonne latitudine/longitudine non esistono nella tabella Locali.`);
        console.error(`   Esegui nel SQL Editor di Supabase:\n`);
        console.error(`   alter table public."Locali" add column if not exists latitudine double precision;`);
        console.error(`   alter table public."Locali" add column if not exists longitudine double precision;\n`);
        process.exit(1);
      }
      console.error(`   ❌ Errore ${v.name}:`, error.message);
      continue;
    }
    console.log(`   ✅ Aggiornato: ${v.name} (${v.latitude}, ${v.longitude})`);
    updated++;
  }

  console.log(`\n✅ Completato: ${updated} aggiornati, ${notFound} non trovati.\n`);
}

run().catch((err) => {
  console.error("Errore:", err);
  process.exit(1);
});
