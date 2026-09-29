# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-09-30
### Changed

- **BREAKING: the package is now published as `@0xclumzzy/peaches`.** The
  unscoped `peaches` name on npm is owned by an unrelated 2012 CSS compiler, so
  it was never publishable. Only the *install path* is scoped — the binary is
  still `peaches`, and every other identifier (`.peaches/`, `peaches-*` skills,
  `/peaches:*` commands) is unchanged.

  ```bash
  npm install -g @0xclumzzy/peaches
  npx @0xclumzzy/peaches init
  ```

- **BREAKING: the project is now called Peaches.** Previously `learn-anything`.
  The npm package, binary, data directory (`.peaches/`), generated skill IDs
  (`peaches-*`), and slash commands (`/peaches:*`) were all renamed, with no
  compatibility shim, alias, or migration path.
- **OpenCode is now the primarily supported AI tool.** It was previously one of
  30 equals, and it silently received *no command files at all* — command
  generation returns early for any tool without a registered adapter. An
  OpenCode adapter now exists, writing `.opencode/commands/peaches/<id>.md`
  with the frontmatter OpenCode V2 actually reads. OpenCode leads the tool
  picker and is pre-selected when nothing is detected. The other tools are
  still fully supported.
- **Dashboard visual redesign — "cool futurist, yet simple."** Depth now comes from elevation (`#07080b` -> `#0c0e13` -> `#11141a`) rather than heavier borders; hairlines dropped to `rgba(255,255,255,.06)`. A single peach light source (top-left) and a faint cyan counter-glow (bottom-right) replace the previous corner washes. Monospace now carries all numbers, labels, and nav counts, separating "system" from "content" without extra boxes. Card radius 20px -> 10px, sidebar 272px -> 248px, and the glass blur that was applied to cards and the sidebar rail is gone — glass is now reserved for modal surfaces. Glow is used once per view: the promoted action and the active progress segment.
- **The dashboard now promotes exactly one next action.** A new `NextAction` band sits above the topic grid, reusing the existing review-priority ranking. It shows the single highest-priority concept and why, with one call to action, and renders nothing rather than an empty shell when there is no work to do.
- **Knowledge-map rows are restructured**: status glyph, name, a 2px confidence track, and the percentage. Concepts that have never been opened render an em-dash and a 0-width track instead of `0%` — an untouched concept is not a deficit, so it no longer reads as one.
- `in_progress` moved from leaf green to cool cyan `#46d6e8` for the futurist direction. **This diverges from the CLI's `status.mjs`, which still uses the blue circle emoji.** Aligning them is follow-up work.
- **The theme palette is now single-source.** The `.dark` block that re-declared every token identically has been removed, so a token can no longer be edited in one place and drift in the other. `.dark` remains on `<html>` as a class marker. The theme is dark-only; the README no longer advertises a light/dark toggle that never worked.
- `/peaches:practice` is now a security lab rather than a TDD exercise. The coach picks the lab type from the concept — find the vulnerability, build the primitive, harden the control, read the evidence, assess a CVE, or drive a real tool — and states the blast radius before the user starts.
- `/peaches:review` recommends a single concept rather than a ranked list, and never prints a recency column.
- `dirName` is now derived from `workflowId` (`` `peaches-${workflowId}` ``) instead of being hand-written alongside it, and `init.ts` keys script-copying on `workflowId`. Adding a workflow can no longer desync the on-disk directory name from the id the logic depends on — the failure mode was a skill silently shipping with no scripts.
- The CLI no longer hardcodes the workflow count in its "N skill files generated" message; it reports the real number.
- The site theme is **"Peach Glow"**: charcoal base `#111113` with a peach accent (`#f5a76f`). The peach mark (`logo.png` + `logo.svg`) is inlined in the dashboard sidebar from a single `PeachMark.vue` component.
- The dashboard's modal glow shadows and background radial gradients now reference the `--color-glow` token instead of hardcoded `rgba(…)` values, so the accent is re-themeable from `main.css` alone.
- Learning state lives in `.peaches/topics/`. Topics are plain Markdown and JSON, safe to commit and readable without the CLI installed.

### Added

