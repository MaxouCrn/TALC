-- ============================================================================
-- TALC — Seed de données de test (dev uniquement, idempotent)
--
-- 6 activités racines + 1 post officiel dans "Actualités officielles" pour
-- voir le flow mock→DB en live sur la home. À retirer ou gate par env var
-- avant la vraie prod.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Activités racines
-- ----------------------------------------------------------------------------
insert into public.activities (slug, name, description, cover_url, sort_order) values
  (
    'danse',
    'Danse',
    'Du premier pas à la grande scène du Gala, quatre groupes d''âge encadrés par Mélanie et Sophie.',
    'https://images.unsplash.com/photo-1547153760-18fc86324498?w=900&q=80',
    1
  ),
  (
    'peinture',
    'Peinture',
    'Atelier libre le jeudi, cours guidé le samedi. Exposition annuelle à la salle des fêtes en mai.',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&q=80',
    2
  ),
  (
    'theatre',
    'Théâtre',
    'Une pièce montée chaque saison. Répétitions le vendredi soir, représentation fin mars au foyer.',
    'https://images.unsplash.com/photo-1503095396549-807759245b35?w=900&q=80',
    3
  ),
  (
    'musique',
    'Musique',
    'Chorale tous les mardis, cours d''instrument individuels sur inscription. Concert d''hiver au mois de décembre.',
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=900&q=80',
    4
  ),
  (
    'ecriture',
    'Écriture',
    'Un samedi par mois, plume à la main. Nouvelle, poésie, fragments : publication annuelle en recueil.',
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&q=80',
    5
  ),
  (
    'jeux-societe',
    'Jeux de société',
    'Rendez-vous hebdomadaire au foyer, de 14h à 18h. Table ouverte aux débutants, initiation sur place.',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80',
    6
  )
on conflict (slug) do update set
  description = excluded.description,
  cover_url = excluded.cover_url,
  sort_order = excluded.sort_order;

-- ----------------------------------------------------------------------------
-- Premier post officiel dans "Actualités officielles"
-- Auteur = superadmin (talc-superadmin@gmail.com). Si l'user n'existe pas
-- encore (migration rejouée sur une base sans seed manuel), le post n'est
-- simplement pas créé.
-- ----------------------------------------------------------------------------
with author as (
  select id from auth.users where email = 'talc-superadmin@gmail.com' limit 1
),
scope as (
  select id from public.activities where slug = 'actualites-officielles' limit 1
),
-- Skip si un post TALC existe déjà sur ce scope (rejeu idempotent simple)
existing as (
  select p.id
  from public.posts p
  join scope s on p.activity_scope_id = s.id
  where p.body like 'Les répétitions du Gala battent leur plein%'
  limit 1
),
inserted_post as (
  insert into public.posts (author_id, activity_scope_id, body, category, status)
  select
    a.id,
    s.id,
    E'Les répétitions du Gala battent leur plein\n\nÀ deux mois du grand soir, les troupes de danse enchaînent les filages. Mélanie, chorégraphe, nous ouvre les coulisses de ces semaines intenses où le TALC donne le meilleur. Rendez-vous le samedi 14 juin à 20h pour assister au spectacle.',
    'Gala de danse',
    'published'
  from author a, scope s
  where not exists (select 1 from existing)
  returning id
)
insert into public.post_media (post_id, url, media_type, sort_order, width, height)
select id, 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1200&q=80', 'photo', 0, 1200, 800
from inserted_post;
