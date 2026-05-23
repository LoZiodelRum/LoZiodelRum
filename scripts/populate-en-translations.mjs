#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";

const args = new Set(process.argv.slice(2));
const isApply = args.has("--apply");
const isDryRun = !isApply;

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

const TABLES = ["cocktail", "distillati", "vini"];

const CONCEPTS = [
  {
    name: "description",
    sourceCandidates: ["description", "descrizione"],
    targetCandidates: ["description_en", "descrizione_en"],
  },
  {
    name: "ingredients",
    sourceCandidates: ["ingredients", "ingredienti"],
    targetCandidates: ["ingredients_en", "ingredienti_en"],
  },
  {
    name: "preparation",
    sourceCandidates: ["preparation", "preparazione", "recipe", "ricetta"],
    targetCandidates: ["preparation_en", "preparazione_en", "recipe_en", "ricetta_en"],
  },
  {
    name: "history",
    sourceCandidates: ["history", "storia"],
    targetCandidates: ["history_en", "storia_en"],
  },
  {
    name: "tasting",
    sourceCandidates: ["tasting", "degustazione", "note_degustazione", "tasting_notes", "tastingnotes"],
    targetCandidates: ["tasting_en", "degustazione_en", "note_degustazione_en", "tasting_notes_en", "tastingnotes_en"],
  },
  {
    name: "aromatic_notes",
    sourceCandidates: ["aromatic_notes", "note_aromatiche"],
    targetCandidates: ["aromatic_notes_en", "note_aromatiche_en"],
  },
  {
    name: "palate",
    sourceCandidates: ["palate", "sensazioni_al_palato", "palato"],
    targetCandidates: ["palate_en", "sensazioni_al_palato_en", "palato_en"],
  },
  {
    name: "pairing",
    sourceCandidates: ["pairing", "pairings", "abbinamenti"],
    targetCandidates: ["pairing_en", "pairings_en", "abbinamenti_en"],
  },
  {
    name: "provenance",
    sourceCandidates: ["provenance", "provenienza", "origine", "origin"],
    targetCandidates: ["provenance_en", "provenienza_en", "origine_en", "origin_en"],
  },
];

const MAPPED_TARGET_KEYS = new Set(
  CONCEPTS.flatMap((concept) => [
    ...concept.targetCandidates,
    ...concept.sourceCandidates.map((sourceKey) => `${sourceKey}_en`),
  ])
);

function hasValue(v) {
  return typeof v === "string" ? v.trim().length > 0 : v !== null && v !== undefined;
}

function pickSourceKey(row, candidates) {
  for (const key of candidates) {
    if (Object.prototype.hasOwnProperty.call(row, key) && hasValue(row[key])) return key;
  }
  return null;
}

function pickTargetKey(row, candidates, sourceKey) {
  for (const key of candidates) {
    if (Object.prototype.hasOwnProperty.call(row, key)) return key;
  }
  const derived = sourceKey ? `${sourceKey}_en` : null;
  if (derived && Object.prototype.hasOwnProperty.call(row, derived)) return derived;
  return null;
}

const translateCache = new Map();

async function translateItToEn(text) {
  const input = String(text || "").trim();
  if (!input) return "";
  if (translateCache.has(input)) return translateCache.get(input);

  const endpoint =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=it&tl=en&dt=t&q=" +
    encodeURIComponent(input);

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Translation API error: HTTP ${response.status}`);
  }

  const payload = await response.json();
  const translated = Array.isArray(payload?.[0])
    ? payload[0].map((part) => part?.[0] || "").join("")
    : "";

  const normalized = translated.trim() || input;
  translateCache.set(input, normalized);
  return normalized;
}

async function run() {
  console.log(`Mode: ${isDryRun ? "DRY RUN" : "APPLY"}`);
  console.log(`Tables: ${TABLES.join(", ")}`);

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
      const patch = {};
      const touched = [];

      for (const concept of CONCEPTS) {
        const sourceKey = pickSourceKey(row, concept.sourceCandidates);
        if (!sourceKey) continue;

        const targetKey = pickTargetKey(row, concept.targetCandidates, sourceKey);
        if (!targetKey) continue;

        const targetHasValue = hasValue(row[targetKey]);
        if (targetHasValue) continue;

        const sourceVal = String(row[sourceKey] || "").trim();
        if (!sourceVal) continue;

        if (isApply) {
          try {
            patch[targetKey] = await translateItToEn(sourceVal);
          } catch (err) {
            console.error(`[${table}] translate failed for row ${row.id}, field ${sourceKey}:`, err.message);
          }
        } else {
          patch[targetKey] = "<to-be-translated>";
        }

        if (Object.prototype.hasOwnProperty.call(patch, targetKey)) {
          touched.push({ concept: concept.name, sourceKey, targetKey });
          tableStats.fields[targetKey] = (tableStats.fields[targetKey] || 0) + 1;
          tableStats.fieldUpdates += 1;
        }
      }

      // Fallback auto-pass for fields not covered by explicit concept mapping:
      // for any '<field>_en' column, use '<field>' as source when available.
      for (const targetKey of Object.keys(row)) {
        if (!targetKey.endsWith("_en")) continue;
        if (MAPPED_TARGET_KEYS.has(targetKey)) continue;
        if (Object.prototype.hasOwnProperty.call(patch, targetKey)) continue;

        const targetHasValue = hasValue(row[targetKey]);
        if (targetHasValue) continue;

        const sourceKey = targetKey.slice(0, -3);
        if (!Object.prototype.hasOwnProperty.call(row, sourceKey)) continue;

        const sourceVal = row[sourceKey];
        if (typeof sourceVal !== "string" || !sourceVal.trim()) continue;

        if (isApply) {
          try {
            patch[targetKey] = await translateItToEn(sourceVal);
          } catch (err) {
            console.error(`[${table}] translate failed for row ${row.id}, field ${sourceKey}:`, err.message);
          }
        } else {
          patch[targetKey] = "<to-be-translated>";
        }

        if (Object.prototype.hasOwnProperty.call(patch, targetKey)) {
          touched.push({ concept: "auto_unmapped", sourceKey, targetKey });
          tableStats.fields[targetKey] = (tableStats.fields[targetKey] || 0) + 1;
          tableStats.fieldUpdates += 1;
        }
      }

      if (!touched.length) continue;

      tableStats.rowsToUpdate += 1;
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
