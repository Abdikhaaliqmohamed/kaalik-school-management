
-- enum + roles infra
create type public.app_role as enum ('admin','teacher','student','parent');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  photo_url text,
  phone text,
  address text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique(user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.email)
  on conflict (id) do nothing;
  -- default new signups to 'admin' so the demo just works; can be revoked later
  insert into public.user_roles (user_id, role) values (new.id, 'admin')
  on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- domain tables
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);
alter table public.subjects enable row level security;

create table public.teachers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text,
  phone text,
  address text,
  photo_url text,
  subjects text[] not null default '{}',
  created_at timestamptz not null default now()
);
alter table public.teachers enable row level security;

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  capacity int not null default 30,
  grade int not null,
  supervisor_id uuid references public.teachers(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.classes enable row level security;

create table public.parents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text,
  phone text,
  address text,
  created_at timestamptz not null default now()
);
alter table public.parents enable row level security;

create table public.students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text,
  phone text,
  address text,
  grade text,
  class_id uuid references public.classes(id) on delete set null,
  parent_id uuid references public.parents(id) on delete set null,
  photo_url text,
  created_at timestamptz not null default now()
);
alter table public.students enable row level security;

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  date date not null default current_date,
  present boolean not null default true,
  created_at timestamptz not null default now(),
  unique (student_id, date)
);
alter table public.attendance enable row level security;

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  class_id uuid references public.classes(id) on delete set null,
  date date not null default current_date,
  created_at timestamptz not null default now()
);
alter table public.announcements enable row level security;

-- RLS: authenticated can read; admin can write
create policy "auth read profiles" on public.profiles for select to authenticated using (true);
create policy "self update profile" on public.profiles for update to authenticated using (auth.uid()=id);

create policy "auth read roles" on public.user_roles for select to authenticated using (auth.uid()=user_id or public.has_role(auth.uid(),'admin'));
create policy "admin manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- generic read+admin-write for domain tables
do $$
declare t text;
begin
  foreach t in array array['subjects','teachers','classes','parents','students','attendance','announcements'] loop
    execute format('create policy "auth read %1$s" on public.%1$s for select to authenticated using (true)', t);
    execute format('create policy "admin write %1$s" on public.%1$s for all to authenticated using (public.has_role(auth.uid(),''admin'')) with check (public.has_role(auth.uid(),''admin''))', t);
  end loop;
end $$;

-- storage bucket for photos
insert into storage.buckets (id, name, public) values ('photos','photos', true) on conflict (id) do nothing;
create policy "public read photos" on storage.objects for select using (bucket_id='photos');
create policy "auth upload photos" on storage.objects for insert to authenticated with check (bucket_id='photos');
create policy "auth update photos" on storage.objects for update to authenticated using (bucket_id='photos');
create policy "auth delete photos" on storage.objects for delete to authenticated using (bucket_id='photos');