- **Peaches is now a security curriculum**, covering the full spectrum: AppSec/defensive (OWASP Top 10, secure design, code review, authn/authz, secrets, supply chain, incident response), offensive (recon, exploitation primitives, web/mobile/cloud attack surface, reverse engineering, CTFs), cryptography, and foundations. Every offensive concept is now taught paired with its mitigation and its detection signal, and every lab states its blast radius and runs locally or against a deliberately vulnerable target.
- **`/peaches:next`** — a new lowest-friction entry point. It reads your progress, picks the single best next action, and starts it. No arguments, no menu, no recall. If you only ever run one command, run that one.
- **Designed for chronic ADHD.** Ten interaction rules now live in a single exported constant, `ADHD_PROTOCOL` (`packages/cli/src/core/templates/workflows/_shared.ts`), imported by all seven workflows:
  ▪ the knowledge map starts at **one** concept and grows on demand, replacing the previous 15–25 concept up-front syllabus
  ▪ every workflow recommends one action instead of listing options
  ▪ every workflow resumes the exact thing last in progress
  ▪ streaks, "days ago", recency, and catch-up language are gone; long gaps silently widen the review interval
  ▪ progress views show only touched concepts: `unexplored` is no longer rendered as a grey bar or a backlog count
  ▪ sessions are interruptible: every change is valid after five minutes or five weeks
  ▪ `/peaches:quiz` is capped at five questions
  `test/skill-templates.test.ts` now fails the build if any workflow drops `ADHD_PROTOCOL`/`SECURITY_SCOPE` or reintroduces lapse-guilt phrasing.
- `NextAction.vue` — the promoted next-step component.
- **CI workflow (`.github/workflows/ci.yml`).** `CONTRIBUTING.md` documented a four-job pipeline that did not exist, and `scripts/release.sh` gates on `gh pr checks` — with no checks attached, every release aborted before tagging. Now runs lint, format check, CLI typecheck, tests on Node 20 and 22, and a build that asserts `site-dist/index.html` exists.
- **The dashboard can no longer white-screen.** `main.ts` awaited `initTopicData()` before `app.mount()`, and that function had no error handling around its `fetch` — so a stopped server or a failed request left a blank page with the error visible only in devtools. `initTopicData()` now never rejects: failures land on `getInitError()`, one unreadable topic no longer takes down the whole dashboard, and a failed SSE reload no longer re-renders every component against an empty cache.
- **Space works on quiz options again.** The modal swallowed `Space` for every non-text target to stop page-scroll, which also killed the standard keyboard way to activate a focused option button. Suppression is now limited to non-interactive targets, via a tested `shouldSuppressSpace()` guard.
- **Compiled scripts are loaded before any skill file is written.** A missing `dist/scripts/*.mjs` used to throw from inside the per-tool loop, leaving half-populated skill directories and no explanation. `init` now preloads every script up front and fails with a localized message before touching disk.
- **`peaches init <path>` detects tools in the target project.** Interactive selection called `hasToolDir(process.cwd())`, so it pre-selected based on your current directory while writing into the target.
- **Peaches is now English-only.** The `zh-CN` locale is removed from the CLI, the dashboard, and the `status.mjs` script; `--lang` and the dashboard language switch are gone. The i18n layer is kept as a one-locale seam, so a future translation is additive. See §Removed below.
- **`.vue` files are formatted on commit** and `packages/cli/site-dist/` is no longer handed to Prettier, which made `pnpm format:check` fail on the minified bundle.
- **The build no longer requires pnpm on PATH.** `bundle-site.mjs` shelled out to `pnpm exec vite build`; it now resolves Vite's bin script directly.
- Removed four stray files tracked at the repo root (`.sh`, `.py`, `karabo.sh`, `karano.sh`).
- Removed `packages/gui/`, an empty placeholder declaring `AGPL-3.0-only` in an otherwise MIT repository.
- Added `pnpm --filter peaches-site dev` as `dev:site`, which the README documented but which did not exist.

### Removed

- **The `zh-CN` locale.** Peaches ships in English only. Removed `src/i18n/locales/zh-CN.ts` and the site's `composables/locales/zh-CN.ts`, the `--lang` CLI option (which had never been consistently applied to help text), the dashboard's language-switch button, the `--locale` flag on `status.mjs` and its Chinese `Strings` table, the Chinese status test fixtures, and `README.zh-CN.md`. `SupportedLocale` is now `'en'`; the i18n indirection is retained so a future locale is additive. Workflow prompts now say only "respond in the same language the user uses" — the CLI no longer claims a language the product does not have.
- Fixed `scripts/release.sh` inserting the new version heading _above_ `## [Unreleased]` instead of consuming it.
- `test/appSmoke.test.ts` — mounts the real `App.vue` and fails on any Vue error. Added after `PeachMark` shipped with an unassigned `defineProps`, which threw during render and blanked the entire SPA; the brand tests only asserted on the component's _text_, so nothing caught it. A render check is the only thing that catches that class of bug.
- `@vitejs/plugin-vue` is now in the site's `vitest.config.ts`. It was missing entirely, so no test could ever mount an SFC.
- `BRAND.md` — brand source of truth: the mark, the design language, the colour ramps, type, the product principles above, where each surface lives, and a checklist for future brand changes.
- `test/brand.test.ts` — regression guards asserting the sidebar mark and `logo.svg` share identical path geometry, that the inlined mark keeps the green leaf and namespaces its gradient ids, and that the status tokens stay distinct and consistent between `@theme` and `.dark`.
- **Peaches** — an AI-powered recursive learning system that turns your AI coding assistant into an interactive tutor. Tagline: _"Pick a topic. Grow into it."_ (English-only; a Chinese rendering was tried and dropped as unidiomatic).

