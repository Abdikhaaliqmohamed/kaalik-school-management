
revoke execute on function public.current_student_id() from public, anon, authenticated;
revoke execute on function public.current_parent_id() from public, anon, authenticated;
revoke execute on function public.is_parent_of(uuid) from public, anon, authenticated;
revoke execute on function public.gpa_for_student(uuid) from public, anon;
grant execute on function public.gpa_for_student(uuid) to authenticated;
