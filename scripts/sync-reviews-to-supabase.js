#!/usr/bin/env node
/**
 * Sincronizzazione recensioni da reviews.js a reviews_cloud (Supabase).
 * Mappa venue_id vecchi (Base44) → UUID Locali tramite (nome, citta).
 *
 * Uso: node scripts/sync-reviews-to-supabase.js
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { reviewsData } from "../src/data/reviews.js";
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

/** Costruisce mappa: old_venue_id → { name, citta } */
function buildVenueMap() {
  const map = new Map();
  for (const v of venuesData) {
    const { citta } = parseCityProvince(v.city || "");
    map.set(v.id, { name: v.name || "", citta: citta || v.city || "" });
  }
  return map;
}

/** Costruisce mappa: "nome|citta" → Locali.id (UUID) */
async function buildLocaliMap() {
  const { data, error } = await supabase.from("Locali").select("id, nome, citta");
  if (error) throw error;
  const map = new Map();
  for (const row of data || []) {
    const key = `${(row.nome || "").trim()}|${(row.citta || "").trim()}`;
    map.set(key, String(row.id));
  }
  return map;
}

function toReviewsCloudRow(review, newVenueId) {
  return {
    venue_id: newVenueId,
    author_name: review.author_name || "Lo Zio del Rum - Maurizio Graci",
    title: review.title || null,
    content: review.content || null,
    visit_date: review.visit_date || null,
    drink_quality: review.drink_quality ?? null,
    staff_competence: review.staff_competence ?? null,
    atmosphere: review.atmosphere ?? null,
    value_for_money: review.value_for_money ?? null,
    overall_rating: review.overall_rating ?? null,
    drinks_ordered: [],
    photos: [],
    videos: [],
    highlights: [],
    improvements: [],
    would_recommend: true,
    status: "approved",
  };
}

async function run() {
  console.log("🔄 Sincronizzazione recensioni → reviews_cloud\n");

  const venueMap = buildVenueMap();
  const localiMap = await buildLocaliMap();

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const r of reviewsData) {
    const venueInfo = venueMap.get(r.venue_id);
    if (!venueInfo) {
      console.log(`   ⏭️  Salto: venue_id ${r.venue_id} non trovato in venues.js`);
      skipped++;
      continue;
    }

    const key = `${venueInfo.name.trim()}|${venueInfo.citta.trim()}`;
    const newVenueId = localiMap.get(key);
    if (!newVenueId) {
      console.log(`   ⏭️  Salto: locale "${venueInfo.name}" (${venueInfo.citta}) non trovato in Locali`);
      skipped++;
      continue;
    }

    // Evita duplicati: stessa recensione già presente
    const { data: existing } = await supabase
      .from("reviews_cloud")
      .select("id")
      .eq("venue_id", newVenueId)
      .eq("title", r.title || "")
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`   ⏭️  Già presente: "${(r.title || "").slice(0, 40)}..."`);
      skipped++;
      continue;
    }

    const row = toReviewsCloudRow(r, newVenueId);
    const { error } = await supabase.from("reviews_cloud").insert([row]);

    if (error) {
      console.error(`   ❌ Inserimento fallito:`, error.message);
      failed++;
      continue;
    }

    console.log(`   ✅ Inserita: "${(r.title || "").slice(0, 50)}..." → ${venueInfo.name}`);
    inserted++;
  }

  console.log(`\n✅ Sincronizzazione completata: ${inserted} inserite, ${skipped} saltate, ${failed} errori.\n`);
}

run().catch((err) => {
  console.error("Errore:", err);
  process.exit(1);
});
