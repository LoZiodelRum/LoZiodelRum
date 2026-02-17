-- Aggiunge latitudine e longitudine alla tabella Locali (se non esistono)
alter table public."Locali" add column if not exists latitudine double precision;
alter table public."Locali" add column if not exists longitudine double precision;
