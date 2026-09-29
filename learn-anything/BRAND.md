# Peaches — Brand Guide

> **Pick a topic. Grow into it.**

Peaches is an AI-powered recursive learning system. This document is the
source of truth for the brand. If you are changing colors, the logo, or product
copy, start here.

---

## 1. Name and voice

|               |                                                                                                        |
| :------------ | :----------------------------------------------------------------------------------------------------- |
| **Name**      | Peaches                                                                                                |
| **Tagline**   | Pick a topic. Grow into it.                                                                            |
| **Emoji**     | 🍑                                                                                                     |
| **One-liner** | An AI-powered recursive learning system that turns your AI coding assistant into an interactive tutor. |

**The tagline is English-only — do not translate it.** A Chinese rendering was
tried and abandoned: _"挑一个主题，慢慢长进去"_ reads as machine-translated
(_长进去_, "grow into", is not idiomatic). Peaches is now English-only
throughout, so this is settled rather than deferred: the CLI, the dashboard, the
generated skills, and the docs all ship one language. A future translation must
be written by a native speaker and reviewed here first — the point is that it
must never be a literal gloss of the English.

Previously published as **Peaches** (2026-09-26 rebrand). The npm
package, the `peaches` binary, the `.peaches/` directory, the
`peaches-*` skill IDs, and the `/peaches:*` commands are **unchanged** —
see §6.

**Voice.** Warm, plain, and a little playful. We talk about topics ripening and
knowledge growing rather than about "leveraging" or "supercharging". Short
sentences. No exclamation marks in the README. We address the reader as "you".

**Product principles.** These shape every generated response, and outrank the
brand voice when they conflict:

■ **Full-spectrum security.** AppSec/defensive, offensive, cryptography, and
  foundations are all first-class. Every offensive concept ships with its
  mitigation and its detection signal.
❖ **Authorised practice only.** Labs run locally, on deliberately vulnerable
  apps (DVWA, Juice Shop, WebGoat), or on CTF platforms. A technique aimed at a
  system the user has not claimed to own is redirected to a lab that teaches the
  same thing.
➤ **One next step, always.** Recommend a single action rather than presenting a
  menu. Decision paralysis is the enemy, not choice.
◉ **Lapses are free.** No streaks, no recency, no catch-up language. A gap in
  study is a scheduling artefact, never a character flaw, and long gaps silently
  widen the review interval.
◇ **No wall of unfinished.** Progress views show only what exists. Unexplored
  work is absent, not grey, and never counted at the user unprompted.
⁃ **Assume competence.** Gaps are scheduling artefacts, not ability. Reflect
  technical progress, never effort.

These live in code as `SECURITY_SCOPE` and `ADHD_PROTOCOL` in
`packages/cli/src/core/templates/workflows/_shared.ts`, imported by all seven
workflow templates. Change them there, not in the individual workflows.

**Personas.** The generated skills cast the assistant as a Peaches role —
_Knowledge Mentor_, _Explanation Mentor_, _Practice Coach_, _Quiz Coach_,
_Learning Analyst_, _Status Visualizer_. The possessive is `Peaches'`
(no apostrophe-s), e.g. `You are Peaches' Practice Coach.`

---

## 2. The mark

`logo.svg` at the repo root is the **canonical** drawing. `logo.png` (512×512,
8-bit RGBA, transparent) is rasterized from it — do not hand-edit the PNG.

The same geometry is inlined as `PeachMark.vue`
(`packages/cli/site/src/components/brand/PeachMark.vue`) for use in the app,
with gradient ids prefixed `pm-` to avoid colliding with other inline SVGs.

> **Changing the mark means changing both files.** `test/brand.test.ts` asserts
> the two are byte-identical in path data and will fail if you forget. It also
> asserts the inlined version keeps the green leaf — an earlier iteration drew
> the leaf in brand peach, which read as a monochrome blob.

The mark is a peach with a green leaf: ripe = finished, growing = in progress.
It reads correctly down to 32px.

**Clear space.** Keep at least the width of the leaf clear on all sides.

---

## 3. Color

The product theme is dark-first. `#111113` is the base.

### Design language

**Cool futurist, restrained.** Three moves, and nothing else:

1. **One light source.** A single peach glow from the top-left plus a faint cyan
   counter-glow bottom-right. Depth comes from *elevation*
   (`#07080b` -> `#0c0e13` -> `#11141a`), never from heavier borders.
