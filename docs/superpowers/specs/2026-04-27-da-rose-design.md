# DA Rose — Refonte direction artistique TALC

**Date** : 2026-04-27
**Statut** : Spec validée, en attente de plan d'implémentation
**Contexte** : Le rose `#ee85c0` est la couleur officielle de l'association TALC. La DA actuelle (almanach vintage rouge théâtre) ne reflète pas cette identité. Cette spec définit la nouvelle DA "programme music-hall rose".

---

## 1. Concept

"Programme music-hall rose" : affiche cabaret années 1980 (TALC fondé en 1985) mariée à une typographie vintage sérif. Le rose devient la couleur principale, le beige est rétrogradé en accent papier vintage signature, le fuchsia joue le rôle d'encre/cachet.

Lisibilité prime — la page doit rester confortable pour de la lecture longue. Le rose vif `#ee85c0` n'est jamais utilisé comme fond plein de page : il est réservé aux bandes signatures.

## 2. Palette

```css
:root {
  --paper        : #fce5f1;  /* rose pâle, fond page principal */
  --paper-deep   : #f7d4e6;  /* rose moyen, sections alternées + hover */
  --rose         : #ee85c0;  /* rose bonbon TALC, bandes signatures */
  --cream        : #f2ece0;  /* ex-paper, cards papier vintage signature */
  --ink          : #1a1614;  /* texte principal */
  --ink-soft     : #2d2622;  /* texte secondaire */
  --rule         : #2d2622;  /* filets décoratifs */
  --accent       : #c2185b;  /* fuchsia profond, CTA + liens + ornements */
  --accent-deep  : #8e1244;  /* fuchsia hover/active */
  --sepia        : #6f5a3d;  /* meta vintage, labels discrets */
}
```

Vérifications contraste WCAG :
- `--ink` sur `--paper` ≈ 14:1 (AAA)
- `--accent` sur `--paper` ≈ 6.5:1 (AA)
- `--rose` sur `--ink` ≈ 7:1 (AAA)
- `--cream` sur `--rose` ≈ 1.4:1 — usage texte interdit, surface uniquement

## 3. Typographie

Inchangée :
- **IM Fell DW Pica** — H1/H2 display, drop caps, masthead
- **EB Garamond** — texte courant, sous-titres
- **JetBrains Mono** — meta dates, codes

Le décalage moderne est porté par le rose, pas par la typographie. Aucune introduction de sans-serif géométrique.

## 4. Ornements & motifs

| Élément | Avant | Après |
|---------|-------|-------|
| Ornement intra-titre | `❦ ❧ ❦` (en `--accent`) | `✦ ◆ ✦` (en `--accent` fuchsia) |
| Coins flourish (4/section) | présents | supprimés |
| Bordure hero/footer | flourishes | doubles points roses `• •` |
| Filet double-rule | 2-3 par section | 1 par section maximum |
| Drop cap | en `--ink` | en `--accent` fuchsia |
| Bande signature | (n'existait pas) | bandeau `--rose` plein, h. 80-120px |

## 5. Surfaces & layout

- **Fond page** : `--paper` partout par défaut.
- **Sections alternées** : `--paper-deep` (rose moyen) — alternance sur la home (almanach, actu).
- **Bandes signatures `--rose`** : hero top, footer, CTA blocks "Rejoindre le Club". Texte `--ink` ou `--cream` selon contraste.
- **Cards papier `--cream`** : cards almanach, profil, événement, news, post. Effet "papier collé sur affiche" sur fond rose.
- **Topbar** : fond `--ink` (inchangé), accents `--rose` à la place du rouge.
- **Profil cover fallback** : `--rose` (avant : gradient sépia).
- **Boutons** :
  - `.btn-primary` : fond `--accent`, texte `--cream`. Hover `--accent-deep`.
  - `.btn-ghost` : bordure `--ink`, texte `--ink`, fond transparent.

## 6. Fichiers impactés

CSS :
- `src/styles/tokens.css` — refonte palette (section 2)
- `src/styles/main.css` + `src/app/globals.css` — vérifier imports (rappel CLAUDE.md)
- `src/styles/components/topbar.css`
- `src/styles/components/nav.css`
- `src/styles/components/hero.css` — bandeau rose, ornements `✦ ◆ ✦`, allègement flourishes
- `src/styles/components/button.css` — primary fuchsia
- `src/styles/components/card-news.css`
- `src/styles/components/card-activity.css`
- `src/styles/components/card-post.css`
- `src/styles/components/profile.css` — fallback cover
- `src/styles/components/form.css`
- `src/styles/components/auth.css`
- `src/styles/components/account.css`
- `src/styles/components/practical.css`
- `src/styles/components/footer.css`
- `src/styles/components/user-menu.css`

Mockups HTML :
- `mockups/home-hero-almanach.html`
- `mockups/auth.html`
- `mockups/parametres.html`
- `mockups/profil.html`

## 7. Hors-scope

- Pas de refonte logo TALC.
- Pas de refonte iconographie SVG existante.
- Pas de modification de structure HTML/TSX (DA pure CSS via tokens).
- Pas de changement de fonts.
- Pas de mode dark.

## 8. Critères de validation

- Tous les mockups HTML rendent correctement avec la nouvelle palette.
- L'app Next.js (pages live) reflète les changements via `globals.css`.
- Contrastes WCAG AA respectés sur tout texte.
- Aucune régression structurelle (layout, espacements inchangés).
- L'identité rose `#ee85c0` est immédiatement reconnaissable sur le site (présence sur hero + footer + CTA).
