-- Aggiunge latitudine e longitudine alla tabella Locali (tipo text per compatibilità)
alter table public."Locali" add column if not exists latitudine text;
alter table public."Locali" add column if not exists longitudine text;
