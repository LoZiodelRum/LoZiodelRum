#!/usr/bin/env node
/**
 * Crea la tabella venues_cloud in Supabase (se non esiste).
 * Eseguito al build su Vercel quando SUPABASE_DB_URL è configurato.
 * Se la variabile non è impostata, esce senza errori.
 */
import { Client } from "pg";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const url = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!url) {
  process.exit(0);
}

const schemaPath = join(__dirname, "..", "supabase", "schema.sql");
const sql = readFileSync(schemaPath, "utf8").replace(/^--.*$/gm, "").trim();

async function main() {
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    await client.query(sql);
  } finally {
    await client.end();
  }
}

main().catch(() => process.exit(0));
