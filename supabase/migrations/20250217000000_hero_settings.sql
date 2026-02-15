-- Tabella per impostazioni hero Home (sostituisce localStorage)
create table if not exists public.hero_settings (
  id uuid primary key default gen_random_uuid(),
  text1 text default 'Scopri i migliori',
  text2 text default 'locali del mondo',
  text1_size int default 72,
  text2_size int default 72,
  text1_color text default '#ffffff',
  text2_color text default '#f59e0b',
  updated_at timestamptz default now()
);

alter table public.hero_settings enable row level security;

create policy "Allow read hero_settings" on public.hero_settings for select using (true);
create policy "Allow insert hero_settings" on public.hero_settings for insert with check (true);
create policy "Allow update hero_settings" on public.hero_settings for update using (true);
