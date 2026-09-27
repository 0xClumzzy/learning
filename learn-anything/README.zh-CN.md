<p align="center">
  <img src="./logo.png" alt="Peaches Logo" width="120" />
</p>

<h1 align="center">Peaches</h1>

<p align="center">
  <strong>Pick a topic. Grow into it.</strong><br />
  将你的 AI 编程助手变成交互式导师 — 苏格拉底式教学法 · TDD 风格练习<br />
  <em>现已内置可视化学习仪表盘。</em>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/peaches"><img src="https://img.shields.io/npm/v/peaches?color=blue&label=npm" alt="npm 版本" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node-%3E%3D20.0-green" alt="Node.js" /></a>
  <a href="https://pnpm.io/"><img src="https://img.shields.io/badge/pnpm-workspace-orange" alt="pnpm workspace" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="许可证 MIT" /></a>
</p>

<p align="center">
  <a href="./README.md">English</a> · <a href="./README.zh-CN.md">中文</a>
</p>

---

## 什么是 Peaches？

**Peaches** 是一个 AI 驱动的递归学习系统，为 **30+ 种 AI 编程工具**（Claude Code、Cursor、Codex、OpenCode 等）生成 skill 和 command 文件。安装后，你的 AI 助手获得六个斜杠命令，引导你系统性掌握任何技术主题：

- 🧭 **自主选择路径** — AI 生成知识图谱，你来决定学什么
- 🎓 **递归学习法** — 递归讲解跟随你的好奇心，想挖多深就多深
- 🧪 **TDD 风格练习** — 写真实代码，获结构化反馈，从入门到挑战
- 📝 **自适应测验** — 快速文字问答测验，批改后保存为可复用题库
- 📊 **间隔重复** — 智能复习，在最佳时机帮你巩固薄弱环节
- 🔥 **知识可视化** — 热力图直观展示你的掌握状态
- 🖥️ **可视化仪表盘** — 在丰富的 Web 界面中浏览知识图谱、笔记和练习

## 快速开始

```bash
# 交互模式 — 自动检测你的 AI 工具并提示选择
npx peaches init

# 指定工具
npx peaches init --tools claude

# 或全局安装
pnpm add -g peaches   # npm install -g peaches
peaches init
```

### Context7 集成 _(可选)_

执行 `init` 或 `update` 时会提示是否启用 **Context7** 文档验证。启用后，AI 会获取官方文档并对照权威来源验证其讲解内容——大幅提高教学准确性。

