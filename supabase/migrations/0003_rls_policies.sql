-- ============================================================================
-- TALC V1 — Row Level Security policies
--
-- Principes :
-- - Lecture publique sur toutes les donnees affichees sur le site vitrine
--   (profils, activites, posts, commentaires, reactions, cms_pages).
-- - Ecritures gatees par has_permission() / has_role_on_scope() / ownership.
-- - Les tables RBAC elles-memes (roles, permissions, user_role_scopes) ne
--   sont lisibles que par les superadmins ; anon et membres n'en ont pas
--   besoin car les helpers SQL sont SECURITY DEFINER.
-- ============================================================================

-- Active RLS sur toutes les tables
alter table public.profiles          enable row level security;
alter table public.activities        enable row level security;
alter table public.permissions       enable row level security;
alter table public.roles             enable row level security;
alter table public.role_permissions  enable row level security;
alter table public.user_role_scopes  enable row level security;
alter table public.posts             enable row level security;
alter table public.post_media        enable row level security;
alter table public.comments          enable row level security;
alter table public.reactions         enable row level security;
alter table public.reports           enable row level security;
alter table public.cms_pages         enable row level security;

-- ============================================================================
-- profiles
-- ============================================================================
-- Lecture publique des profils non-supprimes
create policy "profiles_read" on public.profiles
  for select using (deleted_at is null);

-- Un user peut editer son propre profil
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

-- Insert gere par le trigger handle_new_user (SECURITY DEFINER), pas besoin
-- de policy pour les users.

-- Superadmin peut tout faire
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_superadmin(auth.uid()))
  with check (public.is_superadmin(auth.uid()));

-- ============================================================================
-- activities
-- ============================================================================
create policy "activities_read" on public.activities
  for select using (true);

create policy "activities_admin_all" on public.activities
  for all using (public.is_superadmin(auth.uid()))
  with check (public.is_superadmin(auth.uid()));

-- ============================================================================
-- permissions / roles / role_permissions : tables de config RBAC
-- Lisibles/ecrivables uniquement par superadmin
-- ============================================================================
create policy "permissions_superadmin" on public.permissions
  for all using (public.is_superadmin(auth.uid()));

create policy "roles_superadmin" on public.roles
  for all using (public.is_superadmin(auth.uid()));

create policy "role_permissions_superadmin" on public.role_permissions
  for all using (public.is_superadmin(auth.uid()));

-- ============================================================================
-- user_role_scopes : assignations
-- ============================================================================
-- Un user peut voir ses propres assignations (utile cote UI pour afficher
-- les badges)
create policy "urs_read_own" on public.user_role_scopes
  for select using (user_id = auth.uid());

-- Superadmin voit tout et peut tout modifier
create policy "urs_superadmin" on public.user_role_scopes
  for all using (public.is_superadmin(auth.uid()))
  with check (public.is_superadmin(auth.uid()));

-- ============================================================================
-- posts
-- ============================================================================
-- Lecture publique des posts publies
create policy "posts_read_published" on public.posts
  for select using (status = 'published');

-- Superadmin voit tout (y compris deleted_by_admin, pour restauration)
create policy "posts_read_admin" on public.posts
  for select using (public.is_superadmin(auth.uid()));

-- L'auteur voit ses propres posts meme deleted (pour historique)
create policy "posts_read_own" on public.posts
  for select using (author_id = auth.uid());

-- Creation : l'user doit avoir post.create sur le scope
create policy "posts_insert" on public.posts
  for insert with check (
    author_id = auth.uid()
    and public.has_permission(auth.uid(), 'post.create', activity_scope_id)
  );

-- Edition : auteur OU moderateur couvrant le scope OU superadmin
create policy "posts_update" on public.posts
  for update using (
    author_id = auth.uid()
    or public.has_permission(auth.uid(), 'post.moderate', activity_scope_id)
    or public.is_superadmin(auth.uid())
  )
  with check (
    author_id = auth.uid()
    or public.has_permission(auth.uid(), 'post.moderate', activity_scope_id)
    or public.is_superadmin(auth.uid())
  );