2. **Monospace as the data voice.** Numbers, labels, and nav counts are mono with
   wide letter-spacing; prose stays Inter. That split separates "system" from
   "content" without a single box.
3. **Glow used once per view.** The primary call to action and the active
   progress segment are the only glowing elements. Futurism from restraint reads
   as confident; futurism from everywhere reads as noise.

Hairlines are `rgba(255,255,255,.06)`. They are separators, not
information-bearing boundaries, so they are exempt from the 3:1 non-text rule.
Glass is reserved for modal surfaces — it is not a general decoration.

### Brand ramp — interaction and affordance only

| Token                | Hex                      | Use                                     |
| :------------------- | :----------------------- | :-------------------------------------- |
| `--color-brand-1`    | `#ff9d63`                | primary brand fill                      |
| `--color-brand-2`    | `#ff9d63`                | links, active states, icons, CTA        |
| `--color-brand-3`    | `#ffb98c`                | hover borders, subtle accents           |
| `--color-brand-soft` | `rgba(255 157 99 / .12)` | tinted backgrounds, the next-action band |
| `--color-brand-dim`  | `#b56a41`                | inactive brand text                     |
| `--color-glow`       | `rgba(255 157 99 / .16)` | the ambient light source, CTA glow      |

Peach on the `#07080b` base is **9.8:1** contrast.

### Secondary hue — cool, for "active"

| Token          | Hex      | Use                                  |
| :------------- | :------- | :----------------------------------- |
| `--color-cyan` | `#46d6e8` | in-progress state, cyan counter-glow |

### Status scale — semantic only

| Token                 | Hex      | Concept state    | Meaning                |
| :-------------------- | :------- | :--------------- | :--------------------- |
| `--color-mastered`    | `#ff9d63` | `mastered`       | ripe peach             |
| `--color-in-progress` | `#46d6e8` | `in_progress`    | cool cyan — in flight  |
| `--color-attention`   | `#e8a04e` | `needs_practice` | amber — needs work     |
| `--color-unmapped`    | `#3a3f48` | `unexplored`     | deliberately dim       |

**These two ramps must not be mixed.** `--color-brand-*` is for interaction;
`--color-*` status tokens are for mastery state. `mastered` shares
`--color-mastered` with the brand peach _by design_ — that is the brand payoff.

> **Never carry status by hue alone.** Every state is paired with a glyph from
> `statusGlyph.ts` (`mastered` filled star, `in_progress` right triangle,
> `needs_practice` lozenge, `unexplored` hollow bullet) and an accessible name,
> so the heatmap survives colourblindness and greyscale.

> **Why the hues are far apart.** `--color-mastered` and `--color-brand-2` are
> the same value, and both once doubled as the `needs_practice` colour, which
> rendered `mastered` and `needs_practice` pixel-identical in the knowledge-map
> heatmap — the one job that view has. Do not collapse the status scale.
> `test/brand.test.ts` guards the distinctness.

> **`unexplored` is intentionally low contrast** (1.9:1). It is always paired
> with its glyph and an em-dash instead of a percentage, and it is
> `aria-hidden` — the concept name beside it carries 16.8:1. The dimming is the
> point: an untouched concept is not a deficit, so it should not read as one.
> Do not "fix" this contrast without changing that pairing.

`--color-in-progress` and `--color-attention` replace the old single-hue
`--color-progress`. That token is retired; do not reintroduce it.

### The palette is single-source

Tokens are declared **once**, in `@theme`. There is deliberately no second
declaration set under `.dark`: it used to re-declare every value identically,
so each edit had to be made twice and a missed one diverged with nothing to
catch it. `.dark` stays on `<html>` as a class-based marker (Tailwind's `dark:`
variant and `useDarkMode` both key off it) and resolves to the same values.

The theme is **dark-only**. The README previously advertised a "light/dark
toggle" that did nothing, because `.dark` merely mirrored root. A real light
theme needs its own contrast-checked block; do not mutate these tokens to fake
one.

### Neutrals

| Token                                                   | Hex                               |
| :------------------------------------------------------ | :-------------------------------- |
| `--color-bg`                                            | `#111113`                         |
| `--color-bg-alt`                                        | `rgba(18, 18, 20, .85)`           |
| `--color-bg-soft` / `--color-bg-elv`                    | `rgba(24, 24, 26, .7)`            |
| `--color-border` / `--color-divider` / `--color-gutter` | `#252527`                         |
| `--color-code-bg`                                       | `#1a1a1c`                         |
| `--color-text-1` / `-2` / `-3`                          | `#f0f0f0` / `#a3a3a3` / `#525252` |

