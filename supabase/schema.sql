-- Esegui questo script nel dashboard Supabase (SQL Editor) per creare la tabella.
-- I locali inseriti dal cellulare vengono salvati qui; in Dashboard vedi quelli in attesa e li approvi.

create table if not exists public.venues_cloud (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text,
  description text,
  city text,
  country text default 'Italia',
  address text,
  latitude double precision,
  longitude double precision,
  cover_image text,
  category text,
  price_range text,
  phone text,
  website text,
  instagram text,
  opening_hours text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  -- campi calcolati dopo approvazione (opzionali)
  avg_drink_quality numeric,
  avg_staff_competence numeric,
  avg_atmosphere numeric,
  avg_value numeric,
  overall_rating numeric,
  review_count int default 0,
  featured boolean default false,
  verified boolean default true
);

-- Chiunque può inserire (utente dal cellulare)
alter table public.venues_cloud enable row level security;

drop policy if exists "Allow insert for everyone" on public.venues_cloud;
create policy "Allow insert for everyone"
  on public.venues_cloud for insert
  with check (true);

-- Chiunque può leggere (app carica approved, dashboard carica pending)
drop policy if exists "Allow read for everyone" on public.venues_cloud;
create policy "Allow read for everyone"
  on public.venues_cloud for select
  using (true);

-- Chiunque può aggiornare (in produzione restringi con auth; la Dashboard è solo per admin)
drop policy if exists "Allow update for everyone" on public.venues_cloud;
create policy "Allow update for everyone"
  on public.venues_cloud for update
  using (true)
  with check (true);

-- Indice per filtrare per status
create index if not exists idx_venues_cloud_status on public.venues_cloud (status);
create index if not exists idx_venues_cloud_created_at on public.venues_cloud (created_at desc);
