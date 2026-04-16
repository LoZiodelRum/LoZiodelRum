-- Trigger che crea automaticamente un record in "Profili" quando un utente si registra.
-- Questo bypassa il problema RLS: il trigger gira con SECURITY DEFINER (come service role).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."Profili" (id, nome, cognome, username, email, ruolo, status)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nome',
    NEW.raw_user_meta_data->>'cognome',
    NEW.raw_user_meta_data->>'username',
    NEW.email,
    'utente',
    'attivo'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rimuovi il trigger precedente se esiste, poi ricrealo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
