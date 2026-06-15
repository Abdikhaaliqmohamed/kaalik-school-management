
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.current_student_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_parent_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_parent_of(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gpa_for_student(uuid) TO authenticated;
