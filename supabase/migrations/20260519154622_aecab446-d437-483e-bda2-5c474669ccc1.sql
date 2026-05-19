
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
-- restrict bucket listing
drop policy if exists "public read photos" on storage.objects;
create policy "auth read photos" on storage.objects for select to authenticated using (bucket_id='photos');
