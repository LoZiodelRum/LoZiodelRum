-- Aggiunge venue_name per locali custom (bartender scrive nome manualmente)
-- e crea bartenders_cloud per persistenza Supabase

-- 1. Aggiungi venue_name a app_users (bartender con locale non in lista)
alter table public.app_users add column if not exists venue_name text;

-- 2. Tabella bartenders_cloud per schede bartender complete
create table if not exists public.bartenders_cloud (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  name text not null,
  surname text,
  photo text,
  venue_id text,
  venue_name text,
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
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'featured')),
  interview_links jsonb default '[]',
  qa_links jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.bartenders_cloud enable row level security;

create policy "Allow read bartenders_cloud" on public.bartenders_cloud for select using (true);
create policy "Allow insert bartenders_cloud" on public.bartenders_cloud for insert with check (true);
create policy "Allow update bartenders_cloud" on public.bartenders_cloud for update using (true) with check (true);
create policy "Allow delete bartenders_cloud" on public.bartenders_cloud for delete using (true);

create index if not exists idx_bartenders_cloud_status on public.bartenders_cloud(status);
create index if not exists idx_bartenders_cloud_created_at on public.bartenders_cloud(created_at desc);

drop trigger if exists bartenders_cloud_updated_at on public.bartenders_cloud;
create trigger bartenders_cloud_updated_at
  before update on public.bartenders_cloud
  for each row execute function update_updated_at();
