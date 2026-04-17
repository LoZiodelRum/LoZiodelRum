-- Abilita RLS sulla tabella (se non già attiva)
ALTER TABLE baretto_messaggi ENABLE ROW LEVEL SECURITY;

-- Permetti a tutti (autenticati e anonimi) di LEGGERE i messaggi
CREATE POLICY "baretto_select_public"
  ON baretto_messaggi
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Permetti a tutti (autenticati e anonimi) di INSERIRE messaggi
-- Utile per admin-key che non hanno sessione Supabase
CREATE POLICY "baretto_insert_public"
  ON baretto_messaggi
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
