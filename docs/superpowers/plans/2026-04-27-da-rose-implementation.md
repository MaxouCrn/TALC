# DA Rose — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refonte de la direction artistique TALC vers la palette officielle rose (`#ee85c0`), avec rose comme couleur principale, beige relégué en accent papier vintage, et fuchsia comme encre/CTA.

**Architecture:** Refactor pure CSS via design tokens (`tokens.css`). La majorité des composants consomment déjà `var(--paper)`, `var(--accent)` etc., donc la propagation est automatique. Quelques edits ciblés sur boutons, cards (passage `--paper` → `--cream`), hero (suppression flourishes, ajout bande rose signature) et mockups HTML (motifs `✦ ◆ ✦`).

**Tech Stack:** CSS custom properties, Tailwind v4 `@theme`, mockups HTML statiques, Next.js 15.

**Spec source:** `docs/superpowers/specs/2026-04-27-da-rose-design.md`

**Verification model:** Pas de TDD littéral (refactor visuel CSS). Chaque tâche : modif → `npm run lint` + ouverture dev server (`npm run dev`) ou mockup HTML dans le navigateur → vérif visuelle → commit. L'utilisateur valide le rendu avant passage à la tâche suivante si demandé.

---

## File Structure

**Modifiés :**
- `src/styles/tokens.css` — refonte palette (source de vérité)
- `src/app/globals.css` — `@theme` Tailwind : ajout `--color-rose`, `--color-cream`
- `src/styles/components/button.css` — `.btn-primary` fuchsia
- `src/styles/components/card-post.css` — fond `--cream`
- `src/styles/components/card-activity.css` — `.activity` interior `--cream`
- `src/styles/components/profile.css` — cover fallback rose
- `src/styles/components/hero.css` — flourishes off, bande rose signature
- `mockups/home-hero-almanach.html` — ornement `❦ ❧ ❦` → `✦ ◆ ✦`
- `mockups/auth.html`, `mockups/parametres.html`, `mockups/profil.html` — idem si présents

**Hors-scope (pas modifiés) :** `src/styles/main.css`, `src/styles/components/{topbar,nav,form,auth,account,practical,footer,user-menu,card-news}.css` — consomment déjà les tokens, propagation automatique.

---

### Task 1 : Refonte palette tokens

**Files:**
- Modify: `src/styles/tokens.css:8-17`

- [ ] **Step 1.1: Remplacer le bloc Colors**

Remplacer lignes 9-17 de `src/styles/tokens.css` :

```css
:root {
  /* -------- Colors -------- */
  --paper:        #fce5f1;   /* rose pâle, fond page principal */
  --paper-deep:   #f7d4e6;   /* rose moyen, sections alternées + hover */
  --rose:         #ee85c0;   /* rose bonbon TALC, bandes signatures */
  --cream:        #f2ece0;   /* papier vintage, cards signature */
  --ink:          #1a1614;   /* texte principal */
  --ink-soft:     #2d2622;   /* texte secondaire */
  --rule:         #2d2622;   /* filets décoratifs */
  --accent:       #c2185b;   /* fuchsia profond, CTA + liens + ornements */
  --accent-deep:  #8e1244;   /* fuchsia hover/active */
  --sepia:        #6f5a3d;   /* meta vintage, labels discrets */
```

- [ ] **Step 1.2: Ajouter les tokens Tailwind correspondants**

Modifier `src/app/globals.css` bloc `@theme` (lignes 42-52) — ajouter `--color-rose` et `--color-cream` :

```css
@theme {
  /* Couleurs → bg-paper, text-ink, border-accent, … */
  --color-paper:        var(--paper);
  --color-paper-deep:   var(--paper-deep);
  --color-rose:         var(--rose);
  --color-cream:        var(--cream);
  --color-ink:          var(--ink);
  --color-ink-soft:     var(--ink-soft);
  --color-rule:         var(--rule);
  --color-accent:       var(--accent);
  --color-accent-deep:  var(--accent-deep);
  --color-sepia:        var(--sepia);
```

- [ ] **Step 1.3: Vérifier lint**

Run: `npm run lint`
Expected: `0 problems`.

- [ ] **Step 1.4: Vérifier rendu dev server**

Run: `npm run dev` (background si pas déjà lancé)
Ouvrir `http://localhost:3000`. Toutes les zones beige doivent passer en rose pâle, accents anciennement rouges en fuchsia. Cards et hero peuvent paraître "trop roses" (corrigé tâches suivantes). Pas d'erreur console.

- [ ] **Step 1.5: Commit**

```bash
git add src/styles/tokens.css src/app/globals.css
git commit -m "feat(da): swap palette to rose (paper) + fuchsia (accent)"
```

---

### Task 2 : Bouton primaire fuchsia

**Files:**
- Modify: `src/styles/components/button.css:24-32`

- [ ] **Step 2.1: Modifier `.btn-primary`**

