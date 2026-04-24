-- ============================================================================
-- TALC V1 — Fonctions helpers RBAC
--
-- Ces fonctions sont utilisees par les RLS policies (migration 0003). Elles
-- acceptent un user_id nullable pour gerer le cas anonyme (visiteur non
-- connecte) : auth.uid() peut retourner NULL, qui equivaut a "aucun role".
-- ============================================================================

-- Retourne TRUE si l'activite `scope_id` est un descendant de `ancestor_id`
-- (ou egal). Utilise un recursive CTE pour remonter les parents.
create or replace function public.is_scope_descendant_of(
  scope_id    uuid,
  ancestor_id uuid
)
returns boolean
language sql
stable
as $$
  with recursive chain as (
    select id, parent_id from public.activities where id = scope_id
    union all
    select a.id, a.parent_id
    from public.activities a
    join chain c on a.id = c.parent_id
  )
  select exists (select 1 from chain where id = ancestor_id);
$$;

-- Retourne TRUE si l'user possede le role nomme `role_name` sur un scope
-- couvrant `scope_id`. Un scope NULL (global) couvre tout. Un scope sur un
-- noeud parent couvre tous ses descendants.
create or replace function public.has_role_on_scope(
  p_user_id   uuid,
  p_role_name text,
  p_scope_id  uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_role_scopes urs
    join public.roles r on r.id = urs.role_id
    where urs.user_id = p_user_id
      and r.name = p_role_name
      and (
        urs.scope_activity_id is null
        or urs.scope_activity_id = p_scope_id
        or public.is_scope_descendant_of(p_scope_id, urs.scope_activity_id)
      )
  );
$$;

-- Retourne TRUE si l'user a une permission `p_permission_code` via un de
-- ses roles, sur un scope couvrant `p_scope_id`. Si `p_scope_id` est NULL,
-- seuls les roles globaux comptent (utile pour permissions admin).
create or replace function public.has_permission(
  p_user_id          uuid,
  p_permission_code  text,
  p_scope_id         uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_role_scopes urs
    join public.role_permissions rp on rp.role_id = urs.role_id
    join public.permissions p on p.id = rp.permission_id
    where urs.user_id = p_user_id
      and p.code = p_permission_code
      and (
        urs.scope_activity_id is null
        or p_scope_id is null
        or urs.scope_activity_id = p_scope_id
        or public.is_scope_descendant_of(p_scope_id, urs.scope_activity_id)
      )
  );
$$;

-- Raccourci : superadmin global ?
create or replace function public.is_superadmin(p_user_id uuid)
returns boolean
language sql
stable
as $$
  select public.has_role_on_scope(p_user_id, 'Superadmin', null);
$$;
