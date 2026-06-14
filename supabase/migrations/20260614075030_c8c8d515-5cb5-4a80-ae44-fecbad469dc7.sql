
-- 1. Fix auto-admin signup → default new users to 'student'
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.email)
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'student')
  on conflict do nothing;
  return new;
end $$;

-- 2. Helper functions for RLS
create or replace function public.current_student_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.students where profile_id = auth.uid() limit 1
$$;

create or replace function public.current_parent_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.parents where profile_id = auth.uid() limit 1
$$;

create or replace function public.is_parent_of(_student_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.students s
    join public.parents p on p.id = s.parent_id
    where s.id = _student_id and p.profile_id = auth.uid()
  )
$$;

-- 3. Attendance: add status column
alter table public.attendance add column if not exists status text not null default 'present'
  check (status in ('present','absent','late'));
alter table public.attendance add column if not exists class_id uuid references public.classes(id) on delete set null;
create index if not exists attendance_student_date_idx on public.attendance(student_id, date);

-- 4. Tighten attendance RLS
drop policy if exists "auth read attendance" on public.attendance;
drop policy if exists "admin write attendance" on public.attendance;

create policy "attendance read scoped" on public.attendance for select
  using (
    has_role(auth.uid(),'admin') or
    has_role(auth.uid(),'teacher') or
    student_id = public.current_student_id() or
    public.is_parent_of(student_id)
  );
create policy "attendance write staff" on public.attendance for all
  using (has_role(auth.uid(),'admin') or has_role(auth.uid(),'teacher'))
  with check (has_role(auth.uid(),'admin') or has_role(auth.uid(),'teacher'));

-- 5. Exams table
create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject_id uuid references public.subjects(id) on delete set null,
  class_id uuid references public.classes(id) on delete cascade,
  exam_date date not null default current_date,
  max_marks numeric not null default 100,
  term text not null default 'Term 1',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.exams to authenticated;
grant all on public.exams to service_role;
alter table public.exams enable row level security;
create policy "exams read all auth" on public.exams for select using (auth.uid() is not null);
create policy "exams write staff" on public.exams for all
  using (has_role(auth.uid(),'admin') or has_role(auth.uid(),'teacher'))
  with check (has_role(auth.uid(),'admin') or has_role(auth.uid(),'teacher'));

-- 6. Results table
create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  marks numeric not null check (marks >= 0),
  comment text,
  created_at timestamptz not null default now(),
  unique(exam_id, student_id)
);
grant select, insert, update, delete on public.results to authenticated;
grant all on public.results to service_role;
alter table public.results enable row level security;
create index if not exists results_student_idx on public.results(student_id);
create index if not exists results_exam_idx on public.results(exam_id);

create policy "results read scoped" on public.results for select
  using (
    has_role(auth.uid(),'admin') or
    has_role(auth.uid(),'teacher') or
    student_id = public.current_student_id() or
    public.is_parent_of(student_id)
  );
create policy "results write staff" on public.results for all
  using (has_role(auth.uid(),'admin') or has_role(auth.uid(),'teacher'))
  with check (has_role(auth.uid(),'admin') or has_role(auth.uid(),'teacher'));

-- 7. Tighten students read so non-staff users only see allowed rows
drop policy if exists "auth read students" on public.students;
create policy "students read scoped" on public.students for select
  using (
    has_role(auth.uid(),'admin') or
    has_role(auth.uid(),'teacher') or
    profile_id = auth.uid() or
    parent_id = public.current_parent_id()
  );

-- 8. GPA helper (4.0 scale based on percentage)
create or replace function public.gpa_for_student(_student_id uuid)
returns numeric language sql stable security definer set search_path = public as $$
  with pct as (
    select (r.marks / nullif(e.max_marks,0)) * 100 as p
    from public.results r join public.exams e on e.id = r.exam_id
    where r.student_id = _student_id
  ),
  pts as (
    select case
      when p >= 90 then 4.0
      when p >= 80 then 3.5
      when p >= 70 then 3.0
      when p >= 60 then 2.5
      when p >= 50 then 2.0
      when p >= 40 then 1.5
      else 0.0
    end as g from pct
  )
  select coalesce(round(avg(g)::numeric, 2), 0) from pts
$$;