Remplacer lignes 24-32 de `src/styles/components/button.css` :

```css
.btn-primary {
  background: var(--accent);
  color: var(--cream);
  border-color: var(--accent);
}
.btn-primary:hover {
  background: var(--accent-deep);
  border-color: var(--accent-deep);
}
```

Rationale : selon spec section 5, primary = fond fuchsia, texte cream. Avant : fond ink, hover accent.

- [ ] **Step 2.2: Vérifier rendu**

Recharger `http://localhost:3000`. Bouton "Rejoindre le Club" doit être fuchsia plein avec texte beige cream. Hover → fuchsia plus sombre.

- [ ] **Step 2.3: Commit**

```bash
git add src/styles/components/button.css
git commit -m "feat(da): primary button uses fuchsia accent"
```

---

### Task 3 : Cards papier cream (post)

**Files:**
- Modify: `src/styles/components/card-post.css:19, 87`

- [ ] **Step 3.1: Swap fond `.post-card` paper → cream**

Dans `src/styles/components/card-post.css`, remplacer la ligne 19 :

```css
  background: var(--cream);
```

(Avant : `background: var(--paper);`)

- [ ] **Step 3.2: Swap fond `.post-card .meta` paper-deep → cream-deep dérivé**

Ligne 87, remplacer :

```css
  background: var(--paper-deep);
```

par :

```css
  background: var(--cream);
  border-top: 1px solid var(--rule);
```

Rationale : sur fond rose page, l'effet "papier collé" demande cream uniforme avec un filet de séparation à la place du contraste paper/paper-deep.

- [ ] **Step 3.3: Vérifier visuel**

