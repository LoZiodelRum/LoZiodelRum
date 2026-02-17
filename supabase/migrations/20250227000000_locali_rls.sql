-- RLS per Locali: permette lettura/scrittura a tutti (anon key)
-- Esegui nel SQL Editor di Supabase se i locali non compaiono dopo l'inserimento

alter table public."Locali" enable row level security;

drop policy if exists "Allow read Locali" on public."Locali";
create policy "Allow read Locali" on public."Locali" for select using (true);

drop policy if exists "Allow insert Locali" on public."Locali";
create policy "Allow insert Locali" on public."Locali" for insert with check (true);

drop policy if exists "Allow update Locali" on public."Locali";
create policy "Allow update Locali" on public."Locali" for update using (true) with check (true);

drop policy if exists "Allow delete Locali" on public."Locali";
create policy "Allow delete Locali" on public."Locali" for delete using (true);
