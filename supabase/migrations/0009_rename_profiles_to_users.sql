-- ============================================================================
-- Rename public.profiles -> public.users + refactor naming.
--
-- Changements :
--   - Table renommee : profiles -> users
--   - Ajout first_name + last_name (not null)
--   - Backfill first_name/last_name depuis display_name (split sur premier espace)
--   - Drop colonne display_name
--   - Trigger handle_new_user adapte pour lire first_name/last_name du metadata
--   - RLS policies renommees
-- ============================================================================

-- 1. Rename table
alter table public.profiles rename to users;

-- 2. Rename index + trigger qui referencaient profiles
alter index public.profiles_deleted_at_idx rename to users_deleted_at_idx;
alter trigger profiles_set_updated_at on public.users rename to users_set_updated_at;

-- 3. Ajoute les colonnes nullable pour backfill
alter table public.users
  add column first_name  text,
  add column last_name   text;

-- 4. Backfill : split display_name sur premier espace
update public.users
set
  first_name = coalesce(nullif(split_part(display_name, ' ', 1), ''), display_name),
  last_name  = coalesce(
    nullif(trim(substring(display_name from position(' ' in display_name) + 1)), ''),
    ''
  );

-- 5. Contraintes not null
alter table public.users
  alter column first_name set not null,
  alter column last_name  set not null;

-- 6. Drop display_name
alter table public.users drop column display_name;

-- 7. Recree le trigger handle_new_user (auto-insert a la creation d'auth.users)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, first_name, last_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'first_name',
      split_part(coalesce(new.raw_user_meta_data->>'display_name', new.email), ' ', 1),
      'Membre'
    ),
    coalesce(
      new.raw_user_meta_data->>'last_name',
      trim(substring(
        coalesce(new.raw_user_meta_data->>'display_name', '') from
        position(' ' in coalesce(new.raw_user_meta_data->>'display_name', '')) + 1
      )),
      ''
    )
  );
  return new;
end;
$$;

-- 8. RLS : drop + recreate policies (elles portaient sur public.profiles)
drop policy if exists "profiles_read"       on public.users;
drop policy if exists "profiles_update_own" on public.users;
drop policy if exists "profiles_admin_all"  on public.users;

create policy "users_read" on public.users
  for select using (deleted_at is null);

create policy "users_update_own" on public.users
  for update using (id = auth.uid())
  with check (id = auth.uid());

create policy "users_admin_all" on public.users
  for all using (public.is_superadmin(auth.uid()))
  with check (public.is_superadmin(auth.uid()));

-- 9. Backfill specifique : Superadmin TALC -> Maxime Caron
update public.users u
set first_name = 'Maxime', last_name = 'Caron'
from auth.users a
where u.id = a.id
  and a.email ilike 'talc-superadmin%';