Ouvrir `mockups/home-hero-almanach.html` dans le navigateur (file:// ou via dev server). Les `.post-card` doivent apparaître en beige cream sur fond rose pâle, effet "découpé/collé".

- [ ] **Step 3.4: Commit**

```bash
git add src/styles/components/card-post.css
git commit -m "feat(da): post cards use cream paper on rose page"
```

---

### Task 4 : Cards activity papier cream

**Files:**
- Modify: `src/styles/components/card-activity.css:37, 42`

- [ ] **Step 4.1: Swap `.activity` interior**

Ligne 37 de `src/styles/components/card-activity.css`, remplacer :

```css
  background: var(--paper);
```

par :

```css
  background: var(--cream);
```

Ligne 42, remplacer le hover :

```css
.activity:hover { background: var(--paper-deep); }
```

par :

```css
.activity:hover { background: #ebe1cd; }
```

(Hover = cream légèrement plus sombre. Pas de token dédié — valeur inline acceptable pour ce micro-état.)

Le container `.activities` ligne 9 reste `var(--paper-deep)` (rose moyen) pour faire ressortir les activities cream collées dessus.

- [ ] **Step 4.2: Vérifier visuel**

Recharger `http://localhost:3000`. Section "Activités" : cadre rose moyen, items cream cliquables.

- [ ] **Step 4.3: Commit**

```bash
git add src/styles/components/card-activity.css
git commit -m "feat(da): activity items use cream paper"
```

---

### Task 5 : Profile cover fallback rose

**Files:**
- Modify: `src/styles/components/profile.css`

- [ ] **Step 5.1: Localiser le fallback**

Run: `grep -n "cover\|sepia\|gradient" src/styles/components/profile.css | head -20`

Identifier la règle qui définit le fond du `.profile-cover` quand pas d'image. Probablement un `background: linear-gradient(...)` ou une couleur sépia/paper.

- [ ] **Step 5.2: Remplacer par rose plein**

Remplacer la valeur du `background` du `.profile-cover` (état sans image) par :

```css
  background: var(--rose);
```

(Si le fallback est dans plusieurs sélecteurs, traiter chacun. Si un gradient sépia est présent, le supprimer.)

- [ ] **Step 5.3: Vérifier visuel**

Ouvrir `http://localhost:3000/profil/<id>` (utilisateur sans cover). Bandeau cover doit être rose vif `#ee85c0`.

- [ ] **Step 5.4: Commit**

```bash
git add src/styles/components/profile.css
git commit -m "feat(da): profile cover fallback uses rose"
```

---

### Task 6 : Hero — supprimer flourishes, ajouter bande rose signature

**Files:**
- Modify: `src/styles/components/hero.css:75-79` (flourishes)
- Modify: `src/styles/components/hero.css` (ajout bande)

- [ ] **Step 6.1: Désactiver les flourishes coins**

Remplacer le bloc `.flourish` (lignes 75-79 de `hero.css`) par :

```css
.flourish { display: none; }
```

Rationale : spec section 4 — flourishes supprimés. On garde la classe (utilisée dans HTML/mockup) mais on la masque, évite de toucher les TSX.

- [ ] **Step 6.2: Ajouter bande rose signature en bordure top du hero**

Ajouter à la fin de `src/styles/components/hero.css` :

```css
.hero {
  position: relative;
}
.hero::before {
  content: "• •";
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--accent);
  font-size: 14px;
  letter-spacing: 0.6em;
}
.hero::after {
  content: "• •";
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--accent);
  font-size: 14px;
  letter-spacing: 0.6em;
}
```

(Si `.hero` a déjà `position: relative` lignes 1-10, ne pas dupliquer la règle — utiliser un sélecteur unique.)

- [ ] **Step 6.3: Vérifier visuel**

Recharger `http://localhost:3000`. Hero : pas de flourishes coins, doubles points fuchsia centrés en haut/bas.

- [ ] **Step 6.4: Commit**

```bash
git add src/styles/components/hero.css
git commit -m "feat(da): hero swap flourishes for fuchsia dot ornaments"
```

---

### Task 6b : Footer — bande signature rose

**Files:**
- Modify: `src/styles/components/footer.css:5-7` (et toutes lignes texte associées)

Le footer est actuellement `var(--ink)` (fond sombre, texte papier). Spec section 5 : footer = bande signature `--rose`. Inverse le contraste : fond rose vif, texte ink.

- [ ] **Step 6b.1: Lister les couleurs actuelles**

Run: `grep -n "color\|background" src/styles/components/footer.css`

- [ ] **Step 6b.2: Swap fond et texte du footer**

Dans `src/styles/components/footer.css` :

- `.site-footer` : `background: var(--ink)` → `background: var(--rose)`
- Toute règle qui définit `color: var(--paper)` (ou variante claire) sur descendants du `.site-footer` → `color: var(--ink)`
- Liens du footer (`.site-footer a`) : si actuellement `color: var(--paper)` → `color: var(--ink)`, hover `color: var(--accent)` (fuchsia ressort sur rose).
- Si une règle utilise `background: var(--accent)` (lignes 80, 101) sur un sous-élément (badge/bouton dans footer), garder mais vérifier contraste — sinon swap vers `var(--ink)`.
- Si `background: var(--paper)` (ligne 44) sur sous-élément du footer, remplacer par `var(--cream)`.

- [ ] **Step 6b.3: Vérifier visuel**

Recharger `http://localhost:3000`. Footer = bande rose vif, texte ink lisible, liens hover fuchsia.

- [ ] **Step 6b.4: Vérifier contraste**

Ouvrir devtools, inspecter le texte du footer. Vérifier que le rapport contraste texte/fond est ≥ 4.5:1 (AA). `--ink` `#1a1614` sur `--rose` `#ee85c0` ≈ 7:1 ✓.

- [ ] **Step 6b.5: Commit**

```bash
git add src/styles/components/footer.css
git commit -m "feat(da): footer becomes rose signature band"
```

---

### Task 7 : Mockups — ornements `✦ ◆ ✦` + drop cap déjà fuchsia

**Files:**
- Modify: `mockups/home-hero-almanach.html` (et autres mockups si motifs présents)

- [ ] **Step 7.1: Lister les usages de `❦`, `❧`**

Run:
```bash
grep -rn "❦\|❧" mockups/
```

- [ ] **Step 7.2: Remplacer dans tous les mockups**

Pour chaque occurrence du pattern `❦ ❧ ❦` dans les fichiers retournés à 7.1, remplacer par :

```
✦ ◆ ✦
```

Si présence de `❦` seul, remplacer par `✦`. Si `❧` seul, remplacer par `◆`.

- [ ] **Step 7.3: Vérifier visuel mockup**

Ouvrir `mockups/home-hero-almanach.html` dans le navigateur. Les ornements doivent être `✦ ◆ ✦` en fuchsia, drop cap "D" en fuchsia.

- [ ] **Step 7.4: Commit**

```bash
git add mockups/
git commit -m "feat(da): mockups use music-hall ornaments (stars/diamonds)"
```

---

### Task 8 : Vérification finale & lint

- [ ] **Step 8.1: Lint**

Run: `npm run lint`
Expected: `0 problems`.

- [ ] **Step 8.2: Build prod**

Run: `npm run build`
Expected: build OK, pas d'erreur Tailwind sur `bg-rose` / `bg-cream` (les nouveaux tokens doivent générer leurs utilitaires).

- [ ] **Step 8.3: Smoke test pages**

Pour chaque page : ouvrir, vérifier rendu cohérent (pas de couleur rouge résiduelle, lisibilité texte OK, contraste boutons OK).
- `http://localhost:3000/` — home
- `http://localhost:3000/connexion`
- `http://localhost:3000/inscription`
- `http://localhost:3000/parametres` (logué)
- `http://localhost:3000/profil/<id>`

- [ ] **Step 8.4: Commit final si fixes**

Si correctifs nécessaires (ex: contraste insuffisant sur un sous-composant) :

```bash
git add <files>
git commit -m "fix(da): <description>"
```
