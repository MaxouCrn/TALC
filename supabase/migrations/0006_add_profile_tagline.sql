-- ============================================================================
-- Ajoute une colonne tagline (courte phrase d'accroche) a public.profiles.
-- Complement de bio : tagline = 1-2 phrases affichees sous le nom du profil,
-- bio = paragraphe plus long dans le bloc dedie.
-- ============================================================================

alter table public.profiles
  add column tagline text;
