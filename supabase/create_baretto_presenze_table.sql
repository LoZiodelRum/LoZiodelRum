create table if not exists public.baretto_presenze (
  user_id uuid primary key,
  username text,
  online boolean default true,
  last_seen timestamp with time zone default now()
);

-- Abilita RLS
ALTER TABLE baretto_presenze ENABLE ROW LEVEL SECURITY;

-- Policy: ogni utente può modificare solo la propria presenza
CREATE POLICY "update_own_presence" ON baretto_presenze
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "insert_own_presence" ON baretto_presenze
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "select_all" ON baretto_presenze
  FOR SELECT USING (true);
