# TALC V1 — Spec de conception

**Date** : 2026-04-24
**Auteur** : Maxime Caron
**Statut** : Draft

## 1. Contexte

Le TALC (Tatinghem Association Loisirs Culture) est une association proposant plusieurs activités (danse, peinture, etc.). Son site actuel (`le-talc.fr`) est un site statique des années 2000, non responsive, sans interactivité.

Ce projet est une refonte complète bénévole (indépendante de l'association à ce stade) visant à :
- Moderniser la vitrine du club.
- Introduire un aspect communautaire (feed média par activité, style Instagram) pour que les familles des adhérents suivent les activités et conservent des souvenirs.
- Poser des fondations techniques saines pour des évolutions futures (billetterie en ligne, abonnement de soutien).

Le projet existant dans le dépôt (React + Vite + Django) sera remplacé par une nouvelle stack décrite ci-dessous.

## 2. Objectifs V1

La V1 se concentre sur **deux piliers** :

- **Pilier A — Vitrine moderne + auth** : remplacer `le-talc.fr` par une vitrine responsive moderne avec gestion de comptes.
- **Pilier C — Feed média communautaire** : flux photos/vidéos par activité, consultable par tous, interactif pour les membres inscrits.

La billetterie en ligne et l'abonnement de soutien sont **explicitement hors périmètre V1** (voir §13).

### Critères de succès V1

- Un visiteur anonyme consulte les pages vitrine et le feed en lecture seule.
- Un utilisateur crée un compte en < 1 min, commente et réagit à un post.
- Un admin d'activité poste un contenu photo+vidéo sur le feed de son activité en < 2 min.
- Un superadmin crée un rôle personnalisé et l'attribue à un membre sur un scope d'activité.
- Le site est responsive (mobile, tablette, desktop).
- Le coût d'infrastructure est de 0 € en phase de démarrage (Supabase Free + Cloudflare Pages).

## 3. Personas et niveaux d'accès

| Persona | Description | Permissions |
|---|---|---|
| **Visiteur** | Non connecté | Lecture pages vitrine + feed. Pas d'interaction. |
| **Membre du site** | Compte gratuit, sans rôle | Lecture + commentaire + réaction ❤️. Signalement de contenu. |
| **Adhérent** | Membre avec rôle `Adhérent` (attribué manuellement par admin après cotisation IRL) | Identique à Membre côté permissions V1. Distinction purement identitaire (badge, appartenance réelle à l'asso). |
| **Admin d'activité** | Membre avec rôle `Admin` scopé sur un nœud d'activité | Créer / modifier / supprimer ses propres posts dans son scope. Supprimer posts et commentaires d'autrui dans son scope. Traiter les signalements de son scope. |
| **Superadmin** | Pouvoir total | Créer des rôles personnalisés, assigner rôles + scopes, éditer pages CMS, modérer partout, gérer la hiérarchie d'activités. |

**Futur V2** : rôle `Supporter` attribué automatiquement via Stripe aux comptes ayant souscrit un abonnement mensuel de soutien à l'association.

## 4. Modèle de rôles et scopes (RBAC)

### Principe

Un droit effectif = `(utilisateur, rôle, scope)`. Le scope est soit un nœud de la hiérarchie d'activités, soit `*` (global).

- **Permissions** : capacités atomiques (ex: `post.create`, `post.edit_own`, `post.delete_any`, `comment.create`, `reaction.create`, `report.handle`).
- **Rôle** : nom + ensemble de permissions. Créé par superadmin.
- **Assignation** : triplet `(user_id, role_id, scope_activity_id NULLABLE)`. `NULL` = global.
- **Héritage hiérarchique** : une assignation sur un nœud parent couvre tous ses descendants.

### Exemples concrets

- Ta femme : `(femme, Membre, NULL)` + `(femme, Adhérent, NULL)` — aucun pouvoir de publication.
- Mélanie (prof danse 18-25) : `(melanie, Admin, danse-18-25)` + `(melanie, Adhérent, NULL)`. Mélanie peut publier dans `danse-18-25`. Elle ne peut **pas** publier dans `peinture`.
- Prof de danse (toutes tranches) : `(prof, Admin, danse)` → couvre `danse-18-25`, `danse-ados`, `danse-enfants`.
- Superadmin : `(maxime, Superadmin, NULL)`.

### Rôles système (seedés à l'init)

- `Superadmin` : toutes permissions, global uniquement.
- `Admin` : permissions de modération et publication, scopé.
- `Adhérent` : identitaire, pas de permission technique supplémentaire en V1.
- `Membre` : implicite pour tout compte, pas d'entrée dédiée en base (toute authentification = membre).

Les rôles personnalisés au-delà de ces quatre peuvent être créés par le superadmin plus tard, mais ne sont pas nécessaires au bon fonctionnement de la V1.

## 5. Hiérarchie des activités

Modèle : arbre adjacency list (`parent_id`), deux niveaux suffisent en V1 mais le schéma supporte N niveaux.

```
Sections
├─ Actualités officielles         # nœud racine dédié, alimenté par superadmin, utilisé par /
├─ Danse
│  ├─ Danse 18-25
│  ├─ Danse ados
│  └─ Danse enfants
├─ Peinture
│  ├─ Peinture adultes
│  └─ Peinture enfants
└─ Théâtre
```

Chaque nœud a : `id`, `slug`, `name`, `description`, `parent_id`, `cover_image_url`, `created_at`. Gestion via interface superadmin.

## 6. Architecture des pages

### Pages publiques (CMS statique, éditable par superadmin)

- `/` — Accueil : hero TALC + bloc "Dernières actualités" (N derniers posts du scope `Actualités officielles`, qui est un nœud racine dédié de la hiérarchie d'activités, réservé aux posts du superadmin) + liens vers activités.
- `/histoire` — Histoire du club.
- `/activites` — Liste des activités proposées (tirée de la hiérarchie).
- `/activites/:slug` — Page d'une activité : description + feed de cette activité (posts descendants inclus).
- `/contact` — Coordonnées, formulaire de contact (envoi email simple).
- `/mentions-legales`, `/charte`, `/rgpd` — Obligations légales + charte photo mineurs.
- `/actualites` — Liste complète des posts `Actualités officielles`.

### Pages communautaires

- `/feed` — Feed communautaire global, tous scopes confondus (filtrable par activité).
- `/posts/:id` — Vue détaillée d'un post + commentaires.

### Pages compte

- `/inscription`, `/connexion`, `/mot-de-passe-oublie`, `/reinitialiser-mdp`
- `/profil` — Édition profil (nom, avatar, email, mot de passe).

### Back-office

- `/admin` — Dashboard (stats simples, signalements à traiter).
- `/admin/pages` — Édition pages CMS (superadmin).
- `/admin/activites` — Gestion hiérarchie (superadmin).
- `/admin/roles` — Création/édition rôles (superadmin).
- `/admin/utilisateurs` — Liste membres, assignation rôles + scopes (superadmin).
- `/admin/signalements` — Queue de modération (superadmin et admins scopés).

## 7. Feed : modèle de contenu

### Post

- `id`, `author_id`, `activity_scope_id` (obligatoire, = nœud où le post apparaît), `body` (texte markdown léger), `created_at`, `updated_at`, `status` (`published`, `deleted_by_admin`, `reported`).
- **Médias attachés** : jusqu'à **10** par post, via table `post_media` (`post_id`, `url`, `type` `photo|video`, `order`, `width`, `height`, `duration_s`).
- **Règles médias V1** :
  - Photos : jusqu'à 10 par post, JPEG/PNG/WebP, **5 MB max** chacune après compression client.
  - Vidéo : **1 max par post**, MP4, **50 MB max**, **60 s max**, compression client avant upload (via `MediaRecorder` ou `ffmpeg.wasm` selon faisabilité).
  - Upload vers **Supabase Storage**, bucket `post-media`, URL publique signée.

### Commentaire

- Plat (pas de threading). `id`, `post_id`, `author_id`, `body` (texte plain, markdown basique désactivé V1), `created_at`, `status` (`published`, `deleted`).
- Pas d'édition de commentaire en V1 (supprimer + repost si besoin).

### Réaction

- Un seul type : `❤️`. Table `reactions` : `(user_id, post_id)` unique. Toggle on/off.

### Publication

- Contrainte SQL / RLS : un utilisateur peut créer un post sur `activity_scope_id = X` uniquement s'il a une assignation `(user, Admin, scope)` où `scope` ∈ ancêtres de X ∪ {X}, ou bien `(user, Superadmin, NULL)`.
- Modification/suppression : auteur lui-même, ou admin couvrant le scope, ou superadmin.

## 8. Modération et signalement

### Workflow

- Tout membre connecté voit un bouton "Signaler" sur chaque post et commentaire.
- Signalement crée `reports(id, target_type, target_id, reporter_id, reason_text, status, created_at, resolved_by, resolved_at)`.
- Statuts : `pending`, `resolved_kept`, `resolved_removed`.
- File de traitement visible dans `/admin/signalements`, filtrée par scope pour les admins d'activité (seulement signalements liés à leur scope), totale pour le superadmin.
- Action de l'admin : soit ignorer (`resolved_kept`), soit masquer le contenu (`resolved_removed` + passage du post/commentaire en `deleted`).

### Charte photo mineurs (§ externe)

Page `/charte` écrite en dur, stipulant :
- Interdiction de publier photos de mineurs identifiables sans consentement parental écrit (formulaire papier hors produit).
- Admin d'activité s'engage à vérifier avant publication.
- Signalement rapide → masquage immédiat + contact parent.

Pas de workflow consentement intégré au produit en V1 (reporté en V2).

## 9. Stack technique

### Frontend

- **Next.js 15+** avec **App Router** et React Server Components.
- **TypeScript** strict.
- **Tailwind CSS** + **shadcn/ui** (composants copiés dans `src/components/ui`).
- **react-hook-form** + **zod** pour formulaires et validation.
- **TipTap** (ou Lexical, à arbitrer au moment du dev) pour édition riche CMS et posts.
- Éventuellement **ffmpeg.wasm** pour compression vidéo côté client (à évaluer selon poids du bundle).

### Backend / données

- **Supabase** (plan Free au démarrage) :
  - **Postgres** : schéma applicatif.
  - **Auth** : email + password, reset par lien email. OAuth (Google) envisageable V1.5.
  - **Storage** : bucket `post-media` pour photos/vidéos utilisateurs, bucket `cms-media` pour pages vitrine.
  - **Realtime** : commentaires et réactions en direct sur les pages post.
- **RLS (Row Level Security)** : permissions appliquées directement au niveau Postgres. Fonctions SQL helpers : `has_permission(user_id, permission, scope_id)`, `has_role_on_scope(user_id, role, scope_id)`.
- Pas de backend custom Node/Django. Tout ce qui ne tient pas en RLS passe par des **Supabase Edge Functions** (Deno) pour logique serveur ponctuelle (ex: envoi email contact, traitement upload).

### Hébergement

- **Cloudflare Pages** via `@cloudflare/next-on-pages`. Bande passante illimitée, pas de restriction d'usage, gratuit.
- Domaine : à définir (`le-talc.fr` récupéré à terme, ou sous-domaine staging en attendant).

### Observabilité

- V1 minimal : logs Supabase + logs Cloudflare. Pas de Sentry/PostHog V1, ajouté si besoin apparaît.

## 10. Schéma de base de données (ébauche)

Tables principales (détails à affiner pendant l'implémentation) :

```
profiles            (id uuid PK = auth.users.id, display_name, avatar_url, created_at)
activities          (id, slug unique, name, description, parent_id FK activities, cover_url, created_at)
permissions         (id, code unique, description)                  -- seedé
roles               (id, name unique, is_system bool, created_at)   -- seedé + custom
role_permissions    (role_id, permission_id)
user_role_scopes    (id, user_id, role_id, scope_activity_id nullable)
posts               (id, author_id, activity_scope_id, body, status, created_at, updated_at)
post_media          (id, post_id, url, type, order, width, height, duration_s)
comments            (id, post_id, author_id, body, status, created_at)
reactions           (user_id, post_id, PK composite)
reports             (id, target_type, target_id, reporter_id, reason_text, status, resolved_by, resolved_at, created_at)
cms_pages           (id, slug unique, title, body_rich, updated_by, updated_at)
```

RLS policies essentielles :
- `SELECT` sur `posts`, `comments`, `reactions` : tous, y compris anonymes (lecture publique).
- `INSERT` sur `posts` : `has_permission(auth.uid(), 'post.create', activity_scope_id)`.
- `UPDATE/DELETE` sur `posts` : propriétaire OU admin couvrant scope OU superadmin.
- Similaire pour `comments` et `reactions`.
- `cms_pages` : `SELECT` tous, `UPDATE` superadmin seulement.
- `user_role_scopes` : `SELECT` superadmin, `INSERT/DELETE` superadmin.

## 11. Flux principaux

### Inscription

1. `/inscription` → formulaire email + password + display_name.
2. Supabase Auth crée `auth.users` + trigger crée `profiles`.
3. Email de confirmation envoyé.
4. Après confirmation, redirect `/` en état connecté.

### Publication d'un post (admin d'activité)

1. `/activites/:slug` → bouton "Publier" visible uniquement si `has_permission('post.create', scope)`.
2. Éditeur : texte + drag&drop médias.
3. Compression client : photos vers WebP (via `canvas`), vidéo vers MP4 H.264 480p si nécessaire et possible.
4. Upload parallèle vers `post-media/{post_draft_id}/...`.
5. `INSERT` post + `INSERT` post_media.
6. Realtime push vers abonnés du feed activité.

### Commentaire / réaction

1. Utilisateur connecté clique ❤️ ou tape commentaire.
2. `INSERT` immédiat, optimistic UI.
3. Realtime broadcast aux autres lecteurs de la page.

### Signalement

1. Menu `...` sur post/commentaire → "Signaler" → textarea raison.
2. `INSERT reports` (RLS autorise tout membre connecté).
3. Badge visuel discret "Signalé" pour les admins concernés.
4. Queue `/admin/signalements` → action de modération.

## 12. Sécurité et RGPD

- Mots de passe hashés par Supabase Auth (bcrypt).
- RLS = défense en profondeur, jamais de bypass côté client.
- Clé `service_role` **jamais** exposée au client, utilisée seulement dans Edge Functions et variables serveur Cloudflare.
- Droit d'accès / suppression (RGPD) : page `/profil` permet suppression du compte (soft-delete : `profiles.deleted_at`, anonymisation nom, conservation posts sous "Utilisateur supprimé"). Suppression dure possible sur demande écrite.
- Cookies : seulement strictement nécessaires (session Supabase). Pas d'analytics tiers V1.
- Charte photo mineurs : voir §8.

## 13. Hors V1 (roadmap future)

| Fonctionnalité | Phase |
|---|---|
| Billetterie gala + paiement Stripe | V2 |
| Abonnement mensuel 5 € soutien asso (Stripe) + rôle `Supporter` auto | V2 |
| Workflow consentement parental photos mineurs | V2 |
| Notifications (email + web push) | V2 |
| Calendrier des événements | V2 |
| Recherche full-text posts/pages | V2 |
| OAuth Google / Facebook | V1.5 |
| Édition commentaires | V1.5 |
| Multi-emoji réactions | V1.5 |
| Migration médias vers R2/Bunny si saturation storage | déclenché au besoin |
| Migration Supabase Pro si saturation DB/Auth | déclenché au besoin |

## 14. Prérequis avant implémentation

- **Direction artistique** : le design graphique (palette, typographie, moodboard, maquettes) doit être livré avant le démarrage du développement. Ce spec décrit la structure fonctionnelle, pas l'habillage visuel.
- **Nom de domaine** : décider si on achète un domaine temporaire ou si on attend accord du TALC pour utiliser `le-talc.fr`.
- **Compte Supabase** : projet créé, clés API générées, variables d'environnement configurées.
- **Compte Cloudflare** : Pages connecté au dépôt GitHub.

## 15. Unités logicielles (découpage mental pour l'implémentation)

Pour favoriser l'isolation et la testabilité, le code sera organisé en unités à responsabilité unique :

- **`auth/`** : inscription, connexion, reset, session, hooks React côté client.
- **`rbac/`** : fonctions SQL + helpers TS pour `has_permission`, `has_role`, seed des rôles système.
- **`activities/`** : CRUD hiérarchie, résolution d'ancêtres.
- **`posts/`** : CRUD posts + médias, règles de permission, compression client.
- **`comments/`** + **`reactions/`** : simples, indépendants, branchés Realtime.
- **`reports/`** : signalement + queue de modération.
- **`cms/`** : pages statiques éditables.
- **`admin/`** : UI back-office, compose les modules ci-dessus.
- **`ui/`** : composants shadcn/ui + design system.

Chaque module expose une API claire et cache son état interne. Les modules communiquent via interfaces typées, jamais en accédant directement aux tables les uns des autres.
