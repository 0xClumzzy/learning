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
(_长进去_, "grow into", is not idiomatic). Rather than ship a translation that
grates, zh-CN surfaces use the English tagline verbatim — which also matches
that file already carrying an English `programDescription` and English skill
command names. If you want a Chinese tagline, have a native writer produce it
and check it here first; the point is that it must not be a literal gloss of
the English.

Previously published as **Peaches** (2026-09-26 rebrand). The npm
package, the `peaches` binary, the `.peaches/` directory, the
`peaches-*` skill IDs, and the `/peaches:*` commands are **unchanged** —
see §6.

**Voice.** Warm, plain, and a little playful. We talk about topics ripening and
knowledge growing rather than about "leveraging" or "supercharging". Short
sentences. No exclamation marks in the README. We address the reader as "you".

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

### Brand ramp — interaction and affordance only

| Token                | Hex                       | Use                                 |
| :------------------- | :------------------------ | :---------------------------------- |
| `--color-brand-1`    | `#f5a76f`                 | primary brand fill                  |
| `--color-brand-2`    | `#f5a76f`                 | links, active states, icons, loader |
| `--color-brand-3`    | `#ffc094`                 | hover borders, subtle accents       |
| `--color-brand-soft` | `rgba(245 167 111 / .14)` | tinted backgrounds, selection       |
| `--color-glow`       | `rgba(245 167 111 / .14)` | modal shadows, ambient glow         |

Peach on the `#111113` base is **9.6:1** contrast.

### Status scale — semantic only

| Token                 | Hex       | Concept state    | Meaning              |
| :-------------------- | :-------- | :--------------- | :------------------- |
| `--color-mastered`    | `#f5a76f` | `mastered`       | ripe peach           |
| `--color-in-progress` | `#7fa65c` | `in_progress`    | leaf green — growing |
| `--color-attention`   | `#e0605f` | `needs_practice` | coral — needs work   |
| `--color-text-3`      | `#525252` | `unexplored`     | grey, at 30% opacity |

**These two ramps must not be mixed.** `--color-brand-*` is for interaction;
`--color-*` status tokens are for mastery state. `mastered` shares
`--color-mastered` with the brand peach _by design_ — that is the brand payoff.

> **Why the hues are far apart.** `--color-mastered` and `--color-brand-2` are
> the same value, and both once doubled as the `needs_practice` colour, which
> rendered `mastered` and `needs_practice` pixel-identical in the knowledge-map
> heatmap — the one job that view has. `brand-2` is also close in hue to amber,
> so `needs_practice` is pushed to coral rather than yellow-green. Do not
> collapse the status scale. `test/brand.test.ts` guards both the distinctness
> and the agreement between the `@theme` and `.dark` declarations.

`--color-in-progress` and `--color-attention` replace the old single-hue
`--color-progress`. That token is retired; do not reintroduce it.

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
| CLI banner and messages        | `packages/cli/src/i18n/locales/{en,zh-CN}.ts`                  |
| Skill personas                 | `packages/cli/src/core/templates/workflows/peaches-*.ts`       |
| Docs                           | `README.md`, `README.zh-CN.md`, `CLAUDE.md`, `CONTRIBUTING.md` |

The favicon is an inline `data:image/svg+xml` URI in `index.html` rather than
a file, because the site has no `public/` directory and the published bundle is
copied by `scripts/bundle-site.mjs`.

`design-previews/` holds **archived pre-rebrand** explorations. They are not the
shipped theme and are not maintained.

---

## 6. Product identifiers

Everything ships under the Peaches name. There is no second name and no
compatibility layer.

| Thing | Value |
| :--- | :--- |
| npm package | `peaches` |
| binary | `peaches` |
| data dir | `.peaches/` |
| skill IDs | `peaches-topic` … `peaches-quiz` |
| commands | `/peaches:topic` … `/peaches:quiz` |
| command dir | `.claude/commands/peaches/` |
| localStorage keys | `peaches-theme`, `peaches-locale`, `peaches-tree-expansion` |
| module | `core/peaches-protocol/` |

**Never reintroduce a legacy name, alias, or migration shim.** If a rename is
ever needed again, do it as a clean break and let the old name disappear
completely.

| Outside this repo | Value | Why |
| :--- | :--- | :--- |
| GitHub repo | `ChenChenyaqi/peaches` | the `homepage` / `repository` fields and README links point here, so the repo must be renamed on GitHub to match |
| author | `yaqi chen` | a person's name, not a brand |
| license | `MIT` | legal identifier |

---

## 7. Checklist for a brand change

1. Update `logo.svg`, then regenerate `logo.png`
   (`convert -background none -density 384 logo.svg -resize 512x512 -depth 8 PNG32:logo.png`).
2. Mirror the geometry into `PeachMark.vue`, keeping the `pm-` id prefixes.
3. Edit **both** token blocks in `main.css` (`@theme` and `.dark`).
4. Sweep for literals, including decimal RGB: `grep -rnE "#[0-9a-f]{6}|[0-9]+, ?[0-9]+, ?[0-9]+" packages/cli/site/src`
5. Update `en.ts` and `zh-CN.ts` together, and the six workflow personas.
6. `pnpm -F peaches-site test` — `test/brand.test.ts` is the safety net.
7. `pnpm build && pnpm test && pnpm lint`, then re-run
   `node packages/cli/bin/peaches.js update --force` so the committed
   generated skills in `.agent/` and `.opencode/` match.
8. Add a `CHANGELOG.md` entry.
