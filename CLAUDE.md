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

## Workflow — nouvelle page

Pour toute nouvelle page (inscription, connexion, profil, admin, etc.) suivre cet ordre :

1. **Mockup HTML/CSS statique** dans `mockups/` (lien `../src/styles/main.css`). Permet d'itérer rapidement sur la direction artistique et le layout sans dépendre de React/Next.
2. **Validation visuelle** par l'utilisateur. Tant que non validé → rester au stade mockup.
3. **Ajout au design system** : si la page introduit des nouveaux composants (formulaires, modales, badges, tabs…), créer les fichiers CSS dédiés dans `src/styles/components/` et les importer dans `main.css`.
4. **Implémentation TSX** dans `src/app/<route>/page.tsx` + composants associés dans `src/components/`. Le mockup HTML reste en référence.

Ne pas coder le TSX avant la validation du mockup.
