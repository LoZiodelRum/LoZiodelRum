-- Aggiunge colonna provincia alla tabella Locali
alter table public."Locali" add column if not exists provincia text;
