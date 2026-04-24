-- ============================================================================
-- Profile avatars : bucket Storage pour les photos de profil.
-- La colonne profiles.avatar_url existe deja (migration 0001).
-- Convention : fichier stocke a `{user_id}/avatar.webp`, overwrite.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', true)
on conflict (id) do nothing;

create policy "Anyone can read profile avatars"
  on storage.objects for select
  using (bucket_id = 'profile-avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
