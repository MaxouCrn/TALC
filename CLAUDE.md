# Consignes pour Claude Code

## Git

- **Ne jamais** ajouter de ligne `Co-Authored-By: Claude ...` dans les messages de commit.
- **Ne jamais** ajouter de mention "Generated with Claude Code" ou équivalent dans les commits, PRs ou documents.
- Les commits et PRs sont attribués uniquement à l'utilisateur.
- Les commits et push sont autorisés sans confirmation préalable.

## Langue

- Réponses en français.
- Code, identifiants et termes techniques : anglais standard.
- Messages de commit : conventionnels, en anglais.

## Supabase

- Les migrations SQL (`supabase/migrations/*.sql`) peuvent être appliquées directement via `supabase db push` sans confirmation préalable — la base distante `TALC` est linkée.
- Après chaque migration, régénérer les types : `supabase gen types typescript --linked > src/lib/supabase/types.ts` (attention à bien rediriger `2>/dev/null` pour éviter que les messages CLI polluent le fichier).

## Workflow — nouvelle page

Pour toute nouvelle page (inscription, connexion, profil, admin, etc.) suivre cet ordre :

1. **Mockup HTML/CSS statique** dans `mockups/` (lien `../src/styles/main.css`). Permet d'itérer rapidement sur la direction artistique et le layout sans dépendre de React/Next.
2. **Validation visuelle** par l'utilisateur. Tant que non validé → rester au stade mockup.
3. **Ajout au design system** : si la page introduit des nouveaux composants (formulaires, modales, badges, tabs…), créer les fichiers CSS dédiés dans `src/styles/components/` et les importer **dans les DEUX fichiers** :
   - `src/styles/main.css` (utilisé par les mockups HTML standalone)
   - `src/app/globals.css` (entry point Next.js — SANS cet import, le style ne s'applique pas à l'app React)

   Oublier `globals.css` = style absent sur la page live. Toujours vérifier les deux après création d'un nouveau fichier CSS.
4. **Implémentation TSX** dans `src/app/<route>/page.tsx` + composants associés dans `src/components/`. Le mockup HTML reste en référence.

Ne pas coder le TSX avant la validation du mockup.
