-- ============================================================================
-- TALC V1 — Seed permissions + roles systeme + activite racine
-- Idempotent : on upsert sur les codes/names pour pouvoir rejouer sans casser.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Permissions atomiques
-- ----------------------------------------------------------------------------
insert into public.permissions (code, description) values
  ('post.create',        'Creer un post dans le scope'),
  ('post.moderate',      'Editer ou supprimer les posts d''autrui sur le scope'),
  ('post.delete_any',    'Supprimer n''importe quel post (reserve superadmin)'),
  ('comment.moderate',   'Supprimer les commentaires sur le scope'),
  ('report.handle',      'Traiter les signalements du scope'),
  ('activity.manage',    'Gerer l''arborescence des activites (reserve superadmin)'),
  ('role.manage',        'Gerer les roles et assignations (reserve superadmin)'),
  ('cms.edit',           'Editer les pages CMS vitrine (reserve superadmin)'),
  ('user.manage',        'Gerer les utilisateurs (ban, restore, voir donnees) (reserve superadmin)')
on conflict (code) do update set description = excluded.description;

-- ----------------------------------------------------------------------------
-- Roles systeme
-- ----------------------------------------------------------------------------
insert into public.roles (name, description, is_system) values
  ('Superadmin', 'Pouvoir total, global uniquement',                        true),
  ('Admin',      'Admin d''une activite scopee : publication + moderation', true),
  ('Adherent',   'Membre officiellement adherent a l''association (role identitaire V1)', true)
on conflict (name) do update set description = excluded.description, is_system = true;

-- ----------------------------------------------------------------------------
-- Role_permissions : liaison
-- ----------------------------------------------------------------------------
-- Superadmin = toutes les permissions
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'Superadmin'
on conflict do nothing;

-- Admin scope = post.create + post.moderate + comment.moderate + report.handle
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in ('post.create', 'post.moderate', 'comment.moderate', 'report.handle')
where r.name = 'Admin'
on conflict do nothing;

-- Adherent V1 : aucune permission technique (role purement identitaire)

-- ----------------------------------------------------------------------------
-- Activite racine "Actualites officielles"
-- Alimentee par le superadmin, consommee par la home (bloc actualites)
-- ----------------------------------------------------------------------------
insert into public.activities (slug, name, description, sort_order)
values (
  'actualites-officielles',
  'Actualités officielles',
  'Posts officiels du bureau TALC : communiqués, bilans, annonces.',
  -1  -- sort_order negatif pour la placer en tete
)
on conflict (slug) do nothing;
