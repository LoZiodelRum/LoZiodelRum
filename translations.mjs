#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const argSet = new Set(args);
const isApply = argSet.has("--apply");
const isDryRun = !isApply;

const TARGET_LANGS = ["en", "es", "fr", "de", "bg"];
const TABLES = ["cocktail", "distillati"];
const RETRY_DELAYS_MS = [1000, 2000, 4000];
const MAX_RETRIES = RETRY_DELAYS_MS.length;
const DELAY_BETWEEN_RECORDS_MS = 500;

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

function makeLog({ table, record, field, lang, retry, success, skipped, reason }) {
  const payload = {
    table,
    record,
    field,
    lang,
    retry,
    success,
    skipped,
  };

  if (reason) payload.reason = reason;
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

  if (error.httpStatus === 500 || error.httpStatus === 429) {
    return true;
  }

  return /fetch failed/i.test(String(error.message || ""));
}

async function translateItToWithRetry({ text, targetLang, table, recordId, field }) {
  const input = normalizeText(text);
  if (!input) return "";

  const cacheKey = `${targetLang}::${input}`;
  if (translateCache.has(cacheKey)) {
    return translateCache.get(cacheKey);
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const endpoint = buildTranslationEndpoint(input, targetLang);
      const response = await fetch(endpoint);

      if (!response.ok) {
        const error = new Error(`Translation API error: HTTP ${response.status}`);
        error.httpStatus = response.status;
        throw error;
      }

      const payload = await response.json();
      const translated = Array.isArray(payload?.[0])
        ? payload[0].map((part) => part?.[0] || "").join("")
        : "";

      const normalized = normalizeText(translated) || input;
      translateCache.set(cacheKey, normalized);

      makeLog({
        table,
        record: recordId,
        field,
        lang: targetLang,
        retry: attempt,
        success: true,
        skipped: false,
      });

      return normalized;
    } catch (error) {
      const retriable = isRetriableError(error);
      const canRetry = retriable && attempt < MAX_RETRIES;

      if (canRetry) {
        makeLog({
          table,
          record: recordId,
          field,
          lang: targetLang,
          retry: attempt + 1,
          success: false,
          skipped: false,
          reason: String(error.message || error),
        });
        await sleep(RETRY_DELAYS_MS[attempt]);
        continue;
      }

      throw error;
    }
  }

  throw new Error("Unexpected retry termination");
}

function getTranslatableTargets(row) {
  const targets = [];

  for (const key of Object.keys(row)) {
    const match = key.match(/^(.*)_(en|es|fr|de|bg)$/i);
    if (!match) continue;

    const baseKey = match[1];
    const targetLang = match[2].toLowerCase();

    if (!TARGET_LANGS.includes(targetLang)) continue;

    targets.push({
      sourceKey: baseKey,
      targetKey: key,
      targetLang,
    });
  }

  return targets;
}

async function processRow(row, table) {
  const patch = {};
  const targets = getTranslatableTargets(row);

  for (const target of targets) {
    const { sourceKey, targetKey, targetLang } = target;

    if (hasValue(row[targetKey])) {
      makeLog({
        table,
        record: row.id,
        field: targetKey,
        lang: targetLang,
        retry: 0,
        success: false,
        skipped: true,
        reason: "already-populated",
      });
      continue;
    }

    if (!Object.prototype.hasOwnProperty.call(row, sourceKey)) {
      makeLog({
        table,
        record: row.id,
        field: targetKey,
        lang: targetLang,
        retry: 0,
        success: false,
        skipped: true,
        reason: "missing-source-field",
      });
      continue;
    }

    const sourceValue = row[sourceKey];
    if (typeof sourceValue !== "string" || !sourceValue.trim()) {
      makeLog({
        table,
        record: row.id,
        field: targetKey,
        lang: targetLang,
        retry: 0,
        success: false,
        skipped: true,
        reason: "missing-source-value",
      });
      continue;
    }

    if (isDryRun) {
      patch[targetKey] = "<to-be-translated>";
      makeLog({
        table,
        record: row.id,
        field: targetKey,
        lang: targetLang,
        retry: 0,
        success: true,
        skipped: false,
      });
      continue;
    }

    try {
      patch[targetKey] = await translateItToWithRetry({
        text: sourceValue,
        targetLang,
        table,
        recordId: row.id,
        field: targetKey,
      });
    } catch (error) {
      makeLog({
        table,
        record: row.id,
        field: targetKey,
        lang: targetLang,
        retry: MAX_RETRIES,
        success: false,
        skipped: true,
        reason: String(error.message || error),
      });
    }
  }

  return patch;
}

async function fetchOneRow(table, offset) {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("id", { ascending: true })
    .range(offset, offset);

  if (error) {
    throw error;
  }

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  return data[0];
}

async function run() {
  console.log(`Mode: ${isDryRun ? "DRY RUN" : "APPLY"}`);
  console.log(`Tables: ${TABLES.join(", ")}`);
  console.log(`Target languages: ${TARGET_LANGS.join(", ")}`);
  console.log(`Concurrency: max 1 record at a time`);

  const summary = {
    tables: {},
    totalRowsScanned: 0,
    totalRowsUpdated: 0,
    totalFieldUpdatesApplied: 0,
  };

  for (const table of TABLES) {
    const tableStats = {
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
        console.error(`[${table}] read error at offset ${offset}:`, error.message);
        tableStats.updateErrors += 1;
        offset += 1;
        await sleep(DELAY_BETWEEN_RECORDS_MS);
        continue;
      }

      if (!row) break;

      tableStats.rowsScanned += 1;
      summary.totalRowsScanned += 1;

      const patch = await processRow(row, table);
      const patchKeys = Object.keys(patch);

      if (patchKeys.length > 0) {
        tableStats.rowsWithPatch += 1;

        if (isApply) {
          const { data: updatedRows, error: updateError } = await supabase
            .from(table)
            .update(patch)
            .eq("id", row.id)
            .select("id");

          if (updateError) {
            tableStats.updateErrors += 1;
            console.error(`[${table}] update failed for row ${row.id}:`, updateError.message);
          } else if (!updatedRows || updatedRows.length === 0) {
            tableStats.updateErrors += 1;
            console.error(`[${table}] update skipped by policy or no matching row for id ${row.id}.`);
          } else {
            tableStats.rowsUpdated += 1;
            tableStats.fieldUpdatesApplied += patchKeys.length;
            summary.totalRowsUpdated += 1;
            summary.totalFieldUpdatesApplied += patchKeys.length;
          }
        }
      }

      offset += 1;
      await sleep(DELAY_BETWEEN_RECORDS_MS);
    }

    summary.tables[table] = tableStats;
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
