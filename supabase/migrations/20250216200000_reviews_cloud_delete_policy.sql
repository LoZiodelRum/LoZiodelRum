-- Policy per delete su reviews_cloud
drop policy if exists "Allow delete reviews_cloud" on public.reviews_cloud;
create policy "Allow delete reviews_cloud" on public.reviews_cloud for delete using (true);
