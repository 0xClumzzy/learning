<p align="center">
  <img src="./logo.png" alt="Peaches Logo" width="120" />
</p>

<h1 align="center">Peaches</h1>

<p align="center">
  <strong>Pick a topic. Grow into it.</strong><br />
  Turn your AI coding assistant into an interactive tutor — Socratic method &amp; TDD-style exercises.<br />
  <em>Now with a built-in visual learning dashboard.</em>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/peaches"><img src="https://img.shields.io/npm/v/peaches?color=blue&label=npm" alt="npm version" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D20.0-green" alt="Node.js" /></a>
  <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/pnpm-workspace-orange" alt="pnpm workspace" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License MIT" /></a>
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.zh-CN.md">中文</a>
</p>

---

## What is Peaches?

**Peaches** is an AI-powered recursive learning system that generates skill and command files for **30+ AI coding tools** — Claude Code, Cursor, Codex, OpenCode, and more. Once generated, your AI assistant gains six slash commands that guide you through systematically mastering any technical topic:

- 🧭 **Choose your own path** — AI generates a knowledge map; you decide what to learn next
- 🎓 **Recursive learning method** — Recursive explanations that follow your curiosity as deep as you want
- 🧪 **TDD-style practice** — Write real code with structured feedback, from beginner to challenge
- 📝 **Adaptive quizzes** — Quick text Q&A quizzes, graded and saved as reusable question decks
- 📊 **Spaced repetition** — Smart review that surfaces weak spots when you need them most
- 🔥 **Knowledge visualization** — Heatmap showing exactly where you stand
- 🖥️ **Visual Dashboard** — Browse knowledge maps, session notes, and exercises in a rich web interface

## Quick Start

```bash
# Interactive mode — auto-detects your AI tools and prompts you to choose
npx peaches init

# Target specific tools
npx peaches init --tools claude

# Or install globally
pnpm add -g peaches   # npm install -g peaches
peaches init
```

### Context7 Integration _(optional)_

During `init` or `update`, you'll be prompted to enable **Context7** for documentation verification. When enabled, the AI fetches official docs and cross-references its explanations against authoritative sources — dramatically improving teaching accuracy.

