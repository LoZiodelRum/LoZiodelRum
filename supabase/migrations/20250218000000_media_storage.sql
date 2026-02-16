-- Bucket 'media' per immagini e video (Proprietario, Bartender, User, Locali)
-- Esegui nel SQL Editor di Supabase, poi crea il bucket dalla Dashboard: Storage > New bucket > "media" > Public

-- Colonna image_url per profili Proprietario e User (bartender usa già photo)
alter table public.app_users add column if not exists image_url text;

-- Colonna video_url per locali (video brevi max 10MB)
alter table public.venues_cloud add column if not exists video_url text;
