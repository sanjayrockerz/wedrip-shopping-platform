insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;
drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images" on storage.objects for select to anon, authenticated using (bucket_id = 'product-images');
drop policy if exists "Catalog staff upload product images" on storage.objects;
create policy "Catalog staff upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.user_can_manage_catalog());
drop policy if exists "Catalog staff update product images" on storage.objects;
create policy "Catalog staff update product images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.user_can_manage_catalog()) with check (bucket_id = 'product-images' and public.user_can_manage_catalog());
drop policy if exists "Catalog staff delete product images" on storage.objects;
create policy "Catalog staff delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.user_can_manage_catalog());
