-- Tabella per passkey WebAuthn admin (sostituisce localStorage)
create table if not exists public.admin_passkeys (
  id uuid primary key default gen_random_uuid(),
  credential_id text unique not null,
  created_at timestamptz default now()
);

alter table public.admin_passkeys enable row level security;

create policy "Allow read admin_passkeys" on public.admin_passkeys for select using (true);
create policy "Allow insert admin_passkeys" on public.admin_passkeys for insert with check (true);
create policy "Allow delete admin_passkeys" on public.admin_passkeys for delete using (true);
