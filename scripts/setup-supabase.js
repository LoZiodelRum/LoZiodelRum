#!/usr/bin/env node
/**
 * Script per verificare la configurazione Supabase e creare la tabella venues_cloud.
 * 
 * Uso:
 *   1. Assicurati che .env abbia VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
 *   2. node scripts/setup-supabase.js
 * 
 * Se la tabella non esiste, lo script mostra il SQL da eseguire nel Supabase Dashboard.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.env.VITE_SUPABASE_URL || "";
const key = process.env.VITE_SUPABASE_ANON_KEY || "";

function loadEnvFile(filePath) {
  try {
    const env = readFileSync(filePath, "utf8");
    for (const line of env.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("VITE_SUPABASE_URL=")) {
        process.env.VITE_SUPABASE_URL = trimmed.slice(18).trim().replace(/^["']|["']$/g, "");
      }
      if (trimmed.startsWith("VITE_SUPABASE_ANON_KEY=")) {
        process.env.VITE_SUPABASE_ANON_KEY = trimmed.slice(23).trim().replace(/^["']|["']$/g, "").split(/\s+\(/)[0];
      }
    }
  } catch (_) {}
}

loadEnvFile(join(__dirname, "..", ".env"));
loadEnvFile(join(__dirname, "..", ".env.local")); // override per Supabase locale

const finalUrl = process.env.VITE_SUPABASE_URL || url;
const finalKey = process.env.VITE_SUPABASE_ANON_KEY || key;

if (!finalUrl || !finalKey) {
  console.error("\n❌ Configurazione mancante. Aggiungi in .env:\n");
  console.error("   VITE_SUPABASE_URL=https://tuo-progetto.supabase.co");
  console.error("   VITE_SUPABASE_ANON_KEY=eyJhbGc... (chiave anon da Supabase → Settings → API)\n");
  process.exit(1);
}

const validKey = finalKey && !finalKey.includes("copia quella") && (finalKey.startsWith("eyJ") || finalKey.startsWith("sb_publishable_"));
if (!validKey) {
  console.error("\n❌ VITE_SUPABASE_ANON_KEY non valida.");
  console.error("   Copia la chiave 'anon public' o 'publishable' da Supabase → Settings → API.\n");
  process.exit(1);
}

const supabase = createClient(finalUrl, finalKey);

async function main() {
  console.log("\n🔍 Verifica connessione a Supabase...\n");

  const { data, error } = await supabase.from("venues_cloud").select("id").limit(1);

  if (error) {
    if (error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("Could not find the table")) {
      console.log("⚠️  La tabella venues_cloud non esiste ancora.\n");
      console.log("Esegui questo SQL nel Supabase Dashboard (SQL Editor → New query):\n");
      const schemaPath = join(__dirname, "..", "supabase", "schema.sql");
      const schema = readFileSync(schemaPath, "utf8");
      console.log(schema);
      const projectId = finalUrl.match(/https:\/\/([a-z]+)\.supabase\.co/)?.[1] || "project";
      console.log("\nApri il SQL Editor: https://supabase.com/dashboard/project/" + projectId + "/sql/new\n");
      process.exit(0);
    }
    console.error("❌ Errore:", error.message);
    process.exit(1);
  }

  console.log("✅ Supabase configurato correttamente. La tabella venues_cloud esiste.\n");
  console.log("I locali aggiunti dal cellulare appariranno nella Dashboard per l'approvazione.\n");
}

main();
