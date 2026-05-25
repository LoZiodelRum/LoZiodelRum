-- RLS policies per la tabella Profili
-- Abilita RLS
ALTER TABLE public."Profili" ENABLE ROW LEVEL SECURITY;

-- DROP POLICY IF EXISTS per pulire eventuali policy vecchie
DROP POLICY IF EXISTS "users_can_read_own_profile" ON public."Profili";
DROP POLICY IF EXISTS "users_can_read_all_profiles" ON public."Profili";
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public."Profili";
DROP POLICY IF EXISTS "allow_profile_creation_during_signup" ON public."Profili";
DROP POLICY IF EXISTS "service_role_can_do_all" ON public."Profili";

-- Policy 1: Gli utenti autenticati possono leggere il loro profilo
CREATE POLICY "users_can_read_own_profile"
  ON public."Profili"
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Chiunque (anche non autenticato) può leggere i profili pubblici
CREATE POLICY "users_can_read_all_profiles"
  ON public."Profili"
  FOR SELECT
  USING (true);

-- Policy 3: Gli utenti autenticati possono aggiornare il loro profilo
CREATE POLICY "users_can_update_own_profile"
  ON public."Profili"
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: consente la creazione del profilo durante signup
CREATE POLICY "allow_profile_creation_during_signup"
  ON public."Profili"
  FOR INSERT
  WITH CHECK (true);

-- Policy 5: Service role (server-side) può fare qualsiasi cosa
-- Nota: Questa è gestita dal database stesso, non serve una policy esplicita per il service role
