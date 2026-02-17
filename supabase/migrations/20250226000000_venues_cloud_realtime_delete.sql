-- Realtime per venues_cloud (locali da mobile)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.venues_cloud;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Policy delete per venues_cloud (admin può eliminare)
DROP POLICY IF EXISTS "Allow delete venues_cloud" ON public.venues_cloud;
CREATE POLICY "Allow delete venues_cloud" ON public.venues_cloud FOR DELETE USING (true);
