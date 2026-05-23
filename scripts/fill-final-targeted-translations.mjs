#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";

const args = new Set(process.argv.slice(2));
const isApply = args.has("--apply");
const isDryRun = !isApply;

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "";

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

const SUPABASE_KEY = isApply ? SERVICE_ROLE_KEY : SERVICE_ROLE_KEY || ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or anon key for dry run).");
  process.exit(1);
}

if (isApply && !SERVICE_ROLE_KEY) {
  console.error("Apply mode requires SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const TABLE_CONFIG = {
  Locali: [
    { source: "nome", target: "nome_en", lang: "en" },
    { source: "nome", target: "nome_bg", lang: "bg" },
    { source: "descrizione", target: "descrizione_en", lang: "en" },
    { source: "descrizione", target: "descrizione_bg", lang: "bg" },
  ],
  articoli: [
    { source: "titolo", target: "titolo_en", lang: "en" },
    { source: "titolo", target: "titolo_bg", lang: "bg" },
    { source: "contenuto", target: "contenuto_en", lang: "en" },
    { source: "contenuto", target: "contenuto_bg", lang: "bg" },
  ],
  vini: [{ source: "nome", target: "nome_bg", lang: "bg" }],
};

const RECORD_DELAY_MS = 1000;
const RETRY_DELAYS_MS = [1000, 2000, 4000];
const MAX_RETRIES = RETRY_DELAYS_MS.length;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

const translateCache = new Map();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasValue(value) {
  return typeof value === "string" ? value.trim().length > 0 : value !== null && value !== undefined;
}

function normalizeText(value) {
  return String(value || "").trim();
}

function logEvent(payload) {
  console.log(JSON.stringify(payload));
}

function buildTranslationEndpoint(input, targetLang) {
  return (
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=it&tl=" +
    encodeURIComponent(targetLang) +
    "&dt=t&q=" +
    encodeURIComponent(input)
  );
}

function isRetriableError(error) {
  if (!error) return false;
  if (error.httpStatus === 429 || error.httpStatus >= 500) return true;
  return /fetch failed/i.test(String(error.message || ""));
}

async function translateWithRetry({ text, targetLang, table, rowId, field }) {
  const input = normalizeText(text);
  if (!input) return "";

  const cacheKey = `${targetLang}::${input}`;
  if (translateCache.has(cacheKey)) {
    return translateCache.get(cacheKey);
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(buildTranslationEndpoint(input, targetLang));
      if (!response.ok) {
        const err = new Error(`Translation API HTTP ${response.status}`);
        err.httpStatus = response.status;
        throw err;
      }

      const payload = await response.json();
      const translated = Array.isArray(payload?.[0])
        ? payload[0].map((part) => part?.[0] || "").join("")
        : "";
      const normalized = normalizeText(translated) || input;

      translateCache.set(cacheKey, normalized);
      logEvent({ table, record: rowId, field, lang: targetLang, retry: attempt, status: "translated" });
      return normalized;
    } catch (error) {
      const canRetry = isRetriableError(error) && attempt < MAX_RETRIES;
      logEvent({
        table,
        record: rowId,
        field,
        lang: targetLang,
        retry: attempt,
        status: canRetry ? "retry" : "failed",
        reason: String(error.message || error),
      });

      if (!canRetry) {
        throw error;
      }
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }

  throw new Error("Unexpected retry termination");
}

async function fetchOneRow(table, offset) {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("id", { ascending: true })
    .range(offset, offset);

  if (error) throw error;
  if (!Array.isArray(data) || data.length === 0) return null;
  return data[0];
}

async function processRow(table, row) {
  const cfg = TABLE_CONFIG[table] || [];
  const patch = {};

  for (const entry of cfg) {
    const sourceValue = row[entry.source];
    const targetValue = row[entry.target];

    if (hasValue(targetValue)) {
      logEvent({
        table,
        record: row.id,
        field: entry.target,
        lang: entry.lang,
        status: "skipped",
        reason: "already-populated",
      });
      continue;
    }

    if (!hasValue(sourceValue)) {
      logEvent({
        table,
        record: row.id,
        field: entry.target,
        lang: entry.lang,
        status: "skipped",
        reason: "missing-source",
      });
      continue;
    }

    if (isDryRun) {
      patch[entry.target] = "<to-be-translated>";
      logEvent({ table, record: row.id, field: entry.target, lang: entry.lang, status: "dry-run" });
      continue;
    }

    try {
      patch[entry.target] = await translateWithRetry({
        text: sourceValue,
        targetLang: entry.lang,
        table,
        rowId: row.id,
        field: entry.target,
      });
    } catch (error) {
      logEvent({
        table,
        record: row.id,
        field: entry.target,
        lang: entry.lang,
        status: "failed",
        reason: String(error.message || error),
      });
    }
  }

  return patch;
}

async function run() {
  console.log(`Mode: ${isDryRun ? "DRY RUN" : "APPLY"}`);
  console.log(`Tables: ${Object.keys(TABLE_CONFIG).join(", ")}`);
  console.log(`Concurrency: 1 record at a time`);
  console.log(`Delay between records: ${RECORD_DELAY_MS}ms`);

  const summary = {
    totalRowsScanned: 0,
    totalRowsUpdated: 0,
    totalFieldUpdatesApplied: 0,
    tables: {},
  };

  for (const table of Object.keys(TABLE_CONFIG)) {
    const stats = {
      rowsScanned: 0,
      rowsWithPatch: 0,
      rowsUpdated: 0,
      fieldUpdatesApplied: 0,
      updateErrors: 0,
    };

    let offset = 0;

    while (true) {
      let row;
      try {
        row = await fetchOneRow(table, offset);
      } catch (error) {
        stats.updateErrors += 1;
        logEvent({
          table,
          record: null,
          field: null,
          lang: null,
          status: "read-error",
          reason: String(error.message || error),
          offset,
        });
        offset += 1;
        await sleep(RECORD_DELAY_MS);
        continue;
      }

      if (!row) break;

      stats.rowsScanned += 1;
      summary.totalRowsScanned += 1;

      const patch = await processRow(table, row);
      const patchKeys = Object.keys(patch);

      if (patchKeys.length > 0) {
        stats.rowsWithPatch += 1;

        if (isApply) {
          const { data: updatedRows, error: updateError } = await supabase
            .from(table)
            .update(patch)
            .eq("id", row.id)
            .select("id");

          if (updateError) {
            stats.updateErrors += 1;
            logEvent({
              table,
              record: row.id,
              field: patchKeys.join(","),
              lang: "mixed",
              status: "update-failed",
              reason: updateError.message,
            });
          } else if (!updatedRows || updatedRows.length === 0) {
            stats.updateErrors += 1;
            logEvent({
              table,
              record: row.id,
              field: patchKeys.join(","),
              lang: "mixed",
              status: "update-skipped",
              reason: "policy-or-no-row",
            });
          } else {
            stats.rowsUpdated += 1;
            stats.fieldUpdatesApplied += patchKeys.length;
            summary.totalRowsUpdated += 1;
            summary.totalFieldUpdatesApplied += patchKeys.length;
            logEvent({
              table,
              record: row.id,
              field: patchKeys.join(","),
              lang: "mixed",
              status: "updated",
            });
          }
        }
      }

      offset += 1;
      await sleep(RECORD_DELAY_MS);
    }

    summary.tables[table] = stats;
  }

  console.log("\n=== SUMMARY ===");
  console.log(JSON.stringify(summary, null, 2));
}

run().catch((error) => {
  console.error("Fatal error:", error.message || error);
  process.exit(1);
});
