# Migrations Supabase

Migrations SQL du schema TALC V1. Ordre d'execution :

| # | Fichier                     | Contenu                                                        |
|---|-----------------------------|----------------------------------------------------------------|
| 1 | `0001_init_schema.sql`      | Tables + index + triggers (`updated_at`, auto-profile)          |
| 2 | `0002_rbac_helpers.sql`     | Fonctions SQL RBAC (`has_permission`, `has_role_on_scope`, …)   |
| 3 | `0003_rls_policies.sql`     | Row Level Security sur toutes les tables                        |
| 4 | `0004_seed_roles.sql`       | Seed permissions + 3 rôles système + activité racine            |

## Exécution

### Option A — Supabase CLI (recommandée)

```bash
# 1. Link au projet distant (une seule fois)
supabase link --project-ref gvfrgateiwrvysmsyfzg

# 2. Push les migrations
supabase db push
```

### Option B — Dashboard

1. Dashboard → SQL Editor → New query
2. Copier-coller chaque fichier dans l'ordre numérique
3. Run pour chacun

## Rejouer

Les migrations sont **idempotentes** autant que possible :

- `0001`, `0002`, `0003` : utilisent `create or replace` / pas de `drop` → re-exécution échoue sur les `create table` dupliqués. **Ne pas rejouer** sans reset préalable.
- `0004` (seed) : `on conflict do update/nothing` → rejouable sans casser.

Pour réinitialiser en dev : `supabase db reset` (drop + rejoue tout le répertoire `migrations/`).

## Après push

Générer les types TypeScript côté app :

```bash
supabase gen types typescript --project-id gvfrgateiwrvysmsyfzg \
  > src/lib/supabase/types.ts
```

Assigner le rôle `Superadmin` à un premier compte :

```sql
-- Après s'être inscrit via l'app, remplacer l'email ci-dessous
insert into public.user_role_scopes (user_id, role_id, scope_activity_id)
select u.id, r.id, null
from auth.users u
cross join public.roles r
where u.email = 'maxime.caron@hop3team.com'
  and r.name = 'Superadmin';
```
