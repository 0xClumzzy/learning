# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Peaches is a CLI tool (published as `peaches`, binary `peaches`) that generates skill and command files for AI coding assistants, turning them into interactive learning tutors. It supports 28 AI tools (Claude Code, Cursor, Gemini CLI, Codex, Copilot, Windsurf, etc.).

**English only**: `SupportedLocale` is `'en'` and there is no `--lang` flag. `getMessages()` takes an optional locale and always returns the `en` table; the i18n layer is retained as a seam so a future locale is additive. The generated skill/command content is likewise English-only — each template opens with a preamble telling the assistant to reply in whatever language the user writes in.

Peaches is a **security curriculum** covering the full spectrum: AppSec/defensive, offensive, cryptography, and foundations. Every offensive concept is taught paired with its defence and detection signal, and all labs run locally or against deliberately vulnerable targets.

The generated skills implement 7 workflows: **next** (pick one next step and start it), topic (start/resume a security topic; the map grows one concept at a time), explain (recursive Socratic deep-dive), practice (security labs: find it / build it / harden it / read the evidence), review (what to reinforce next), status (heatmap of touched concepts only), and quiz (five-question decks).

**Built for chronic ADHD.** Ten interaction rules live in a single exported constant, `ADHD_PROTOCOL` in `packages/cli/src/core/templates/workflows/_shared.ts`, and every workflow template imports it alongside `SECURITY_SCOPE`. The rules: one action instead of a menu, a five-minute floor, one concept at a time, resume rather than re-orient, lapses cost nothing (no streaks or "days ago"), never show a wall of unfinished work, close the loop, respect the stop, assume competence, and keep every session interruptible. `test/skill-templates.test.ts` fails the build if any workflow drops either shared block or reintroduces lapse-guilt language.

## Commands

```bash
pnpm build          # Compile TypeScript via tsc (runs node build.js in each package)
pnpm dev            # tsc --watch (all packages)
pnpm test           # Run all tests once (vitest run) across all packages
pnpm test:watch     # Run tests in watch mode (vitest) across all packages
pnpm lint           # ESLint on packages/
# Per-package commands:
pnpm -F peaches build     # Build only the CLI package
pnpm -F peaches test      # Test only the CLI package
```

## Architecture (monorepo)

```
packages/
  cli/                  # Published as `peaches`
    src/
      cli/index.ts          # Commander.js CLI: `peaches init [path]` and `peaches update [path]`
      core/
        init.ts             # InitCommand — orchestrates tool detection, interactive selection,
                            #   skill generation, and command generation
        config.ts           # AI_TOOLS array (29 entries, 28 with skillsDir), PEACHES_DIR
        command-generation/ # Adapter pattern: each tool has an adapter that knows its file format
                            #   and directory conventions (Claude → .claude/commands/, YAML frontmatter;
                            #   Gemini → .gemini/commands/, TOML; Codex → ~/.codex/prompts/)
          types.ts          # CommandContent, ToolCommandAdapter, GeneratedCommand interfaces
          registry.ts       # CommandAdapterRegistry — maps tool IDs → adapters
          generator.ts      # generateCommand / generateCommands — applies adapter to content
          adapters/         # claude.ts, cursor.ts, codex.ts, gemini.ts
        templates/
          types.ts          # SkillTemplate, CommandTemplate interfaces
          skill-templates.ts # Re-exports all 7 workflow template getters
          workflows/        # peaches-next.ts, peaches-topic.ts, peaches-explain.ts,
                            #   peaches-practice.ts, peaches-review.ts, peaches-status.ts,
                            #   peaches-quiz.ts, plus _shared.ts (ADHD_PROTOCOL, SECURITY_SCOPE)
                            #   Each exports getXxxSkillTemplate() and getXxxCommandTemplate()
                            #   with NO arguments — content is English-only, see Localization scope above
        shared/
          skill-generation.ts  # Aggregates templates; generateSkillContent() writes YAML frontmatter
      i18n/
        index.ts            # getMessages(locale), detectSystemLocale(), resolveLocale()
        types.ts            # LocaleMessages, SkillsMessages, CLIMessages, InitMessages types
        locales/
          en.ts             # CLI strings, init/serve messages (only locale)
      utils/
        file-system.ts      # ensureDir, writeFile, fileExists, dirExists, removeDir
        interactive.ts      # isInteractive() — checks process.stdin/stdout.isTTY
    site/                 # The visual learning dashboard (Vue 3 + Vite, private)
    scripts/
      bundle-site.mjs     # Builds site/ → site-dist/, published inside the CLI
openspec/               # Spec-driven change proposals + capability specs
```

### Key Patterns

- **English only**: `SupportedLocale` is `'en'`. `getMessages()` takes an optional locale and always returns the `en` table. Adding a locale means a new `locales/<code>.ts`, a `SUPPORTED_LOCALES` entry, and a `--lang` option — none of which exist today.
- **Adapter pattern for multi-tool output**: adding support for a new AI tool means creating a new adapter in `command-generation/adapters/` that implements `ToolCommandAdapter` (specifying file path conventions and file format) and registering it.
- **Shared data in `./.peaches/`**: the CLI creates `./.peaches/topics/` in the project directory for learning state that stays with the project.
- **Interactive by default**: when no `--tools` flag is passed and stdin/stdout are TTYs, `peaches init` shows an interactive checkbox prompt (via `@inquirer/prompts`) with detected tools pre-selected.

### Adding a new AI tool

1. Add an entry to `AI_TOOLS` in `packages/cli/src/core/config.ts` with the tool's `skillsDir` path.
2. If the tool has custom command file conventions, create an adapter in `packages/cli/src/core/command-generation/adapters/` and register it in `packages/cli/src/core/command-generation/adapters/index.ts` and `registry.ts`.
