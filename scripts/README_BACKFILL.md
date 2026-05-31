# Backfill e Traduzione Automatica Articoli

## Requisiti
- Node.js >= 18
- Variabile ambiente `DEEPL_API_KEY` impostata
- Modulo `node-fetch` installato
- Modulo `csv-writer` installato
- Accesso a Supabase tramite `src/lib/supabaseClient.ts`

## Uso

1. **Backup**: Prima di ogni update, viene creato un backup JSON e CSV di tutti gli articoli in `/backups`.
2. **Dry-run**: Per vedere cosa verrebbe aggiornato senza toccare il database:
   ```sh
   DRY_RUN=1 DEEPL_API_KEY=... node scripts/backfill-articles.ts
   ```
3. **Esecuzione reale**:
   ```sh
   DEEPL_API_KEY=... node scripts/backfill-articles.ts
   ```

## Modulare
- Per cambiare provider di traduzione, modifica solo `scripts/translator.ts`.

## Log finale
- Articoli analizzati
- Articoli tradotti
- Campi tradotti
- Campi saltati
- Errori

## Sicurezza
- Nessuna chiave API hardcoded.
- Nessun update distruttivo.
