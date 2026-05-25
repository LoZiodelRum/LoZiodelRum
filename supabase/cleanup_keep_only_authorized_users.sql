-- Keep only authorized users and remove all other user traces.
-- Run in Supabase SQL Editor with role postgres.

BEGIN;

CREATE TEMP TABLE allowed_emails (
  email text PRIMARY KEY
) ON COMMIT DROP;

INSERT INTO allowed_emails (email)
VALUES
  ('dott.mauriziograci@gmail.com'),
  ('mauriziograci@gmail.com'),
  ('alessandroparisi02@gmail.com');

-- Delete rows in tables that reference auth.users(id) via FK for non-authorized users.
DO $$
DECLARE
  fk_row record;
BEGIN
  FOR fk_row IN
    SELECT
      n.nspname AS schema_name,
      c.relname AS table_name,
      a.attname AS column_name
    FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN LATERAL unnest(con.conkey) AS conkey(attnum) ON true
    JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = conkey.attnum
    WHERE con.contype = 'f'
      AND con.confrelid = 'auth.users'::regclass
  LOOP
    EXECUTE format(
      'DELETE FROM %I.%I WHERE %I IN (
         SELECT id
         FROM auth.users
         WHERE lower(coalesce(email, '''')) NOT IN (SELECT email FROM allowed_emails)
       )',
      fk_row.schema_name,
      fk_row.table_name,
      fk_row.column_name
    );
  END LOOP;
END $$;

-- Extra cleanup in auth schemas (safe if rows do not exist).
DELETE FROM auth.identities
WHERE user_id IN (
  SELECT id
  FROM auth.users
  WHERE lower(coalesce(email, '')) NOT IN (SELECT email FROM allowed_emails)
);

DELETE FROM auth.sessions
WHERE user_id IN (
  SELECT id
  FROM auth.users
  WHERE lower(coalesce(email, '')) NOT IN (SELECT email FROM allowed_emails)
);

DELETE FROM auth.refresh_tokens
WHERE user_id IN (
  SELECT id
  FROM auth.users
  WHERE lower(coalesce(email, '')) NOT IN (SELECT email FROM allowed_emails)
);

-- Profile tables cleanup by id/email.
DO $$
BEGIN
  IF to_regclass('public."Profili"') IS NOT NULL THEN
    EXECUTE '
      DELETE FROM public."Profili"
      WHERE id IN (
        SELECT id
        FROM auth.users
        WHERE lower(coalesce(email, '''')) NOT IN (SELECT email FROM allowed_emails)
      )
      OR lower(coalesce(email, '''')) NOT IN (SELECT email FROM allowed_emails)
    ';
  END IF;

  IF to_regclass('public.profiles') IS NOT NULL THEN
    EXECUTE '
      DELETE FROM public.profiles
      WHERE id IN (
        SELECT id
        FROM auth.users
        WHERE lower(coalesce(email, '''')) NOT IN (SELECT email FROM allowed_emails)
      )
      OR lower(coalesce(email, '''')) NOT IN (SELECT email FROM allowed_emails)
    ';
  END IF;
END $$;

-- Remove non-authorized auth users.
DELETE FROM auth.users
WHERE lower(coalesce(email, '')) NOT IN (SELECT email FROM allowed_emails);

-- Keep registration open for new users: own profile read/insert/update policies.
DO $$
BEGIN
  IF to_regclass('public."Profili"') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public."Profili" ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "users_can_read_own_profile" ON public."Profili"';
    EXECUTE 'DROP POLICY IF EXISTS "users_can_insert_own_profile" ON public."Profili"';
    EXECUTE 'DROP POLICY IF EXISTS "users_can_update_own_profile" ON public."Profili"';
    EXECUTE '
      CREATE POLICY "users_can_read_own_profile"
      ON public."Profili"
      FOR SELECT
      USING (auth.uid() = id)
    ';
    EXECUTE '
      CREATE POLICY "users_can_insert_own_profile"
      ON public."Profili"
      FOR INSERT
      WITH CHECK (auth.uid() = id)
    ';
    EXECUTE '
      CREATE POLICY "users_can_update_own_profile"
      ON public."Profili"
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id)
    ';
  END IF;

  IF to_regclass('public.profiles') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS users_can_read_own_profile ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS users_can_insert_own_profile ON public.profiles';
    EXECUTE 'DROP POLICY IF EXISTS users_can_update_own_profile ON public.profiles';
    EXECUTE '
      CREATE POLICY users_can_read_own_profile
      ON public.profiles
      FOR SELECT
      USING (auth.uid() = id)
    ';
    EXECUTE '
      CREATE POLICY users_can_insert_own_profile
      ON public.profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id)
    ';
    EXECUTE '
      CREATE POLICY users_can_update_own_profile
      ON public.profiles
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id)
    ';
  END IF;
END $$;

COMMIT;
