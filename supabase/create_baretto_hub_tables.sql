-- DrinkWise | Il Baretto Hub
-- Crea struttura completa Tavoli + chat realtime + moderazione
-- Eseguire in Supabase SQL Editor

create extension if not exists pgcrypto;

-- =====================================================
-- TABELLE PRINCIPALI (richieste)
-- =====================================================

create table if not exists public.tavoli (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descrizione text,
  categoria text,
  copertina_url text,
  creatore_id uuid not null,
  pubblico boolean not null default true,
  chiuso boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.tavolo_membri (
  id uuid primary key default gen_random_uuid(),
  tavolo_id uuid not null references public.tavoli(id) on delete cascade,
  utente_id uuid not null,
  joined_at timestamptz not null default now(),
  unique (tavolo_id, utente_id)
);

create table if not exists public.messaggi_tavolo (
  id uuid primary key default gen_random_uuid(),
  tavolo_id uuid not null references public.tavoli(id) on delete cascade,
  utente_id uuid not null,
  messaggio text,
  immagine_url text,
  risposta_a uuid references public.messaggi_tavolo(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint messaggi_tavolo_payload_chk check (
    coalesce(length(trim(messaggio)), 0) > 0
    or coalesce(length(trim(immagine_url)), 0) > 0
  )
);

create table if not exists public.reazioni_messaggi (
  id uuid primary key default gen_random_uuid(),
  messaggio_id uuid not null references public.messaggi_tavolo(id) on delete cascade,
  utente_id uuid not null,
  tipo text not null,
  unique (messaggio_id, utente_id, tipo)
);

create table if not exists public.segnalazioni_chat (
  id uuid primary key default gen_random_uuid(),
  messaggio_id uuid not null references public.messaggi_tavolo(id) on delete cascade,
  utente_id uuid not null,
  motivo text not null,
  created_at timestamptz not null default now()
);

-- =====================================================
-- TABELLE SUPPORTO (notifiche + presenza realtime)
-- =====================================================

create table if not exists public.baretto_notifiche (
  id uuid primary key default gen_random_uuid(),
  destinatario_id uuid not null,
  tavolo_id uuid not null references public.tavoli(id) on delete cascade,
  messaggio_id uuid not null references public.messaggi_tavolo(id) on delete cascade,
  tipo text not null check (tipo in ('message', 'mention')),
  letto boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.baretto_presenze (
  user_id uuid primary key,
  username text,
  online boolean not null default true,
  last_seen timestamptz not null default now()
);

-- =====================================================
-- INDICI
-- =====================================================

create index if not exists idx_tavoli_categoria on public.tavoli(categoria);
create index if not exists idx_tavoli_created_at on public.tavoli(created_at desc);
create index if not exists idx_tavolo_membri_tavolo on public.tavolo_membri(tavolo_id);
create index if not exists idx_tavolo_membri_utente on public.tavolo_membri(utente_id);
create index if not exists idx_messaggi_tavolo_tavolo_created on public.messaggi_tavolo(tavolo_id, created_at desc);
create index if not exists idx_messaggi_tavolo_utente on public.messaggi_tavolo(utente_id);
create index if not exists idx_reazioni_messaggi_messaggio on public.reazioni_messaggi(messaggio_id);
create index if not exists idx_segnalazioni_chat_messaggio on public.segnalazioni_chat(messaggio_id);
create index if not exists idx_baretto_notifiche_destinatario on public.baretto_notifiche(destinatario_id, letto, created_at desc);
create index if not exists idx_baretto_presenze_online on public.baretto_presenze(online, last_seen desc);

-- =====================================================
-- RLS
-- =====================================================

alter table public.tavoli enable row level security;
alter table public.tavolo_membri enable row level security;
alter table public.messaggi_tavolo enable row level security;
alter table public.reazioni_messaggi enable row level security;
alter table public.segnalazioni_chat enable row level security;
alter table public.baretto_notifiche enable row level security;
alter table public.baretto_presenze enable row level security;

-- Tavoli

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'tavoli' and policyname = 'tavoli_select_authenticated'
  ) then
    create policy tavoli_select_authenticated on public.tavoli
      for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'tavoli' and policyname = 'tavoli_insert_owner'
  ) then
    create policy tavoli_insert_owner on public.tavoli
      for insert to authenticated
      with check (auth.uid() = creatore_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'tavoli' and policyname = 'tavoli_update_owner_or_admin'
  ) then
    create policy tavoli_update_owner_or_admin on public.tavoli
      for update to authenticated
      using (
        auth.uid() = creatore_id
        or exists (
          select 1 from public."Profili" p where p.id = auth.uid() and lower(coalesce(p.ruolo, '')) = 'admin'
        )
      )
      with check (
        auth.uid() = creatore_id
        or exists (
          select 1 from public."Profili" p where p.id = auth.uid() and lower(coalesce(p.ruolo, '')) = 'admin'
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'tavoli' and policyname = 'tavoli_delete_admin_only'
  ) then
    create policy tavoli_delete_admin_only on public.tavoli
      for delete to authenticated
      using (
        exists (
          select 1 from public."Profili" p where p.id = auth.uid() and lower(coalesce(p.ruolo, '')) = 'admin'
        )
      );
  end if;
end $$;

-- Tavolo membri

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'tavolo_membri' and policyname = 'tavolo_membri_select_authenticated'
  ) then
    create policy tavolo_membri_select_authenticated on public.tavolo_membri
      for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'tavolo_membri' and policyname = 'tavolo_membri_insert_self_or_admin'
  ) then
    create policy tavolo_membri_insert_self_or_admin on public.tavolo_membri
      for insert to authenticated
      with check (
        auth.uid() = utente_id
        or exists (
          select 1 from public."Profili" p where p.id = auth.uid() and lower(coalesce(p.ruolo, '')) = 'admin'
        )
      );
  end if;
