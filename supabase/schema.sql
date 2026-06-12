-- ==========================================
-- Lucuma — Schema
-- Correr en el SQL Editor de Supabase
-- ==========================================

-- Tabla de perfiles (extiende auth.users)
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  username    text unique not null,
  avatar_url  text,
  bio         text,
  created_at  timestamp with time zone default now() not null
);

-- Tabla de posts (publicaciones y respuestas)
-- user_id referencia profiles(id) — y profiles.id referencia auth.users(id) —
-- para que PostgREST pueda embeber el perfil en cada post (select *, profiles(*))
create table if not exists public.posts (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  content     text not null check (char_length(content) between 1 and 280),
  parent_id   uuid references public.posts(id) on delete cascade,
  created_at  timestamp with time zone default now() not null
);

-- Índices para performance
create index if not exists posts_user_id_idx     on public.posts(user_id);
create index if not exists posts_parent_id_idx   on public.posts(parent_id);
create index if not exists posts_created_at_idx  on public.posts(created_at desc);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.posts     enable row level security;

-- Profiles: todos pueden leer, solo el dueño puede escribir
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Posts: todos pueden leer, solo el dueño puede crear/eliminar
create policy "posts_select" on public.posts for select using (true);
create policy "posts_insert" on public.posts for insert with check (auth.uid() = user_id);
create policy "posts_delete" on public.posts for delete using (auth.uid() = user_id);

-- Trigger: crea el perfil automáticamente cuando el usuario se registra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
