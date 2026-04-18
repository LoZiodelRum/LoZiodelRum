-- Policy per permettere l'accesso solo agli utenti autenticati
-- Applica queste policy su tutte le tabelle della chatroom

CREATE POLICY "Solo utenti autenticati"
ON public.baretto_messaggi
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Solo utenti autenticati"
ON public.baretto_presenze
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
