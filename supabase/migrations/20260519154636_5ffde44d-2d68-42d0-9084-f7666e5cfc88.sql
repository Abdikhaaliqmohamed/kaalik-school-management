
drop policy if exists "auth read photos" on storage.objects;
revoke execute on function public.has_role(uuid, public.app_role) from authenticated;
