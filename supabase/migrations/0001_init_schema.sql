-- ============================================================================
-- TALC V1 — Schema initial
-- Ref : docs/superpowers/specs/2026-04-24-talc-v1-design.md §10
-- ============================================================================

-- Extensions (gen_random_uuid disponible par defaut via pgcrypto sur Supabase)
create extension if not exists pgcrypto;

-- ============================================================================
-- profiles : 1-1 avec auth.users, etend avec les infos publiques du membre
-- ============================================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null,
  avatar_url    text,
  bio           text,
  deleted_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index profiles_deleted_at_idx on public.profiles(deleted_at) where deleted_at is null;

-- ============================================================================
-- activities : arbre hierarchique (adjacency list), pivot central du feed
-- Le root "Actualites officielles" est seede en migration 0004
-- ============================================================================
create table public.activities (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  description   text,
  parent_id     uuid references public.activities(id) on delete restrict,
  cover_url     text,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index activities_parent_id_idx on public.activities(parent_id);
create index activities_slug_idx on public.activities(slug);

-- ============================================================================
-- permissions + roles + role_permissions + user_role_scopes : RBAC scope
-- ============================================================================
create table public.permissions (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  description   text not null
);

create table public.roles (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  description   text,
  -- Les roles systeme ne peuvent pas etre supprimes ni renommes par l'UI admin
  is_system     boolean not null default false,
  created_at    timestamptz not null default now()
);

create table public.role_permissions (
  role_id       uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- Assignation : (user, role, scope nullable). scope_activity_id NULL = global.
-- Un meme user peut avoir le meme role sur plusieurs scopes, d'ou la PK composite.
create table public.user_role_scopes (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  role_id            uuid not null references public.roles(id) on delete cascade,
  scope_activity_id  uuid references public.activities(id) on delete cascade,
  granted_at         timestamptz not null default now(),
  granted_by         uuid references auth.users(id) on delete set null,
  unique (user_id, role_id, scope_activity_id)
);

create index user_role_scopes_user_id_idx on public.user_role_scopes(user_id);
create index user_role_scopes_scope_idx on public.user_role_scopes(scope_activity_id);

-- ============================================================================
-- posts : feed communautaire
-- ============================================================================
create table public.posts (
  id                   uuid primary key default gen_random_uuid(),
  author_id            uuid not null references auth.users(id) on delete cascade,
  activity_scope_id    uuid not null references public.activities(id) on delete restrict,
  body                 text not null default '',
  -- Tag optionnel pour typer l'actualite : 'evenement', 'exposition', 'bilan', ...
  category             text,
  -- 'published' | 'deleted_by_admin' | 'deleted_by_author'
  status               text not null default 'published' check (status in ('published', 'deleted_by_admin', 'deleted_by_author')),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index posts_activity_scope_idx on public.posts(activity_scope_id);
create index posts_author_idx on public.posts(author_id);
create index posts_created_at_idx on public.posts(created_at desc);
create index posts_status_idx on public.posts(status) where status = 'published';

-- ============================================================================
-- post_media : photos + 1 video max par post (regle V1 applicative)
-- ============================================================================
create table public.post_media (
  id            uuid primary key default gen_random_uuid(),
  post_id       uuid not null references public.posts(id) on delete cascade,
  url           text not null,
  media_type    text not null check (media_type in ('photo', 'video')),
  sort_order    integer not null default 0,
  width         integer,
  height        integer,
  duration_s    integer,  -- NULL pour les photos
  created_at    timestamptz not null default now()
);

create index post_media_post_id_idx on public.post_media(post_id, sort_order);

-- ============================================================================
-- comments : plats (pas de threading V1)
-- ============================================================================
create table public.comments (
  id            uuid primary key default gen_random_uuid(),
  post_id       uuid not null references public.posts(id) on delete cascade,
  author_id     uuid not null references auth.users(id) on delete cascade,
  body          text not null check (length(body) between 1 and 2000),
  status        text not null default 'published' check (status in ('published', 'deleted')),
  created_at    timestamptz not null default now()
);

create index comments_post_id_idx on public.comments(post_id, created_at);

-- ============================================================================
-- reactions : un seul type ♥ en V1, PK composite
-- ============================================================================
create table public.reactions (
  user_id       uuid not null references auth.users(id) on delete cascade,
  post_id       uuid not null references public.posts(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index reactions_post_id_idx on public.reactions(post_id);

-- ============================================================================
-- reports : signalements posts/commentaires
-- ============================================================================
create table public.reports (
  id            uuid primary key default gen_random_uuid(),
  target_type   text not null check (target_type in ('post', 'comment')),
  target_id     uuid not null,
  reporter_id   uuid not null references auth.users(id) on delete cascade,
  reason        text not null check (length(reason) between 1 and 1000),
  status        text not null default 'pending' check (status in ('pending', 'resolved_kept', 'resolved_removed')),
  resolved_by   uuid references auth.users(id) on delete set null,
  resolved_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index reports_status_idx on public.reports(status) where status = 'pending';
create index reports_target_idx on public.reports(target_type, target_id);

-- ============================================================================
-- cms_pages : pages statiques editables par le superadmin
-- ============================================================================
create table public.cms_pages (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  -- Contenu riche en TipTap JSON ou Markdown, a decider cote UI editeur
  body_rich     jsonb not null default '{}'::jsonb,
  updated_by    uuid references auth.users(id) on delete set null,
  updated_at    timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

-- ============================================================================
-- Triggers updated_at
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at    before update on public.profiles    for each row execute function public.set_updated_at();
create trigger activities_set_updated_at  before update on public.activities  for each row execute function public.set_updated_at();
create trigger posts_set_updated_at       before update on public.posts       for each row execute function public.set_updated_at();
create trigger cms_pages_set_updated_at   before update on public.cms_pages   for each row execute function public.set_updated_at();

-- ============================================================================
-- Trigger auto-profile a la creation d'un auth.users
-- display_name pris depuis raw_user_meta_data.display_name ou fallback sur
-- la partie locale de l'email.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