-- Suppression dure (soft delete via status est plus courant, mais on garde
-- la possibilite pour le superadmin de purger)
create policy "posts_delete" on public.posts
  for delete using (public.is_superadmin(auth.uid()));

-- ============================================================================
-- post_media
-- ============================================================================
-- Lecture liee a la lisibilite du post parent
create policy "post_media_read" on public.post_media
  for select using (
    exists (
      select 1 from public.posts p
      where p.id = post_media.post_id
        and (
          p.status = 'published'
          or p.author_id = auth.uid()
          or public.is_superadmin(auth.uid())
        )
    )
  );

-- Ecriture par l'auteur du post (pendant la creation du post) ou moderateur
create policy "post_media_write" on public.post_media
  for all using (
    exists (
      select 1 from public.posts p
      where p.id = post_media.post_id
        and (
          p.author_id = auth.uid()
          or public.has_permission(auth.uid(), 'post.moderate', p.activity_scope_id)
          or public.is_superadmin(auth.uid())
        )
    )
  )
  with check (
    exists (
      select 1 from public.posts p
      where p.id = post_media.post_id
        and (
          p.author_id = auth.uid()
          or public.has_permission(auth.uid(), 'post.moderate', p.activity_scope_id)
          or public.is_superadmin(auth.uid())
        )
    )
  );

-- ============================================================================
-- comments
-- ============================================================================
create policy "comments_read_published" on public.comments
  for select using (status = 'published');

create policy "comments_read_own" on public.comments
  for select using (author_id = auth.uid());

-- Tout user connecte peut commenter (pas de permission specifique V1,
-- "membre du site" suffit)
create policy "comments_insert" on public.comments
  for insert with check (
    author_id = auth.uid()
    and auth.uid() is not null
  );

-- Update : auteur seulement (suppression logique via status = 'deleted')
create policy "comments_update_own" on public.comments
  for update using (author_id = auth.uid())
  with check (author_id = auth.uid());

-- Delete : auteur OU moderateur du scope du post parent OU superadmin
create policy "comments_delete" on public.comments
  for delete using (
    author_id = auth.uid()
    or exists (
      select 1 from public.posts p
      where p.id = comments.post_id
        and public.has_permission(auth.uid(), 'post.moderate', p.activity_scope_id)
    )
    or public.is_superadmin(auth.uid())
  );

-- ============================================================================
-- reactions
-- ============================================================================
create policy "reactions_read" on public.reactions
  for select using (true);

create policy "reactions_insert_own" on public.reactions
  for insert with check (user_id = auth.uid());

create policy "reactions_delete_own" on public.reactions
  for delete using (user_id = auth.uid());

-- ============================================================================
-- reports
-- ============================================================================
-- Tout user connecte peut signaler
create policy "reports_insert" on public.reports
  for insert with check (
    reporter_id = auth.uid()
    and auth.uid() is not null
  );

-- Le reporter voit ses propres signalements
create policy "reports_read_own" on public.reports
  for select using (reporter_id = auth.uid());

-- Superadmin voit tout, peut resoudre
create policy "reports_admin_all" on public.reports
  for all using (public.is_superadmin(auth.uid()))
  with check (public.is_superadmin(auth.uid()));

-- NOTE: les admins d'activite voient les signalements sur le scope couvert.
-- Cette policy est plus complexe (jointure sur posts/comments + scope), a
-- affiner quand on implementera /admin/signalements. Pour l'instant seul
-- le superadmin traite les signalements.

-- ============================================================================
-- cms_pages
-- ============================================================================
create policy "cms_pages_read" on public.cms_pages
  for select using (true);

create policy "cms_pages_admin" on public.cms_pages
  for all using (public.is_superadmin(auth.uid()))
  with check (public.is_superadmin(auth.uid()));