**Tokens are declared twice** — once in `@theme`, once in `.dark` — because the
theme is dark-first and `.dark` mirrors root. Change both.

Prefer referencing tokens over literal colors. The modal shadows and ambient
background gradients used to hardcode `rgba(138, 90, 66, …)`; they now read
`--color-glow`, so the accent is re-themeable from `main.css` alone. Note that
grepping for a hex value will not find a `rgba()` literal — search for the
decimal triple too.

---

## 4. Type and space

- **Sans** — Inter, with `PingFang SC` / `Noto Sans SC` / `Microsoft YaHei` for
  Chinese. Weight 600 for headings (VitePress convention), 400 body.
- **Mono** — Cascadia Code / Fira Code / JetBrains Mono / SF Mono.
- **Scale** — `xs .75 · sm .875 · base 1 · lg 1.125 · xl 1.25 · 2xl 1.5 ·
3xl 2rem` rem. Body line-height `1.75`; prose blocks `28px`.
- **Letter-spacing** — `-0.02em` on `h1`/`h2`, `-0.01em` on `h3`/`h4`.
- **Radius** — `--radius-card: 20px` (modals, cards), `--radius-sm: 4px`.

---

## 5. Where the brand lives

| Surface                        | File                                                           |
| :----------------------------- | :------------------------------------------------------------- |
| Theme tokens                   | `packages/cli/site/src/styles/main.css`                        |
| Dashboard title, favicon, meta | `packages/cli/site/index.html`                                 |
| Sidebar wordmark               | `packages/cli/site/src/components/sidebar/AppSidebar.vue`      |
| Inlined mark                   | `packages/cli/site/src/components/brand/PeachMark.vue`         |
| CLI banner and messages        | `packages/cli/src/i18n/locales/en.ts`                          |
| Skill personas                 | `packages/cli/src/core/templates/workflows/peaches-*.ts`       |
| Docs                           | `README.md`, `CLAUDE.md`, `CONTRIBUTING.md`                     |

The favicon is an inline `data:image/svg+xml` URI in `index.html` rather than
a file, because the site has no `public/` directory and the published bundle is
copied by `scripts/bundle-site.mjs`.

There are no archived design mockups in the repo — the tokens in `main.css` are
the only theme record.

---

## 6. Product identifiers

Everything ships under the Peaches name. There is no second name and no
compatibility layer.

| Thing | Value |
| :--- | :--- |
| npm package | `peaches` |
| binary | `peaches` |
| data dir | `.peaches/` |
| skill IDs | `peaches-next`, `peaches-topic` … `peaches-quiz` |
| commands | `/peaches:next`, `/peaches:topic` … `/peaches:quiz` |
| command dir | `.claude/commands/peaches/` |
| localStorage keys | `peaches-theme`, `peaches-locale`, `peaches-tree-expansion` |
| module | `core/peaches-protocol/` |

**Never reintroduce a legacy name, alias, or migration shim.** If a rename is
ever needed again, do it as a clean break and let the old name disappear
completely.

| Outside this repo | Value | Why |
| :--- | :--- | :--- |
| GitHub repo | `0xClumzzy/peaches` | the `homepage` / `repository` fields and README links point here, so the repo must be renamed on GitHub to match |
| author | `0xClumzzy` | a person's name, not a brand |
| license | `MIT` | legal identifier |

---

## 7. Checklist for a brand change

1. Update `logo.svg`, then regenerate `logo.png`
   (`convert -background none -density 384 logo.svg -resize 512x512 -depth 8 PNG32:logo.png`).
2. Mirror the geometry into `PeachMark.vue`, keeping the `pm-` id prefixes.
3. Edit **both** token blocks in `main.css` (`@theme` and `.dark`).
4. Sweep for literals, including decimal RGB: `grep -rnE "#[0-9a-f]{6}|[0-9]+, ?[0-9]+, ?[0-9]+" packages/cli/site/src`
5. Update `en.ts` and the seven workflow personas.
6. `pnpm -F peaches-site test` — `test/brand.test.ts` is the safety net.
7. `pnpm build && pnpm test && pnpm lint`, then re-run
   `node packages/cli/bin/peaches.js update --force` so the committed
   generated skills in `.agent/` and `.opencode/` match.
8. Add a `CHANGELOG.md` entry.