> **安装：** 运行 `npx ctx7 setup` 或访问 [Context7 文档](https://context7.com/docs/resources/all-clients) 查看你的 AI 工具的配置方式。

### 安装后 — 六个学习命令

| 命令                     | 功能                                      |
| :----------------------- | :---------------------------------------- |
| `/peaches:topic <名称>`    | 初始化主题，生成知识图谱，跟踪进度        |
| `/peaches:explain <名称>`  | 递归式学习法 — 想挖多深就挖多深           |
| `/peaches:practice <名称>` | TDD 风格编码练习，结构化反馈              |
| `/peaches:review [名称]`   | 间隔重复复习，个性化下一步计划            |
| `/peaches:status [名称]`   | 知识图谱热力图 — 掌握度、练习次数、信心分 |
| `/peaches:quiz <名称>`     | 快速文字问答测验 — 批改并保存，可反复练习 |

### 可视化学习仪表盘

一键启动零配置的 Web 仪表盘来浏览你的学习数据：

```bash
# 启动可视化仪表盘（无需 npm install）
npx peaches serve

# 自定义端口
npx peaches serve --port 8080

# 禁止自动打开浏览器
npx peaches serve --no-open
```

> 仪表盘已在 CLI 中预构建并随包发布 — 无需额外依赖或 `npm install`。
> 如果已全局安装，也可以使用 `peaches serve`。

仪表盘提供：

- **知识图谱** — Markdown 渲染的学习主题总览
- **学习笔记** — 按知识域分类浏览所有学习会话笔记
- **练习预览** — 带语法高亮查看起始代码、参考解答和练习记录
- **暗色模式** — 明/暗主题切换
- **国际化** — 完整的中英文界面
- **热更新** — 添加或修改主题文件时自动刷新浏览器

## 工作原理

`init` 是一次性的本地生成步骤。没有守护进程，也不需要账号——Peaches 只是把纯文本文件写进项目里，让你的 AI 助手把它们当作指令来读。_（如果你在安装时启用了 Context7，助手会从 `context7.com` 拉取官方库文档；这是唯一的网络请求，且是可选的。）_

**1. 生成。** Peaches 为六个工作流各写入一个 command 文件和一个 skill 文件，并自动适配你所用的工具格式。

**2. 设定角色。** 每个 skill 都会先把你的助手代入一个特定的 Peaches 角色，这样无论你用哪个工具，行为都保持一致：

| 命令              | 助手扮演                      | 效果                                                                     |
| :---------------- | :---------------------------- | :----------------------------------------------------------------------- |
| `/peaches:topic`    | Peaches' _Knowledge Mentor_   | 创建 `state.json`，渲染 `knowledge-map.md`，建立 `sessions/` 目录        |
| `/peaches:explain`  | Peaches' _Explanation Mentor_ | 写入 `sessions/<domain>/<concept>-<date>.md`，更新 `state.json`          |
| `/peaches:practice` | Peaches' _Practice Coach_     | 写入 `exercises/<concept-slug>/…-practice-<date>.md`，更新 `state.json`  |
| `/peaches:quiz`     | Peaches' _Quiz Coach_         | 写入 `quizzes/<concept-slug>/…-quiz-<timestamp>.json`，更新 `state.json` |
| `/peaches:review`   | Peaches' _Learning Analyst_   | 只读——读取 `state.json` 并规划下一步                                     |
| `/peaches:status`   | Peaches' _Status Visualizer_  | 只读——对 `state.json` 运行状态脚本                                       |

**3. 留存状态。** 每个工作流都会更新 `state.json`，正是它让学习进度、间隔重复和仪表盘在之后依然可用。

```
你的项目/
├── .claude/
│   ├── commands/peaches/          # Claude 专用斜杠命令
│   └── skills/                  # 包含完整工作流指令的 skill 文件
├── .cursor/commands/            # Cursor 专用命令格式
├── .gemini/commands/peaches/      # Gemini TOML 格式命令
├── .codex/prompts/              # Codex prompt 文件
│   ...                          # （30+ 种工具各有对应格式）
│
├── .peaches/                      # 🍑 你的学习数据存在这里
│   └── topics/
│       └── typescript/
│           ├── state.json           # 唯一数据源
│           ├── knowledge-map.md     # 由 state.json 自动渲染
│           ├── sessions/            # 会话历史，用于间隔重复
│           ├── exercises/           # TDD 风格编码练习
│           └── quizzes/             # 可复用的文字问答题库
└── ...
```

每个 AI 工具通过**适配器模式**获得对应格式的文件——Claude 用 YAML frontmatter，Gemini 用 TOML，Cursor 用 Markdown 等。

> `.peaches/` 目录就是纯 Markdown 和 JSON，可以安全地提交到 git，不装 Peaches 也能直接阅读。

## 仓库结构

```
peaches/
├── packages/
│   ├── cli/                     # peaches — 发布到 npm
│   │   ├── site/                 # 仪表盘源码 (Vue 3 + Vite)
│   │   ├── scripts/              # 构建脚本 (bundle-site.mjs)
│   │   ├── src/
│   │   │   ├── cli/             # Commander.js CLI 入口
│   │   │   ├── core/            # 初始化、配置、命令生成、模板
│   │   │   ├── i18n/            # en + zh-CN 多语言
│   │   │   └── utils/           # 文件系统、交互式帮助函数
│   │   ├── bin/                 # peaches 可执行文件
│   │   └── package.json
│   └── gui/                     # peaches-gui — 开发中 🚧
│       └── README.md
├── pnpm-workspace.yaml          # pnpm workspace 配置
├── tsconfig.base.json           # 共享 TypeScript 编译选项
├── package.json                 # 工作区根配置（私有）
└── pnpm-lock.yaml
```

| 包                                     | npm                                                                                                                    | 说明                                             |
| :------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------- |
| [`peaches`](./packages/cli) | [![npm](https://img.shields.io/npm/v/peaches?color=blue)](https://www.npmjs.com/package/peaches) | CLI 工具 — 为 30+ AI 工具生成 skill/command 文件 |
| `peaches-gui`                   | _私有_                                                                                                                 | 图形化桌面界面 _(开发中)_                        |

## 支持的 AI 工具

> Manage、Amazon Q Developer、Antigravity、Auggie、Bob Shell、Claude Code、Cline、Codex、ForgeCode、CodeBuddy Code、Continue、CoStrict、Crush、Cursor、Factory Droid、Gemini CLI、GitHub Copilot、iFlow、Junie、Kilo Code、Kiro、OpenCode、Pi、Qoder、Lingma、Qwen Code、RooCode、Trae、Windsurf 及兼容 AGENTS.md 的助手。

```bash
# 更新已有 skill 文件到最新版本（自动检测已安装的工具）
npx peaches update
```

## 开发

### 前置条件

- **Node.js** ≥ 20
- **pnpm** ≥ 9

### 环境搭建

```bash
git clone https://github.com/ChenChenyaqi/peaches.git
cd peaches
pnpm install
```

### 常用命令

| 命令              | 说明                          |
| :---------------- | :---------------------------- |
| `pnpm build`      | 构建所有包 (`tsc`)            |
| `pnpm test`       | 运行所有测试 (`vitest run`)   |
| `pnpm test:watch` | 监听模式运行测试              |
| `pnpm dev`        | TypeScript 监听模式（所有包） |
| `pnpm lint`       | 代码检查 (`eslint`)           |
| `pnpm format`     | 格式化代码 (`prettier`)       |
| `pnpm dev:site`   | 可视化仪表盘开发服务器        |

### 单独包命令

```bash
pnpm -F peaches build      # 仅构建 CLI
pnpm -F peaches test       # 仅测试 CLI
pnpm -F peaches dev:cli    # 构建并在本地运行 CLI
```

## Star History

<a href="https://star-history.dera.page/#ChenChenyaqi/peaches&type=date&legend=top-left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://star-history.dera.page/svg?repos=ChenChenyaqi/peaches&type=date&theme=dark&legend=top-left" />
    <source media="(prefers-color-scheme: light)" srcset="https://star-history.dera.page/svg?repos=ChenChenyaqi/peaches&type=date&legend=top-left" />
    <img alt="Star History Chart" src="https://star-history.dera.page/svg?repos=ChenChenyaqi/peaches&type=date&legend=top-left" />
  </picture>
</a>

## 许可证

[MIT](./LICENSE) © [yaqi chen](https://github.com/ChenChenyaqi)

---

<p align="center">
  <sub>用 ❤️ 为好奇心构建 · <a href="https://github.com/ChenChenyaqi/peaches">GitHub</a> · <a href="./CONTRIBUTING.md">贡献指南</a> · <a href="./CHANGELOG.md">更新日志</a></sub>
</p>
