-- ============================================================
-- Lo Zio del Rum: Sistema Auth, Registrazioni e Recensioni
-- Esegui nel SQL Editor di Supabase
-- ============================================================

-- 1. PROFILI UTENTI (registrazioni community)
create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text not null,
  role text not null check (role in ('proprietario', 'bartender', 'user', 'admin')),
  role_label text,
  -- Proprietario
  venue_ids uuid[],
  -- Bartender (scheda dettagliata)
  surname text,
  photo text,
  venue_id uuid,
  city text,
  specialization text,
  years_experience text,
  philosophy text,
  distillati_preferiti text,
  approccio_degustazione text,
  consiglio_inizio text,
  signature_drinks text,
  percorso_esperienze text,
  bio text,
  motivation text,
  consent_linee_editoriali boolean default false,
  -- User (scheda leggera)
  bio_light text,
  home_city text,
  -- Comuni
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.app_users enable row level security;

create policy "Allow read app_users" on public.app_users for select using (true);
create policy "Allow insert app_users" on public.app_users for insert with check (true);
create policy "Allow update app_users" on public.app_users for update using (true) with check (true);

create index if not exists idx_app_users_role on public.app_users(role);
create index if not exists idx_app_users_status on public.app_users(status);
create index if not exists idx_app_users_created_at on public.app_users(created_at desc);

-- 2. RECENSIONI CLOUD (con foto e video)
create table if not exists public.reviews_cloud (
  id uuid primary key default gen_random_uuid(),
  venue_id text not null,
  author_id uuid references public.app_users(id),
  author_name text not null,
  title text,
  content text,
  visit_date date,
  drink_quality numeric,
  staff_competence numeric,
  atmosphere numeric,
  value_for_money numeric,
  overall_rating numeric,
  drinks_ordered jsonb default '[]',
  photos text[] default '{}',
  videos text[] default '{}',
  highlights text[] default '{}',
  improvements text[] default '{}',
  would_recommend boolean default true,
  status text default 'approved' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.reviews_cloud enable row level security;

create policy "Allow read reviews_cloud" on public.reviews_cloud for select using (true);
create policy "Allow insert reviews_cloud" on public.reviews_cloud for insert with check (true);
create policy "Allow update reviews_cloud" on public.reviews_cloud for update using (true) with check (true);

create index if not exists idx_reviews_cloud_venue on public.reviews_cloud(venue_id);
create index if not exists idx_reviews_cloud_created_at on public.reviews_cloud(created_at desc);

-- 3. Trigger updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists app_users_updated_at on public.app_users;
create trigger app_users_updated_at
  before update on public.app_users
  for each row execute function update_updated_at();

drop trigger if exists reviews_cloud_updated_at on public.reviews_cloud;
create trigger reviews_cloud_updated_at
  before update on public.reviews_cloud
  for each row execute function update_updated_at();
