#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";

const args = new Set(process.argv.slice(2));
const isApply = args.has("--apply");
const isDryRun = !isApply;

const TARGET_LANGS = ["en", "es", "fr", "de", "bg"];
const TABLES = ["cocktail", "distillati", "vini", "articoli", "Locali"];

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ptfywgpplpcvjyohnpkv.supabase.co";

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const SUPABASE_KEY =
  (isApply ? SERVICE_ROLE_KEY : SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY) ||
  "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or anon key for dry run).");
  process.exit(1);
}

if (isApply && !SERVICE_ROLE_KEY) {
  console.error("Apply mode requires SUPABASE_SERVICE_ROLE_KEY. Refusing to run with anon key.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

function hasValue(value) {
  return typeof value === "string" ? value.trim().length > 0 : value !== null && value !== undefined;
}

function normalizeText(value) {
  return String(value || "").trim();
}

const translateCache = new Map();

async function translateItTo(text, targetLang) {
  const input = normalizeText(text);
  if (!input) return "";

  const cacheKey = `${targetLang}::${input}`;
  if (translateCache.has(cacheKey)) return translateCache.get(cacheKey);

  const endpoint =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=it&tl=" +
    encodeURIComponent(targetLang) +
    "&dt=t&q=" +
    encodeURIComponent(input);

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Translation API error: HTTP ${response.status}`);
  }

  const payload = await response.json();
  const translated = Array.isArray(payload?.[0])
    ? payload[0].map((part) => part?.[0] || "").join("")
    : "";

  const normalized = normalizeText(translated) || input;
  translateCache.set(cacheKey, normalized);
  return normalized;
}

async function processRow(row, table) {
  const patch = {};
  const touched = [];

  for (const key of Object.keys(row)) {
    const match = key.match(/^(.*)_(en|es|fr|de|bg)$/i);
    if (!match) continue;

    const baseKey = match[1];
    const targetLang = match[2].toLowerCase();
    if (!TARGET_LANGS.includes(targetLang)) continue;
    if (hasValue(row[key])) continue;
    if (!Object.prototype.hasOwnProperty.call(row, baseKey)) continue;

    const sourceValue = row[baseKey];
    if (typeof sourceValue !== "string" || !sourceValue.trim()) continue;

    if (isApply) {
      try {
        patch[key] = await translateItTo(sourceValue, targetLang);
      } catch (err) {
        console.error(`[${table}] translate failed for row ${row.id}, field ${baseKey} -> ${key}:`, err.message);
      }
    } else {
      patch[key] = "<to-be-translated>";
    }

    if (Object.prototype.hasOwnProperty.call(patch, key)) {
      touched.push({ sourceKey: baseKey, targetKey: key, lang: targetLang });
    }
  }

  return { patch, touched };
}

async function run() {
  console.log(`Mode: ${isDryRun ? "DRY RUN" : "APPLY"}`);
  console.log(`Tables: ${TABLES.join(", ")}`);
  console.log(`Target languages: ${TARGET_LANGS.join(", ")}`);

  const summary = {
    tables: {},
    totalRows: 0,
    totalRowsToUpdate: 0,
    totalFieldUpdates: 0,
  };

  for (const table of TABLES) {
    const { data, error } = await supabase.from(table).select("*");
    if (error) {
      console.error(`[${table}] read error:`, error.message);
      continue;
    }

    const rows = Array.isArray(data) ? data : [];
    summary.totalRows += rows.length;

    const tableStats = {
      rows: rows.length,
      rowsToUpdate: 0,
      fieldUpdates: 0,
      rowsUpdated: 0,
      fieldUpdatesApplied: 0,
      fields: {},
      sample: [],
    };

    for (const row of rows) {
      const { patch, touched } = await processRow(row, table);
      if (!touched.length) continue;

      tableStats.rowsToUpdate += 1;
      tableStats.fieldUpdates += touched.length;

      for (const item of touched) {
        tableStats.fields[item.targetKey] = (tableStats.fields[item.targetKey] || 0) + 1;
      }

      if (tableStats.sample.length < 8) {
        tableStats.sample.push({ id: row.id, touched });
      }

      if (isApply) {
        const { data: updatedRows, error: updateError } = await supabase
          .from(table)
          .update(patch)
          .eq("id", row.id)
          .select("id");
        if (updateError) {
          console.error(`[${table}] update failed for row ${row.id}:`, updateError.message);
        } else if (!updatedRows || updatedRows.length === 0) {
          console.error(`[${table}] update skipped by policy or no matching row for id ${row.id}.`);
        } else {
          tableStats.rowsUpdated += 1;
          tableStats.fieldUpdatesApplied += Object.keys(patch).length;
        }
      }
    }

    summary.tables[table] = tableStats;
    summary.totalRowsToUpdate += tableStats.rowsToUpdate;
    summary.totalFieldUpdates += tableStats.fieldUpdates;
  }

  console.log("\n=== SUMMARY ===");
  console.log(JSON.stringify(summary, null, 2));

  if (isDryRun) {
    console.log("\nDry run complete. No database updates were performed.");
    console.log("Run with --apply to execute updates.");
  } else {
    console.log("\nApply complete.");
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
