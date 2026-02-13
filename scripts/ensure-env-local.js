#!/usr/bin/env node
/**
 * Crea .env.local con credenziali Supabase locale se non esiste.
 * Usa: npm run supabase:start (avvia Supabase) poi npm run dev.
 * Il file .env.local fa usare all'app il Supabase locale (127.0.0.1:54321).
 */
import { writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envLocal = join(__dirname, "..", ".env.local");

const content = `# Supabase locale - usato con: npx supabase start
# L'app si connette a http://127.0.0.1:54321 (solo da questo computer)
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
`;

if (!existsSync(envLocal)) {
  writeFileSync(envLocal, content);
  console.log("✅ Creato .env.local per Supabase locale");
  console.log("   Esegui: npm run supabase:start (attendi il completamento)");
  console.log("   Poi: npm run dev\n");
  console.log("   ⚠️  Per sync cellulare-desktop usa Supabase cloud: rimuovi .env.local e configura .env\n");
} else {
  console.log("ℹ️  .env.local già presente\n");
}
