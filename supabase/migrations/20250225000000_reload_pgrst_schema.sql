-- Funzione per forzare il reload dello schema cache di PostgREST.
-- Utile quando si aggiungono nuove colonne e si riceve "Could not find column".
-- Chiamare da client: supabase.rpc('reload_pgrst_schema')
CREATE OR REPLACE FUNCTION public.reload_pgrst_schema()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
END;
$$;

-- Abilita Realtime (postgres_changes) per Locali, reviews_cloud, app_users
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public."Locali";
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews_cloud;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.app_users;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
