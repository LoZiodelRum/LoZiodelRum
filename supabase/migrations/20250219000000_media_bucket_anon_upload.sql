-- Policy per upload anonimo nel bucket 'media' (senza login)
-- PREREQUISITO: Crea il bucket dalla Dashboard Supabase: Storage > New bucket > "media" > Public

drop policy if exists "Allow anonymous uploads to media" on storage.objects;
create policy "Allow anonymous uploads to media"
on storage.objects for insert to anon
with check (bucket_id = 'media');

drop policy if exists "Allow public read media" on storage.objects;
create policy "Allow public read media"
on storage.objects for select to public
using (bucket_id = 'media');
