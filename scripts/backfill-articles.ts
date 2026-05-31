import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';
import { supabase } from '../src/lib/supabaseClient';
import { translateArticle } from './translateArticle';

const BACKUP_DIR = path.resolve(__dirname, '../backups');
const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';

async function backupArticles(articles: any[]) {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);
  const jsonPath = path.join(BACKUP_DIR, `articoli-backup-${Date.now()}.json`);
  const csvPath = path.join(BACKUP_DIR, `articoli-backup-${Date.now()}.csv`);
  fs.writeFileSync(jsonPath, JSON.stringify(articles, null, 2), 'utf8');

  const csvWriter = createObjectCsvWriter({
    path: csvPath,
    header: Object.keys(articles[0] || {}).map((k) => ({ id: k, title: k })),
  });
  await csvWriter.writeRecords(articles);
  console.log('Backup completato:', jsonPath, csvPath);
}

async function main() {
  const { data: articles, error } = await supabase.from('articoli').select('*');
  if (error) throw error;
  if (!articles || !articles.length) throw new Error('Nessun articolo trovato');

  await backupArticles(articles);

  let total = 0, updated = 0, fields = 0, errors = 0, skipped = 0;
  for (const article of articles) {
    total++;
    const { updates, skipped: skippedFields, errors: fieldErrors } = await translateArticle(article);
    skipped += skippedFields.length;
    errors += fieldErrors.length;
    if (Object.keys(updates).length > 0) {
      updated++;
      fields += Object.keys(updates).length;
      if (!DRY_RUN) {
        await supabase.from('articoli').update(updates).eq('id', article.id);
      }
    }
  }
  console.log('Articoli analizzati:', total);
  console.log('Articoli tradotti:', updated);
  console.log('Campi tradotti:', fields);
  console.log('Campi saltati:', skipped);
  console.log('Errori:', errors);
  if (DRY_RUN) console.log('Modalità DRY-RUN: nessun update applicato.');
}

main().catch((e) => { console.error('Errore backfill:', e); process.exit(1); });