### Fixed

- **The published tarball was missing everything it needed.** The build was wired to `prepublishOnly`, which npm runs for `npm publish` but *not* for `npm pack`. Since `dist/` and `packages/cli/site-dist/` are gitignored, packing from a clean clone produced an archive with no compiled CLI and no dashboard — it installed without complaint and then failed at runtime. The hook is now `prepack`, which runs for both, and it calls `npm run build` rather than `pnpm run build` so it does not require pnpm on the consumer's PATH. Verified by packing from a fresh clone: 90 `dist/` files, 7 `site-dist/` files, 0 test files, and `peaches init --tools opencode` generating 7 skills and 7 commands from the installed package.
- **Mastery states are now visually distinct in the knowledge map.** `mastered` and `needs_practice` both resolved to `--color-mastered`/`brand-2` (identical values), so two different states rendered pixel-identical in `MasteryTree` and in the `StatsHero` / `TopicProgressView` segmented ledgers — the one job those views have. The single-hue `--color-progress` token is replaced by a semantic status scale: `mastered` peach `#f5a76f`, `in_progress` leaf-green `#7fa65c`, `attention` (needs practice) coral `#e0605f`, `unexplored` grey. The quiz score bar (`>= 80 / >= 50 / below`) and the incorrect-answer ✗ in `QuizResults` were also remapped — the latter was brand peach, which read as a success colour on a wrong answer.

## [1.6.3] - 2026-07-21

### Fixed

