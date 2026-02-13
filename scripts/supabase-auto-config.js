#!/usr/bin/env node
/**
 * Configura Supabase in automatico.
 *
 * Opzione 1 - Con token (più veloce):
 *   Crea un token su https://supabase.com/dashboard/account/tokens
 *   Poi: SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/supabase-auto-config.js
 *
 * Opzione 2 - Supabase locale (richiede Docker):
 *   npx supabase start
 *   Lo script rileva Docker e usa i valori locali.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envPath = join(root, ".env");

function loadEnv() {
  const vars = {};
  if (!existsSync(envPath)) return vars;
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) vars[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return vars;
}

function saveEnv(vars) {
  const order = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY",
    "VITE_ADMIN_PASSWORD",
  ];
  const seen = new Set();
  const lines = [];
  for (const k of order) {
    if (vars[k] !== undefined && vars[k] !== "") {
      lines.push(`${k}=${vars[k]}`);
      seen.add(k);
    }
  }
  for (const [k, v] of Object.entries(vars)) {
    if (!seen.has(k) && v !== undefined && v !== "") {
      lines.push(`${k}=${v}`);
    }
  }
  writeFileSync(envPath, lines.join("\n") + "\n");
}

async function fetchAnonKeyFromApi(projectRef, token) {
  // Prova prima l'endpoint legacy (anon + service_role)
  const legacyUrl = `https://api.supabase.com/v1/projects/${projectRef}/api-keys/legacy`;
  let res = await fetch(legacyUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) {
    const data = await res.json();
    const key = data.anon_key ?? data.anon;
    if (key) return key;
  }

  // Fallback: lista api-keys (cerca quella anon)
  const listUrl = `https://api.supabase.com/v1/projects/${projectRef}/api-keys?reveal=true`;
  res = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  const keys = await res.json();
  const anon = Array.isArray(keys)
    ? keys.find((k) => (k.name || k.id || "").toString().toLowerCase().includes("anon"))
    : null;
  return anon?.api_key ?? anon?.key ?? anon?.value;
}

async function main() {
  const env = loadEnv();
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const url = env.VITE_SUPABASE_URL || "";

  // Estrai project ref dall'URL (es. https://xxx.supabase.co -> xxx)
  const projectRef = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];

  if (token && projectRef) {
    console.log("\n🔑 Recupero chiave anon da Supabase Management API...\n");
    try {
      const anonKey = await fetchAnonKeyFromApi(projectRef, token);
      if (anonKey && anonKey.startsWith("eyJ")) {
        env.VITE_SUPABASE_ANON_KEY = anonKey;
        saveEnv(env);
        console.log("✅ Chiave anon recuperata e salvata in .env\n");
        console.log("Se la tabella venues_cloud non esiste ancora, esegui: npm run supabase:setup");
        console.log("Poi riavvia l'app: npm run dev\n");
        return;
      }
    } catch (e) {
      console.error("❌ Errore API:", e.message);
    }
  }

  // Fallback: apri la dashboard
  if (projectRef) {
    const dashboardUrl = `https://supabase.com/dashboard/project/${projectRef}/settings/api`;
    console.log("\n📋 Copia la chiave 'anon public' da:\n");
    console.log(`   ${dashboardUrl}\n`);
    console.log("Poi incollala in .env come VITE_SUPABASE_ANON_KEY=\n");
    try {
      const { execSync } = await import("child_process");
      execSync(`open "${dashboardUrl}"`, { stdio: "ignore" });
      console.log("(Ho aperto il browser per te.)\n");
    } catch (_) {}
    return;
  }

  console.log("\n❌ Configurazione mancante.\n");
  console.log("1. Aggiungi VITE_SUPABASE_URL in .env (dal tuo progetto Supabase)");
  console.log("2. Poi esegui: SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/supabase-auto-config.js");
  console.log("   (Token da https://supabase.com/dashboard/account/tokens)\n");
}

main();
