ALTER TABLE public."Profili" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_can_read_own_profile" ON public."Profili";
DROP POLICY IF EXISTS "users_can_read_all_profiles" ON public."Profili";
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public."Profili";
DROP POLICY IF EXISTS "allow_profile_creation_during_signup" ON public."Profili";
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON public."Profili";

CREATE POLICY "users_can_read_own_profile"
  ON public."Profili"
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_can_insert_own_profile"
  ON public."Profili"
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile"
  ON public."Profili"
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_can_read_own_profile ON public.profiles;
DROP POLICY IF EXISTS users_can_insert_own_profile ON public.profiles;
DROP POLICY IF EXISTS users_can_update_own_profile ON public.profiles;

CREATE POLICY users_can_read_own_profile
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY users_can_insert_own_profile
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY users_can_update_own_profile
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
