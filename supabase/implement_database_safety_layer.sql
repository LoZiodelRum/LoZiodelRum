-- Database safety layer: deny accidental deletes and restrict updates.
-- Apply in Supabase SQL editor with a privileged role.

begin;

-- Soft-delete support columns (additive, non-destructive).
alter table if exists public."Locali" add column if not exists deleted_at timestamptz;
alter table if exists public."Locali" add column if not exists attivo boolean not null default true;
alter table if exists public.articoli add column if not exists deleted_at timestamptz;
alter table if exists public.cocktail add column if not exists deleted_at timestamptz;
alter table if exists public.distillati add column if not exists deleted_at timestamptz;
alter table if exists public.vini add column if not exists deleted_at timestamptz;
alter table if exists public."Profili" add column if not exists deleted_at timestamptz;

-- Hard block physical delete for public roles.
revoke delete on table public."Locali" from anon, authenticated;
revoke delete on table public.articoli from anon, authenticated;
revoke delete on table public.cocktail from anon, authenticated;
revoke delete on table public.distillati from anon, authenticated;
revoke delete on table public.vini from anon, authenticated;
revoke delete on table public."Profili" from anon, authenticated;

-- Block anonymous updates.
revoke update on table public."Locali" from anon;
revoke update on table public.articoli from anon;
revoke update on table public.cocktail from anon;
revoke update on table public.distillati from anon;
revoke update on table public.vini from anon;
revoke update on table public."Profili" from anon;

-- Enable RLS where missing.
alter table if exists public."Locali" enable row level security;
alter table if exists public.articoli enable row level security;
alter table if exists public.cocktail enable row level security;
alter table if exists public.distillati enable row level security;
alter table if exists public.vini enable row level security;
alter table if exists public."Profili" enable row level security;

-- Shared helper: current user is admin based on Profili.ruolo.
create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public."Profili" p
    where p.id = auth.uid()
      and lower(coalesce(p.ruolo, '')) = 'admin'
  );
$$;

-- Locali: only admin can update.
drop policy if exists locali_update_admin_only on public."Locali";
create policy locali_update_admin_only
on public."Locali"
for update
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());

-- Articoli: only admin can update.
drop policy if exists articoli_update_admin_only on public.articoli;
create policy articoli_update_admin_only
on public.articoli
for update
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());

-- Cocktail: only admin can update.
drop policy if exists cocktail_update_admin_only on public.cocktail;
create policy cocktail_update_admin_only
on public.cocktail
for update
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());

-- Distillati: only admin can update.
drop policy if exists distillati_update_admin_only on public.distillati;
create policy distillati_update_admin_only
on public.distillati
for update
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());

-- Vini: only admin can update.
drop policy if exists vini_update_admin_only on public.vini;
create policy vini_update_admin_only
on public.vini
for update
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());

-- Profili: owner or admin can update.
drop policy if exists profili_update_owner_or_admin on public."Profili";
create policy profili_update_owner_or_admin
on public."Profili"
for update
to authenticated
using (id = auth.uid() or public.is_current_user_admin())
with check (id = auth.uid() or public.is_current_user_admin());

commit;
