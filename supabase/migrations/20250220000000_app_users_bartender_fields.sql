-- Campi bartender allineati allo schema reale
alter table public.app_users add column if not exists full_name text;
alter table public.app_users add column if not exists video_url text;
-- image_url e home_city già presenti
