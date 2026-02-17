-- Tabella Locali per schede locali complete (no venue_data)
-- Esegui nel SQL Editor di Supabase se la tabella non esiste

create table if not exists public."Locali" (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  indirizzo text,
  descrizione text,
  categoria text default 'cocktail_bar',
  image_url text,
  telefono text,
  orari text,
  citta text,
  paese text default 'Italia',
  sito text,
  instagram text,
  slug text,
  price_range text default '€€',
  latitudine double precision,
  longitudine double precision,
  video_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);

create index if not exists idx_locali_status on public."Locali"(status);
create index if not exists idx_locali_created_at on public."Locali"(created_at desc);