- `peaches-explain` template's Step 4D now caps the confidence increment at 1.0 (`confidence += 0.05~0.1 (cap 1.0)`), matching the practice/quiz templates and preventing `validateStateV1` failures that halted `render.mjs` mid-session. (#129, closes #121)
- `validateQuizDeck` now requires `multiple_choice` `answer` to be a string contained in `options[]`, mirroring the existing `multi_select` check. Previously only `options[]` length was validated, so un-answerable questions (answer not in options, or wrong type like boolean/array) passed validation and could never be graded correct by the `exact` step. (#130, closes #122)
- `validateStateV1`/`validateQuizDeck` now report a `Must be an object` error for primitive or `null` entries inside `domains`/`concepts`/`questions`. Previously such entries either passed silently (e.g. `domains: ['str']`, `questions: [42]`) or threw an uncaught `TypeError` (e.g. `domains: [null]`, `questions: [null]`), crashing `render.mjs`/`validate-quiz.mjs` instead of returning the friendly error list. (#131, closes #123)
- `dateStr` validator now rejects impossible dates that happened to match the digit shape (e.g. `2026-99-99`, `2026-13-45`, `2026-02-30`, `2026-01-01 99:99:99`). Both implementations (`schema.ts` Zod and `utils.mts` inline) now round-trip the parsed components through `new Date(...)` and verify every field reads back identically, catching range errors and calendar errors (Feb 30, non-leap-year Feb 29) without per-component special-casing. This prevents hallucinated timestamps written by the AI from silently producing `Invalid Date` downstream (e.g. review-interval math on `last_practiced`). (#132, closes #124)
- `peaches-quiz` Step 6 now splits the `exact` grading bullet by question type. Previously "strict equality versus `answer`" was ill-defined for `multi_select` (`answer: string[]`) and read literally as order-sensitive, so a learner answering `Q1: B, A` against `answer: ["A", "B"]` could be marked wrong by an AI grader following the instruction to the letter. `multi_select` now explicitly requires unordered set comparison (no missing, no extras; order irrelevant); `multiple_choice` and `true_false` keep strict equality. (#133, closes #125)

## [1.6.2] - 2026-07-18

### Changed

- Sidebar tabs (Topics / Exercises / Quizzes) now render a recursive physical file tree mirroring the actual directory structure, instead of assuming a fixed one-level depth. Nested directories display correctly. (#126)

## [1.6.1] - 2026-07-02

### Changed

- **`/peaches-explain` explanation flow**: reordered so the **core mechanism (precise rules) now precedes the analogy** — analogies are supplementary aids that must note the cases they don't cover. Code examples referencing project source must be verified against the actual source before file paths are annotated.

### Fixed

- Update dashboard serve command, using `npx peaches serve` instead of `peaches serve`.

## [1.6.0] - 2026-06-30

### Added

- **Dashboard stats panel**: aggregated mastery overview via `useDashboardStats` — a segmented status progress bar with legend (`StatsHero`) plus a 3-column activity/content/recency summary (`StatsSummary`).
- **Suggested review list**: a `ReviewPanel` on the dashboard backed by `useReview`, surfacing concepts that need attention (studied-not-practiced, needs reinforcement, low confidence, due for review), each with its own color accent.
- **Topic Map/Progress view toggle**: a segmented toggle on the topic overview that switches the markdown Knowledge Map (default) to a width-constrained Progress view showing a topic-scoped mastery ledger, per-domain breakdown bars, an annotated knowledge tree (domains → concepts with status + confidence), and an activity strip. View state syncs to the `?view=` query param.
- Shared `MasteryStats` interface so `StatsHero` is reusable across dashboard (global) and topic (scoped) contexts.
- Full unit-test coverage for the new aggregators (`useDashboardStats`, `useReview`, `useTopicStats`).

## [1.5.6] - 2026-06-29

### Changed

- Quiz keyboard shortcut hints now mention number keys (`1-4`) in addition to letters (`A-D`), and use a more compact range notation. (#108)

### Added

- Quiz workflow now reads explain session notes as the **preferred reference** for question generation. Questions are anchored in what the learner actually studied (analogies, code examples, misconceptions), while still allowing the AI to extend beyond the notes. Falls back to the concept's `details[]` in state.json when no session notes exist. (#107)
- New `multi_select` question type for multiple-answer quiz questions. The quiz system now supports true multi-select (checkboxes) alongside the existing single-select `multiple_choice` type. Includes full-stack support: schema, validation, UI rendering with toggle logic, keyboard shortcuts (A/B/C/D toggle), order-independent set grading, i18n labels, and AI generation template updates. (#91, #106)

## [1.5.5] - 2026-06-29

### Fixed

- Fixed skill templates silently failing to discover files under the hidden `.peaches/` directory — the glob tool ignores dot-prefixed paths by default. All discovery instructions now explicitly use Bash `ls -d` instead of glob. (#72, #101)
- Fixed binary files (e.g. Rust compiled binaries) showing up in the dashboard practice directory tree. Exercises listing now detects binary files by content using Git's NUL-byte heuristic instead of an extension list, and also hides build sub-directories like `target/`. (#90, #102)
- Fixed quiz cards rendering multi-line content (especially embedded code in `error_correction` questions) on a single line. Quiz text elements now use `whitespace-pre-wrap break-words` so `\n` newlines display correctly, while keeping the XSS-safe `{{ }}` text interpolation (no `v-html`). (#92, #103)

## [1.5.4] - 2026-06-29

### Changed

- Refactored `packages/cli/site`: split large files into focused modules — `useQuiz.ts` (398 lines) split into `types.ts`, `quizApi.ts`, `grading.ts`, `useQuizQueue.ts`, `useQuizSession.ts`; extracted shared `utils/highlight.ts` and `utils/slug.ts`; extracted `fileContentCache.ts` from `useTopicData.ts`; extracted `useSearchLauncher` composable (⌘K hotkey + search-select routing) from `App.vue`; moved `Dashboard.vue` and `TopicPage.vue` into a `views/` directory.
- Configured `@/*` path alias (tsconfig + vite) and migrated all `../` relative imports to `@/`.
- Split `QuizModal.vue` into `QuizLoadingView` and `QuizPlayView`; split sidebar, content, and search components into single-responsibility files.

### Fixed

- Fixed file content cache using FIFO eviction instead of LRU — cache hits now re-insert the entry as most-recently-used.
- Fixed ⌘K (Cmd/Ctrl-K) search hotkey activating while focus is in an input, textarea, or contentEditable element.
- Prevented default space-key scrolling while a quiz modal is open.

## [1.5.3] - 2026-06-26

### Fixed

- Fixed the multi-group (queue) quiz results and summary dialogs not scrolling when content overflows: switched the per-group results and final summary dialogs from `flex flex-col` to `grid grid-rows-[minmax(0,1fr)]` so the inner `QuizResults`/`QuizSummary` components receive a definite height and their scroll area activates, keeping the header and footer fixed instead of being clipped.

## [1.5.2] - 2026-06-26

### Fixed

- Fixed 404 errors for all API routes when topic directories have non-ASCII (e.g. Chinese) names: `/api/topics/:slug`, `/api/quizzes/:topic/:restPath`, and static file serving now properly decode `pathname` before filesystem resolution. Also added `encodeURIComponent` in `useTopicData.ts` for consistency with other frontend fetch calls.

## [1.5.1] - 2026-06-26

### Fixed

- Fixed 404 errors when requesting quiz.json from quiz concept directories with non-ASCII characters (serve.mjs restPath was not URI-decoded before filesystem resolution)

## [1.5.0] - 2026-06-25

### Added

- **Quiz card practice UI**: Interactive quiz modal with keyboard shortcuts, card slide transitions, and 4 question-type renderers (multiple choice, true/false, fill-in-blank, error correction).
- **Quiz results & summary views**: Per-question grading feedback with explanations, multi-group score breakdown with progress bars.
- **Multi-group queue mode**: Sequential and shuffled batch quiz across concept groups, with per-group retry and aggregate summary.
- **Sidebar quiz tree**: New sidebar tab listing quizzes grouped by concept, with one-click single-deck launch and batch sequential/random buttons.
- **Quiz test fixtures**: 6 quiz.json files across JavaScript, Python, and React topics covering all 4 question types.

### Changed

- **READMEs synced with quiz workflow**: Both the English and Chinese READMEs now document the single-flow `/peaches:quiz <name>` command (replacing the stale `<generate|grade>` two-stage syntax) and include the new `quizzes/` directory in the project structure tree.
- **CSS design tokens**: Added `--color-mastered-rgb` and `--color-brand-2-rgb` for alpha transparency support in composable styles.

## [1.4.0] - 2026-06-24

### Added

- **Quiz workflow (`/peaches:quiz`)**: A new single-flow text Q&A quiz that generates, grades, and persists a reusable question deck per concept. Supports four text-answer question types — multiple choice, true/false, fill-in-blank, error correction — with a `gradeable` model (`exact` / `accepted` / `ai_only`) for consistent AI grading. Decks are saved as structured `quiz.json` files, enabling future zero-token re-practice on the dashboard.
- **Quiz deck validation (`validate-quiz.mjs`)**: A standalone validation script (mirroring `render.mjs`) that checks each `quiz.json` deck against the v1 schema — field types, type↔gradeable consistency, and required sub-fields — immediately after the deck is written. Ships inside the `peaches-quiz` skill directory.
- **Shared state-update table**: Quiz and practice now share a single `STATE_UPDATE_TABLE` for learning-progress updates, keeping the two workflows in sync.

## [1.3.2] - 2026-06-19

### Fixed

- **Search result layout**: Title and file path columns in search results now split the available width equally, preventing long paths from compressing the title to a single character. Long paths truncate from the left so the filename remains visible.

## [1.3.1] - 2026-06-19

### Fixed

- **Auto-find free port for `serve`**: When running `peaches serve`, if the target port is already in use the server now automatically probes for the next available port (up to 50 attempts) instead of exiting with an error. Use `--strict-port` to opt out and require the exact port.
- **TOC activeId flash on click**: When clicking a heading in the table of contents sidebar, the active highlight no longer flickers through intermediate headings during smooth scroll. The IntersectionObserver is temporarily suppressed until the scroll animation completes.

## [1.3.0] - 2026-06-19

### Added

- **Heading search (⌘K / Ctrl+K)**: A VitePress-style command palette opens via keyboard shortcut or sidebar button, letting users jump to any heading across session notes, the knowledge map, and exercise docs. The server builds a lazy, cached search index (`/api/search-index`) that refreshes on file change; the client filters locally with no per-keystroke requests.
- **Heading anchor links**: Every rendered heading now carries a deep-linkable `id` and a hover-revealed `#` permalink (brand-accent color). Clicking the anchor or entering a `#slug` URL scrolls smoothly to the section, surviving async content loads and page refreshes. CJK heading text is preserved in slugs.
- **Table of contents outline**: A right-side sticky TOC panel (visible at `xl` breakpoint and above) lists `h2`/`h3` headings for the current note or knowledge map. An `IntersectionObserver` scroll-spy highlights the active section; clicking an item scrolls to it and syncs the URL hash.

### Fixed

- **Dark-mode scrollbar colors**: Native scrollbars (sidebar tree, search modal, code blocks) now adapt to dark mode via CSS-variable-based `scrollbar-color` and `::-webkit-scrollbar` rules, instead of showing the light system default.
- **Heading anchor accessibility**: The permalink anchor switched from `aria-hidden="true"` to `aria-label` + `tabindex="-1"`, resolving a browser warning when the anchor receives focus on click.

## [1.2.2] - 2026-06-19

### Fixed

- **Sanitized HTML rendering**: Markdown output is now sanitized via DOMPurify. Safe HTML renders normally — including the `<details>/<summary>` collapsible blocks used for answers, tables, and code highlighting — while dangerous constructs (`<script>`, `on*` event handlers, `javascript:` URIs, `<iframe>`, etc.) are stripped, closing the `v-html` injection surface.

## [1.2.1] - 2026-06-19

### Added

- **Automated release workflow**: `scripts/release.sh` orchestrates the full release end-to-end — `develop` → release branch → CI-gated PR to `main` → tag → GitHub Release → sync back to `develop`. Release notes are sourced from the gitignored `release-notes.md`, so the CHANGELOG, PR body, and GitHub Release all stay in sync from a single source.

### Changed

- **Cleaner shareable URLs**: The sidebar tab (notes/exercises) is now inferred from the selected file's path (`/topics/<slug>/sessions/` vs `/topics/<slug>/exercises/`) instead of a redundant `&tab=` query parameter. Switching tabs is now a pure UI action that no longer pollutes the URL.

### Fixed

- **Python dunders render verbatim**: `__init__`, `__proto__`, `__name__`, and other dunder identifiers no longer get mangled into bold (`<strong>init</strong>`) by markdown's underscore emphasis rule. Underscore-based emphasis is now disabled, while `*`/`**` emphasis (bold/italic), code blocks, inline code, and links are fully preserved. (The knowledge map's manual `\_\_proto\_\_` escaping is no longer needed.)
- **Angle-bracket content no longer vanishes**: Sequences like `<init>`, `<T>`, and `<T extends U>` are no longer swallowed as raw HTML tags. Raw HTML in notes is disabled (`html: false`), which both fixes the disappearing-text bug and closes the `v-html` injection (XSS) surface.

## [1.2.0] - 2026-06-18

### Added

- **Loading overlay**: Red-pen annotated loading overlay (150ms threshold) for file loads, matching the notebook design theme.
- **Sidebar tree expansion persistence**: Expanded domains/concepts now persist across navigation and page refresh via sessionStorage; expanding one node no longer collapses others.
- **Orphan directory marking**: Directories not in `state.json` (orphans) display their English name with a gray dot and a full-row hover tooltip.

### Changed

- **Sidebar trees mirror actual directories**: The notes and exercises trees now reflect the real `sessions/` and `exercises/` directory structure; `state.json` is used only for display names and ordering.
- **Empty directory display**: Empty directories (including orphans) are now shown in the sidebar with a "no notes/no exercises" placeholder.
- **Async content loading**: File selection is now synchronous while content loads asynchronously, eliminating first-render flicker.

### Fixed

- **Note flicker on reload**: Fixed the note content flicker on page reload.
- **Skeleton screen for empty content**: Fixed the skeleton loading screen incorrectly shown for files with empty content.

## [1.1.1] - 2026-06-18

### Added

- **File-to-URL sync**: Selecting a file in the sidebar now updates the browser URL (`?file=...&tab=...`), enabling shareable, bookmarkable links to specific notes and exercises.
- **Tab state persistence**: The sidebar tab selection (topics/exercises) persists across page reloads via the URL query parameter.

### Changed

- **Smart hot reload**: File changes no longer trigger a full page reload. Instead, a reactive `dataVersion` mechanism triggers component re-renders while preserving scroll position and UI state.
- **Tree auto-expand on reload**: The sidebar navigation tree now automatically expands to the node containing the currently selected file on page load, instead of always expanding the first domain.

### Fixed

- **Hot reload UX**: Eliminated disruptive full-page refreshes when editing notes or exercises. The page stays stable with scroll position preserved.
- **Sidebar state loss**: Fixed sidebar tab and tree expansion state being lost on page reload.

## [1.1.0] - 2026-06-18

### Added

- **Standalone API server** (`serve.mjs`): Extracted the serve API logic from the Vite plugin into a standalone server, providing cleaner separation between the dev server and data layer.

### Changed

- **HTTP API data layer**: Refactored `useTopicData.ts` to fetch topic data via HTTP API instead of static file imports, enabling dynamic data updates without rebuild.
- **Simplified vite.config.ts**: Removed the inline serve API plugin; the API server now runs independently via `serve.mjs`.
- **`bundle-site.mjs` refactored**: Streamlined the site build bundle script.

### Removed

- **Legacy modules**: Removed `files.ts` and `site-generator.ts` — their functionality has been absorbed into the new API server and build pipeline.

### Fixed

- **CI build**: Added `packages/cli/site/` to the pnpm workspace so its dependencies (vue, vue-router) are installed by CI, resolving a build failure.

## [1.0.0] - 2026-06-18

### Added

- **Visual learning site**: A custom Vue 3 + Vite application with Vue Router, Tailwind CSS v4, markdown-it, and highlight.js. Provides a rich visual interface to browse knowledge maps, session notes, and exercise files.
- **SiteGenerator class**: Writes front-end site files into `.peaches/` directory, with smart config overwrite rules and `--force` mode.
- **`serve` command**: `peaches serve [path]` generates the visual site, installs dependencies, and starts a Vite dev server with hot module replacement.
- **`--site` flag**: `peaches init --site` and `peaches update --site` generate the visual site alongside skill/command files.
- **Interactive site prompt**: `init` and `update` now prompt whether to generate the visual learning site in interactive mode.
- **Enhanced file scanning**: `sessions/*.md` and `exercises/*` files without subdirectory grouping are now supported and displayed as a flat list at the bottom of the sidebar.
- **Hot module replacement**: Modifying topic files (state.json, sessions, exercises) triggers automatic browser refresh.
- **New main specs**: `site-build`, `site-cli`, `site-generator`, `site-theme` specifications added.

### Changed

- **Monorepo structure**: `packages/cli/site/` now houses the standalone Vue 3 front-end app. Site files are bundled into `packages/cli/src/site/files.ts` at build time.
- **`.peaches/` layout**: Site files now live under `.peaches/site/`, separate from `.peaches/topics/`.

## [0.5.1] - 2026-06-16

### Added

- **Source location annotations**: Code examples in the explain workflow now include source file and line number references, helping the AI tutor provide precise cross-references during Socratic explanations.
- **Star History chart**: Added an embeddable Star History chart to all README files for better visual visibility of project growth.

## [0.5.0] - 2026-06-11

### Changed

- **Monorepo architecture**: Converted the project to a pnpm monorepo with `packages/cli` (published as `peaches`) and `packages/gui` (private, future GUI). Build, test, and lint commands now support per-package execution via `pnpm -F`.
- **Simplified build pipeline**: Replaced the custom `build.js` wrapper with direct `tsc` compilation, reducing indirection and making the build process more standard.

### Added

- **README enhancements**: Added badges, monorepo structure diagram, and footer to all READMEs for better visual polish and discoverability.

## [0.4.2] - 2026-06-10

### Fixed

- **YAML frontmatter compatibility for Codex**: Changed `Dual-mode:` to `Dual-mode (...)` in SKILL_DESCRIPTION to avoid colon being interpreted as a YAML key-value separator causing invalid frontmatter in Codex.

## [0.4.1] - 2026-06-09

### Added

- **Directory-based explanation storage**: Explanation sessions now store files organized by directory structure, matching the topic hierarchy in `state.json` for better session management and navigation.

## [0.4.0] - 2026-06-07

### Added

- **Learn Protocol v1**: `state.json` is now the single source of truth for all learning data, using a hierarchical knowledge map format (domains → concepts → details). The old dual-file model (state.yaml + hand-written knowledge-map.md) is replaced — `knowledge-map.md` is now a **generated artifact** produced by `render.mjs` from `state.json`, never edited directly. AI instructions explicitly forbid reading or writing `knowledge-map.md` as a data source.
- **Automatic v0→v1 migration**: Existing learning data is auto-migrated on `peaches init` or `update`, with backup files created for safety.
- **Schema validation**: `render.mjs` validates `state.json` against the v1 schema before generating `knowledge-map.md`, with clear error messages on field mismatches.
- **Status script**: New standalone `status.mjs` script reads `state.json` and outputs a formatted heatmap or topic summary, reducing AI token spend. Supports `--locale en|zh-CN` for i18n output.
- **Shared utils** (`utils.mjs`): Extracted shared types, validation, and helpers used by both `render.mjs` and `status.mjs`.

### Changed

- **Prompt compression**: Reduced skill template INSTRUCTIONS by ~69% (457 fewer lines) across 4 workflow templates, eliminating redundancy while preserving all functional behavior.
- **Unified learning icons**: Replaced mixed icon styles with a consistent colored circle set (🟢 🔵 🟠 ⚪) across `render.mjs`, migration code, skill templates, and test fixtures.
- **All 5 workflow templates** updated to read/write `state.json` only, dropping `knowledge-map.md` as a data source.

## [0.3.1] - 2026-06-07

### Added

- Optional Context7 MCP integration for documentation verification during `init`. When enabled, generated skill files (topic, explain, practice) include guidance instructing the AI to verify explanations against official documentation using Context7 MCP tools (`resolve-library-id` + `query-docs`).
- `--context7` / `--no-context7` CLI flags for non-interactive Context7 control.
- After init, displays a setup hint with a link to Context7 docs for manual MCP configuration.
- i18n support for Context7 prompts in both `en` and `zh-CN`.

## [0.3.0] - 2026-06-04

### Added

- CI workflow (GitHub Actions): lint, test, and build on every push and PR.
- Pre-commit hooks: Husky with lint-staged for ESLint, Prettier, and commitlint.

### Fixed

- Session files now written BEFORE echoing to conversation in `peaches:practice` and `peaches:explain` workflows, eliminating drift between saved content and chat output.
- Test path assertions made cross-platform compatible (Windows vs Unix path separators).

## [0.2.1] - 2026-05-30

### Fixed

- Relax `engines.node` from `>=20.19.0` to `>=20.0.0` for broader compatibility.

## [0.2.0] - 2026-05-29

### Added

- Dual-mode practice: Project Mode creates real code files in your IDE; Chat Mode for conceptual discussion.
- Persist learning session records for continuity across sessions.

### Fixed

- Reword session-save timing from "after" to "in the same turn" for clarity.

## [0.1.0] - 2026-05-28

### Added

- `peaches` CLI: generate skill and command files for 30+ AI coding tools.
- `init` command: interactive tool detection and selection, skill generation.
- `update` command: update existing skill files.
- Five learning workflows: topic, explain, practice, review, status.
- Locale support: English (`en`) and Chinese (`zh-CN`).
- MIT License.

[Unreleased]: https://github.com/0xClumzzy/peaches/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/0xClumzzy/peaches/compare/v1.6.3...v2.0.0
[1.6.3]: https://github.com/0xClumzzy/peaches/compare/v1.6.2...v1.6.3
[1.6.2]: https://github.com/0xClumzzy/peaches/compare/v1.6.1...v1.6.2
[1.6.1]: https://github.com/0xClumzzy/peaches/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/0xClumzzy/peaches/compare/v1.5.6...v1.6.0
[1.5.6]: https://github.com/0xClumzzy/peaches/compare/v1.5.5...v1.5.6
[1.5.5]: https://github.com/0xClumzzy/peaches/compare/v1.5.4...v1.5.5
[1.5.4]: https://github.com/0xClumzzy/peaches/compare/v1.5.3...v1.5.4
[1.5.3]: https://github.com/0xClumzzy/peaches/compare/v1.5.2...v1.5.3
[1.5.2]: https://github.com/0xClumzzy/peaches/compare/v1.5.1...v1.5.2
[1.5.1]: https://github.com/0xClumzzy/peaches/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/0xClumzzy/peaches/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/0xClumzzy/peaches/compare/v1.3.2...v1.4.0
[1.3.2]: https://github.com/0xClumzzy/peaches/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/0xClumzzy/peaches/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/0xClumzzy/peaches/compare/v1.2.2...v1.3.0
[1.2.2]: https://github.com/0xClumzzy/peaches/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/0xClumzzy/peaches/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/0xClumzzy/peaches/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/0xClumzzy/peaches/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/0xClumzzy/peaches/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/0xClumzzy/peaches/compare/v0.5.1...v1.0.0
[0.5.1]: https://github.com/0xClumzzy/peaches/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/0xClumzzy/peaches/compare/v0.4.2...v0.5.0
[0.4.2]: https://github.com/0xClumzzy/peaches/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/0xClumzzy/peaches/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/0xClumzzy/peaches/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/0xClumzzy/peaches/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/0xClumzzy/peaches/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/0xClumzzy/peaches/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/0xClumzzy/peaches/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/0xClumzzy/peaches/releases/tag/v0.1.0