> **Setup:** Run `npx ctx7 setup` or visit the [Context7 docs](https://context7.com/docs/resources/all-clients) for your AI tool.

### After Init — Six Learning Commands

| Command                  | What it does                                                 |
| :----------------------- | :----------------------------------------------------------- |
| `/peaches:topic <name>`    | Initialize a topic, generate a knowledge map, track progress |
| `/peaches:explain <name>`  | Recursive learning method — go as deep as you want           |
| `/peaches:practice <name>` | TDD-style coding exercises with structured feedback          |
| `/peaches:review [name]`   | Spaced repetition review with personalized next-step plan    |
| `/peaches:status [name]`   | Knowledge map heatmap — mastery, practice counts, confidence |
| `/peaches:quiz <name>`     | Quick text Q&A quiz — graded and saved for re-practice       |

### Visual Learning Dashboard

Start a zero-config web dashboard to browse your learning data:

```bash
# Start the visual dashboard (no npm install needed)
npx peaches serve

# Custom port
npx peaches serve --port 8080

# Disable auto-open browser
npx peaches serve --no-open
```

> The dashboard is pre-built and shipped with the CLI — no extra dependencies or `npm install` required.
> If you installed globally, you can use `peaches serve` instead.

The dashboard provides:

- **Knowledge Map** — Markdown-rendered overview of your learning topic
- **Session Notes** — Browse and read all learning session notes organized by domain
- **Exercise Viewer** — View starter code, solutions, and practice results with syntax highlighting
- **Dark Mode** — Light/dark theme toggle
- **i18n** — Full English and Chinese interface
- **Hot Reload** — Auto-refresh when you add or modify topic files

## How It Works

`init` is a one-time, local generation step. There is no daemon and no account — Peaches writes plain files that your assistant reads as instructions. _(If you opt into Context7 during setup, your assistant will fetch official library docs from `context7.com`; that is the only network call, and it is optional.)_

**1. Generate.** Peaches writes a command file and a skill file for each of the six workflows, using whatever format your tool expects.

**2. Adopt a persona.** Each skill opens by casting your assistant into a specific Peaches role, so behaviour stays consistent no matter which tool you drive:

| Command           | Assistant becomes             | Effect                                                                        |
| :---------------- | :---------------------------- | :---------------------------------------------------------------------------- |
| `/peaches:topic`    | Peaches' _Knowledge Mentor_   | creates `state.json`, renders `knowledge-map.md`, sets up `sessions/`         |
| `/peaches:explain`  | Peaches' _Explanation Mentor_ | writes `sessions/<domain>/<concept>-<date>.md`, updates `state.json`          |
| `/peaches:practice` | Peaches' _Practice Coach_     | writes `exercises/<concept-slug>/…-practice-<date>.md`, updates `state.json`  |
| `/peaches:quiz`     | Peaches' _Quiz Coach_         | writes `quizzes/<concept-slug>/…-quiz-<timestamp>.json`, updates `state.json` |
| `/peaches:review`   | Peaches' _Learning Analyst_   | read-only — reads `state.json` and plans what to do next                      |
| `/peaches:status`   | Peaches' _Status Visualizer_  | read-only — runs the status script over `state.json`                          |

**3. Keep the state.** Every workflow updates `state.json`, which is what makes progress, spaced repetition, and the dashboard work later.

```
Your Project/
├── .claude/
│   ├── commands/peaches/          # Slash commands for Claude
│   └── skills/                  # Skill files with full workflow instructions
├── .cursor/commands/            # Cursor-specific command format
├── .gemini/commands/peaches/      # Gemini TOML-format commands
├── .codex/prompts/              # Codex prompt files
│   ...                          # (30+ other tool formats)
│
├── .peaches/                      # 🍑 Your learning data lives here
│   └── topics/
│       └── typescript/
│           ├── state.json           # Single source of truth
│           ├── knowledge-map.md     # Auto-rendered from state.json
│           ├── sessions/            # Session history for spaced repetition
│           ├── exercises/           # TDD-style coding exercises
│           └── quizzes/             # Reusable text Q&A question decks
└── ...
```

Each AI tool receives **tool-appropriate file formats** via an adapter pattern — YAML frontmatter for Claude, TOML for Gemini, Markdown for Cursor, etc.

> Your `.peaches/` directory is plain Markdown and JSON, so it is safe in git and readable without Peaches installed.

## Monorepo Structure

```
peaches/
├── packages/
│   ├── cli/                     # peaches — published to npm
│   │   ├── site/                 # Dashboard source (Vue 3 + Vite)
│   │   ├── scripts/              # Build scripts (bundle-site.mjs)
│   │   ├── src/
│   │   │   ├── cli/             # Commander.js CLI entry point
│   │   │   ├── core/            # init, config, command generation, templates
│   │   │   ├── i18n/            # en + zh-CN locales
│   │   │   └── utils/           # Filesystem, interactive helpers
│   │   ├── bin/                 # peaches binary
│   │   └── package.json
│   └── gui/                     # peaches-gui — coming soon 🚧
│       └── README.md
├── pnpm-workspace.yaml          # pnpm workspace config
├── tsconfig.base.json           # Shared compiler options
├── package.json                 # Workspace root (private)
└── pnpm-lock.yaml
```

| Package                                | npm                                                                                                                    | Description                                              |
| :------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------- |
| [`peaches`](./packages/cli) | [![npm](https://img.shields.io/npm/v/peaches?color=blue)](https://www.npmjs.com/package/peaches) | CLI tool — generate skill/command files for 30+ AI tools |
| `peaches-gui`                   | _private_                                                                                                              | Graphical desktop interface _(in development)_           |

## Supported AI Tools

> Manage, Amazon Q Developer, Antigravity, Auggie, Bob Shell, Claude Code, Cline, Codex, ForgeCode, CodeBuddy Code, Continue, CoStrict, Crush, Cursor, Factory Droid, Gemini CLI, GitHub Copilot, iFlow, Junie, Kilo Code, Kiro, OpenCode, Pi, Qoder, Lingma, Qwen Code, RooCode, Trae, Windsurf, and AGENTS.md-compatible assistants.

```bash
# Update existing skill files to the latest version (auto-detects installed tools)
npx peaches update
```

## Development

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9

### Setup

```bash
git clone https://github.com/ChenChenyaqi/peaches.git
cd peaches
pnpm install
```

### Commands

| Command           | Description                          |
| :---------------- | :----------------------------------- |
| `pnpm build`      | Build all packages (`tsc`)           |
| `pnpm test`       | Run all tests (`vitest run`)         |
| `pnpm test:watch` | Run tests in watch mode              |
| `pnpm dev`        | TypeScript watch mode (all packages) |
| `pnpm lint`       | Lint all packages (`eslint`)         |
| `pnpm format`     | Format code (`prettier`)             |
| `pnpm dev:site`   | Dev server for the visual dashboard  |

### Per-Package Commands

```bash
pnpm -F peaches build      # Build only CLI
pnpm -F peaches test       # Test only CLI
pnpm -F peaches dev:cli    # Build and run CLI locally
```

## Star History

<a href="https://star-history.dera.page/#ChenChenyaqi/peaches&type=date&legend=top-left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://star-history.dera.page/svg?repos=ChenChenyaqi/peaches&type=date&theme=dark&legend=top-left" />
    <source media="(prefers-color-scheme: light)" srcset="https://star-history.dera.page/svg?repos=ChenChenyaqi/peaches&type=date&legend=top-left" />
    <img alt="Star History Chart" src="https://star-history.dera.page/svg?repos=ChenChenyaqi/peaches&type=date&legend=top-left" />
  </picture>
</a>

## License

[MIT](./LICENSE) © [yaqi chen](https://github.com/ChenChenyaqi)

---

<p align="center">
  <sub>Built with ❤️ for curious minds · <a href="https://github.com/ChenChenyaqi/peaches">GitHub</a> · <a href="./CONTRIBUTING.md">Contributing</a> · <a href="./CHANGELOG.md">Changelog</a></sub>
</p>
