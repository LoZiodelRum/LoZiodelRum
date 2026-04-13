-- Permetti a chiunque (utenti anonimi e autenticati) di inserire recensioni
CREATE POLICY "Allow public insert on Recensioni"
ON public."Recensioni"
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
