-- Policy: Consenti SELECT a tutti gli utenti autenticati sulla tabella articoli
CREATE POLICY "select_articoli_authenticated"
ON public.articoli
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Abilita Row Level Security se non già attivo
ALTER TABLE public.articoli ENABLE ROW LEVEL SECURITY;

-- Consenti INSERT solo agli admin
CREATE POLICY "insert_articoli_admin"
ON public.articoli
FOR INSERT
USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- Consenti UPDATE solo agli admin
CREATE POLICY "update_articoli_admin"
ON public.articoli
FOR UPDATE
USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- Consenti DELETE solo agli admin
CREATE POLICY "delete_articoli_admin"
ON public.articoli
FOR DELETE
USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');