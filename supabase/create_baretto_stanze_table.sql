create table if not exists public.baretto_stanze (
  nome text primary key,
  created_at timestamp default now()
);
