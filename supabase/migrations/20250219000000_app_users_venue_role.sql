-- Tabella unica: Locali e Bartender in app_users
-- Aggiunge role 'venue' e colonna venue_data per dati locali
alter table public.app_users drop constraint if exists app_users_role_check;
alter table public.app_users add constraint app_users_role_check
  check (role in ('proprietario', 'bartender', 'user', 'admin', 'venue'));

alter table public.app_users add column if not exists venue_data jsonb default null;
