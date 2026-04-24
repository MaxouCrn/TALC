-- ============================================================================
-- Profile covers : bannière personnalisable par membre.
--   - cover_url : url publique de l'image (Supabase Storage bucket public)
--   - cover_position_y : offset vertical (0-100%) pour object-position lors
--     du rendu. Permet à l'utilisateur de choisir quelle zone est visible
--     quand l'image est recadrée en 6:1.
-- Stockage : bucket public `profile-covers`, une image par user
--   (fichier `{user_id}.webp`, overwrite à chaque upload).
-- ============================================================================

alter table public.profiles
  add column cover_url         text,
  add column cover_position_y  int not null default 50
    check (cover_position_y between 0 and 100);

-- ============================================================================
-- Storage bucket : profile-covers (public read, owner write)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('profile-covers', 'profile-covers', true)
on conflict (id) do nothing;

-- Lecture publique (le bucket est public mais on explicite la policy pour
-- rester coherent avec les autres politiques RLS)
create policy "Anyone can read profile covers"
  on storage.objects for select
  using (bucket_id = 'profile-covers');

-- Upload/update : seul le proprietaire peut ecrire dans son propre dossier
-- (convention : le chemin commence par `{auth.uid()}/...`)
create policy "Users can upload own cover"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own cover"
  on storage.objects for update
  using (
    bucket_id = 'profile-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own cover"
  on storage.objects for delete
  using (
    bucket_id = 'profile-covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
