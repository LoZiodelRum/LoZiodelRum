#!/usr/bin/env node
/**
 * Guida interattiva per aggiungere la chiave Supabase a .env.
 * Apre il browser, chiede di incollare la chiave, aggiorna .env.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createInterface } from "readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envPath = join(root, ".env");
const dashboardUrl = "https://supabase.com/dashboard/project/ptfywgpplpcvjyohnpkv/settings/api";

function loadEnv() {
  if (!existsSync(envPath)) return "";
  return readFileSync(envPath, "utf8");
}

function saveEnvWithKey(key) {
  let content = loadEnv();
  if (content.includes("VITE_SUPABASE_ANON_KEY=")) {
    content = content.replace(/VITE_SUPABASE_ANON_KEY=.*/m, `VITE_SUPABASE_ANON_KEY=${key}`);
  } else {
    content += `\nVITE_SUPABASE_ANON_KEY=${key}\n`;
  }
  writeFileSync(envPath, content.trim() + "\n");
}

async function main() {
  console.log("\n🔑 Configurazione Supabase per sync cellulare ↔ desktop\n");
  console.log("1. Si aprirà il browser alla pagina Supabase.");
  console.log("2. Copia la chiave 'anon public' (inizia con eyJ...).");
  console.log("3. Incollala qui sotto.\n");

  try {
    const { execSync } = await import("child_process");
    execSync(`open "${dashboardUrl}"`, { stdio: "ignore" });
  } catch (_) {}
  console.log("   Aperto: " + dashboardUrl + "\n");

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const key = await new Promise((resolve) => {
    rl.question("Incolla la chiave anon (eyJ...): ", (ans) => {
      rl.close();
      resolve(ans?.trim() || "");
    });
  });

  if (!key || !key.startsWith("eyJ")) {
    console.log("\n❌ Chiave non valida. Riprova.\n");
    process.exit(1);
  }

  saveEnvWithKey(key);
  console.log("\n✅ Chiave salvata in .env");
  console.log("   Esegui: npm run supabase:setup");
  console.log("   Poi: npm run dev\n");
}

main();
