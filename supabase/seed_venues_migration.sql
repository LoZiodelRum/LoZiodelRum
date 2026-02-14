-- Migrazione: aggiungi external_id a venues_cloud
-- Esegui nel SQL Editor di Supabase DOPO aver creato venues_cloud.
-- external_id permette di usare gli id originali (es. 696d326e30cee44083123692) per compatibilità con le recensioni.
-- Dopo aver eseguito questo script, inserisci i locali da src/data/venues.js con external_id = id del seed.

alter table public.venues_cloud add column if not exists external_id text unique;
create index if not exists idx_venues_cloud_external_id on public.venues_cloud (external_id) where external_id is not null;