end $$;

-- Messaggi

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'messaggi_tavolo' and policyname = 'messaggi_select_authenticated'
  ) then
    create policy messaggi_select_authenticated on public.messaggi_tavolo
      for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'messaggi_tavolo' and policyname = 'messaggi_insert_self'
  ) then
    create policy messaggi_insert_self on public.messaggi_tavolo
      for insert to authenticated
      with check (auth.uid() = utente_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'messaggi_tavolo' and policyname = 'messaggi_delete_admin_only'
  ) then
    create policy messaggi_delete_admin_only on public.messaggi_tavolo
      for delete to authenticated
      using (
        exists (
          select 1 from public."Profili" p where p.id = auth.uid() and lower(coalesce(p.ruolo, '')) = 'admin'
        )
      );
  end if;
end $$;

-- Reazioni

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'reazioni_messaggi' and policyname = 'reazioni_select_authenticated'
  ) then
    create policy reazioni_select_authenticated on public.reazioni_messaggi
      for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'reazioni_messaggi' and policyname = 'reazioni_insert_self'
  ) then
    create policy reazioni_insert_self on public.reazioni_messaggi
      for insert to authenticated
      with check (auth.uid() = utente_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'reazioni_messaggi' and policyname = 'reazioni_delete_self_or_admin'
  ) then
    create policy reazioni_delete_self_or_admin on public.reazioni_messaggi
      for delete to authenticated
      using (
        auth.uid() = utente_id
        or exists (
          select 1 from public."Profili" p where p.id = auth.uid() and lower(coalesce(p.ruolo, '')) = 'admin'
        )
      );
  end if;
end $$;

-- Segnalazioni

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'segnalazioni_chat' and policyname = 'segnalazioni_insert_self'
  ) then
    create policy segnalazioni_insert_self on public.segnalazioni_chat
      for insert to authenticated
      with check (auth.uid() = utente_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'segnalazioni_chat' and policyname = 'segnalazioni_select_admin_only'
  ) then
    create policy segnalazioni_select_admin_only on public.segnalazioni_chat
      for select to authenticated
      using (
        exists (
          select 1 from public."Profili" p where p.id = auth.uid() and lower(coalesce(p.ruolo, '')) = 'admin'
        )
      );
  end if;
end $$;

-- Notifiche

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'baretto_notifiche' and policyname = 'notifiche_select_own'
  ) then
    create policy notifiche_select_own on public.baretto_notifiche
      for select to authenticated
      using (auth.uid() = destinatario_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'baretto_notifiche' and policyname = 'notifiche_insert_authenticated'
  ) then
    create policy notifiche_insert_authenticated on public.baretto_notifiche
      for insert to authenticated
      with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'baretto_notifiche' and policyname = 'notifiche_update_own'
  ) then
    create policy notifiche_update_own on public.baretto_notifiche
      for update to authenticated
      using (auth.uid() = destinatario_id)
      with check (auth.uid() = destinatario_id);
  end if;
end $$;

-- Presenze

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'baretto_presenze' and policyname = 'presenze_select_authenticated'
  ) then
    create policy presenze_select_authenticated on public.baretto_presenze
      for select to authenticated using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'baretto_presenze' and policyname = 'presenze_insert_own'
  ) then
    create policy presenze_insert_own on public.baretto_presenze
      for insert to authenticated
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'baretto_presenze' and policyname = 'presenze_update_own'
  ) then
    create policy presenze_update_own on public.baretto_presenze
      for update to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

-- =====================================================
-- STORAGE (upload immagini tavoli/messaggi)
-- =====================================================

insert into storage.buckets (id, name, public)
values ('baretto-media', 'baretto-media', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'baretto_media_read_public'
  ) then
    create policy baretto_media_read_public on storage.objects
      for select to public
      using (bucket_id = 'baretto-media');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'baretto_media_write_authenticated'
  ) then
    create policy baretto_media_write_authenticated on storage.objects
      for insert to authenticated
      with check (bucket_id = 'baretto-media');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'baretto_media_delete_owner_or_admin'
  ) then
    create policy baretto_media_delete_owner_or_admin on storage.objects
      for delete to authenticated
      using (
        bucket_id = 'baretto-media'
        and (
          owner = auth.uid()
          or exists (
            select 1 from public."Profili" p where p.id = auth.uid() and lower(coalesce(p.ruolo, '')) = 'admin'
          )
        )
      );
  end if;
end $$;

-- =====================================================
-- REALTIME
-- =====================================================

do $$
begin
  if not exists (
    select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tavoli'
  ) then
    alter publication supabase_realtime add table public.tavoli;
  end if;
  if not exists (
    select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tavolo_membri'
  ) then
    alter publication supabase_realtime add table public.tavolo_membri;
  end if;
  if not exists (
    select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messaggi_tavolo'
  ) then
    alter publication supabase_realtime add table public.messaggi_tavolo;
  end if;
  if not exists (
    select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'reazioni_messaggi'
  ) then
    alter publication supabase_realtime add table public.reazioni_messaggi;
  end if;
  if not exists (
    select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'baretto_presenze'
  ) then
    alter publication supabase_realtime add table public.baretto_presenze;
  end if;
  if not exists (
    select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'baretto_notifiche'
  ) then
    alter publication supabase_realtime add table public.baretto_notifiche;
  end if;
end $$;
