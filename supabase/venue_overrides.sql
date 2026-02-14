-- Esegui questo script nel SQL Editor di Supabase DOPO aver creato venues_cloud.
-- venue_overrides: modifiche admin ai locali seed – sincronizzate su tutti i device.
-- Quando l'admin modifica un locale dal seed (venues.js), le modifiche vengono
-- salvate qui. Tutti i dispositivi (Cursor, cellulare, tablet, PC) leggono da qui.

create table if not exists public.venue_overrides (
  venue_id text primary key,
  name text,
  description text,
  city text,
  country text,
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
  verified boolean,
  updated_at timestamptz default now()
);

alter table public.venue_overrides enable row level security;

drop policy if exists "Allow read venue_overrides" on public.venue_overrides;
create policy "Allow read venue_overrides" on public.venue_overrides for select using (true);

drop policy if exists "Allow insert venue_overrides" on public.venue_overrides;
create policy "Allow insert venue_overrides" on public.venue_overrides for insert with check (true);

drop policy if exists "Allow update venue_overrides" on public.venue_overrides;
create policy "Allow update venue_overrides" on public.venue_overrides for update using (true) with check (true);
