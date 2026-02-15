-- Colonna custom_venue_name per locali scritti a mano dal bartender
alter table public.app_users add column if not exists custom_venue_name text;

-- Policy per delete (necessaria per eliminare bartender)
drop policy if exists "Allow delete app_users" on public.app_users;
create policy "Allow delete app_users" on public.app_users for delete using (true);
