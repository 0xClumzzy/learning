import path from 'path';
import chalk from 'chalk';
import * as fs from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { FileSystemUtils } from '../utils/file-system.js';
import { AI_TOOLS, AIToolOption, PEACHES_DIR, PREFERRED_TOOL } from './config.js';
import { isInteractive } from '../utils/interactive.js';
import { generateCommands, CommandAdapterRegistry } from './command-generation/index.js';
import { getSkillTemplates, getCommandContents, generateSkillContent } from './shared/index.js';
import { getMessages } from '../i18n/index.js';
import { CONTEXT7_GUIDANCE } from './templates/context7-guidance.js';

const require = createRequire(import.meta.url);
const { version: VERSION } = require('../../package.json');

type InitCommandOptions = {
  tools?: string;
  force?: boolean;
  update?: boolean;
  context7?: boolean;
};

export class InitCommand {
  private readonly toolsArg?: string;
  private readonly force: boolean;
  private readonly isUpdate: boolean;
  private readonly context7Arg?: boolean;
  private context7Enabled: boolean = false;
  /** Compiled scripts read once up front, keyed by filename. */
  private scriptCache: Map<string, string> | null = null;

  constructor(options: InitCommandOptions = {}) {
    this.toolsArg = options.tools;
    this.force = options.force ?? false;
    this.isUpdate = options.update ?? false;
    this.context7Arg = options.context7;
  }

  async execute(targetPath: string = '.'): Promise<void> {
    const resolvedPath = path.resolve(targetPath);
    const m = getMessages();

    // Ensure target directory exists
    await FileSystemUtils.ensureDir(resolvedPath);

    // Create .peaches/ directory in the target project
    const peachesDir = path.join(resolvedPath, PEACHES_DIR);
    const topicsDir = path.join(peachesDir, 'topics');
    await FileSystemUtils.ensureDir(topicsDir);

    // Run v0→v1 migration for any existing learning data
    const { migrateAll } = await import('./peaches-protocol/index.js');
    const report = await migrateAll(topicsDir);
    if (report.migratedCount > 0) {
      console.log(chalk.green(m.init.migrationComplete(report.migratedCount)));
    }

    console.log(chalk.bold(m.init.header));

    // Detect available tools
    const availableTools = await this.detectTools(resolvedPath);

    // Select tools
    let selectedTools: AIToolOption[];
    if (this.toolsArg === 'all') {
      selectedTools = availableTools.filter((t) => t.available);
    } else if (this.toolsArg === 'none') {
      selectedTools = [];
    } else if (this.toolsArg) {
      const toolIds = this.toolsArg.split(',').map((t) => t.trim());
      selectedTools = availableTools.filter((t) => toolIds.includes(t.value));
    } else if (this.isUpdate || !isInteractive()) {
      // Update mode or non-interactive: auto-detect existing tool dirs
      selectedTools = availableTools.filter((t) => t.available && this.hasToolDir(resolvedPath, t));
    } else {
      selectedTools = await this.interactiveSelect(resolvedPath, availableTools);
    }

    /* Read every script we are about to copy BEFORE writing any skill file.
       A missing dist/scripts/*.mjs used to throw from inside the per-tool
       loop, leaving half-populated skill dirs behind and no explanation. */
    if (selectedTools.some((t) => t.skillsDir)) {
      this.scriptCache = this.preloadCompiledScripts();
    }

    if (selectedTools.length === 0) {
      console.log(chalk.yellow(m.init.noToolsSelected));
      console.log(
        chalk.dim(
          m.init.availableTools(
            [
              PREFERRED_TOOL,
              ...availableTools
                .filter((t) => t.available && t.value !== PREFERRED_TOOL)
                .map((t) => t.value),
            ].join(', '),
          ),
        ),
      );
      return;
    }

    // Context7 setup
    this.context7Enabled = await this.promptContext7();
    if (this.context7Enabled) {
      console.log(chalk.dim(m.init.context7Enabled));
    }

    console.log('');

    // Generate skill files for each tool
    for (const tool of selectedTools) {
      if (!tool.skillsDir) continue;
      await this.generateSkillsForTool(resolvedPath, tool);
      await this.generateCommandsForTool(resolvedPath, tool);
      console.log(chalk.green(m.init.skillGenerated(tool.name, getSkillTemplates().length)));
    }

    console.log('');
    console.log(chalk.bold(m.init.initComplete));
    console.log(chalk.dim(m.init.globalDataPath(PEACHES_DIR)));
    console.log(chalk.dim(m.init.startLearning('/peaches:next')));

    console.log(chalk.bold(m.init.availableCommands));
    const cmd = m.init.cmdLine;
    const pad = (s: string) => s.padEnd(34);
    // A distinct marker per row, so the list is scannable at a glance. Kept
    // light on purpose: this is the first screen a new user sees.
    const rows: Array<[string, string, string]> = [
      ['✦', '/peaches:next', 'one next step, started for you'],
      ['▪', '/peaches:topic <topic-name>', 'start or resume a security topic'],
      ['◦', '/peaches:explain <concept-name>', 'the mechanism, attack and defence'],
      ['❖', '/peaches:practice <concept-name>', 'security labs, run locally'],
      ['◇', '/peaches:review [topic-name]', 'what to reinforce next'],
      ['▸', '/peaches:status [topic-name]', 'heatmap of what you have under way'],
      ['◉', '/peaches:quiz <concept-name>', 'quick quiz, saved for re-practice'],
    ];
    for (const [glyph, name, desc] of rows) {
      console.log(cmd(chalk.cyan(` ${glyph} ` + pad(name)), chalk.dim(desc)));
    }
    console.log('');

    if (this.context7Enabled) {
      console.log(chalk.dim(m.init.context7SetupHint));
      console.log('');
    }
  }

  private async promptContext7(): Promise<boolean> {
    const m = getMessages();

    if (this.context7Arg === true) return true;
    if (this.context7Arg === false) return false;

    if (!isInteractive()) return true;

    const { confirm } = await import('@inquirer/prompts');
    return confirm({ message: m.init.context7Prompt, default: true });
  }

  private async detectTools(_resolvedPath: string): Promise<AIToolOption[]> {
    return AI_TOOLS;
  }

  private hasToolDir(resolvedPath: string, tool: AIToolOption): boolean {
    if (!tool.skillsDir) return false;
    const dirPath = path.join(resolvedPath, tool.skillsDir);
    try {
      return fs.statSync(dirPath).isDirectory();
    } catch {
      return false;
    }
  }

  private async interactiveSelect(
    resolvedPath: string,
    tools: AIToolOption[],
  ): Promise<AIToolOption[]> {
    const availableTools = tools.filter((t) => t.available && t.skillsDir);
    const { checkbox } = await import('@inquirer/prompts');

    /* Detect against the target project, not process.cwd() — `peaches init
       ../other-project` must pre-select based on the tree it writes into. */
    const detected = availableTools.filter((t) => this.hasToolDir(resolvedPath, t));
    const detectedValues = new Set(detected.map((t) => t.value));

    /* With nothing detected, still pre-select the primary target, so the common
       case is a single Enter. OpenCode is checked by default. */
    if (detectedValues.size === 0) detectedValues.add(PREFERRED_TOOL);

    /* OpenCode first, everything else alphabetical after it. */
    const ordered = [
      ...availableTools.filter((t) => t.value === PREFERRED_TOOL),
      ...availableTools
        .filter((t) => t.value !== PREFERRED_TOOL)
        .sort((a, b) => a.name.localeCompare(b.name)),
    ];

    const choices = ordered.map((t) => ({
      name: t.name,
      value: t.value,
      checked: detectedValues.has(t.value),
    }));

    const selected = await checkbox({
      message: getMessages().init.interactiveSelectPrompt,
      choices,
      pageSize: 15,
    });

    return availableTools.filter((t) => selected.includes(t.value));
  }

  private async generateSkillsForTool(resolvedPath: string, tool: AIToolOption): Promise<void> {
    const skillTemplates = getSkillTemplates();

    for (const entry of skillTemplates) {
      const skillDir = path.join(resolvedPath, tool.skillsDir!, 'skills', entry.dirName);
      const skillFile = path.join(skillDir, 'SKILL.md');
      const content = generateSkillContent(
        entry.template,
        VERSION,
        this.context7Enabled && isDocVerificationTemplate(entry.workflowId)
          ? injectContext7Guidance
          : undefined,
      );
      await FileSystemUtils.writeFile(skillFile, content);

      const scriptsDir = path.join(skillDir, 'scripts');

      // Keyed on workflowId, never on dirName: a workflow that is added later
      // cannot silently lose its scripts because a name string drifted.
      const id = entry.workflowId;

      // topic / explain / practice / quiz → utils.mjs + render.mjs
      if (RENDER_WORKFLOWS.has(id)) {
        await FileSystemUtils.writeFile(
          path.join(scriptsDir, 'utils.mjs'),
          this.readCompiledScript('utils.mjs'),
        );
        await FileSystemUtils.writeFile(
          path.join(scriptsDir, 'render.mjs'),
          this.readCompiledScript('render.mjs'),
        );
      }
      // quiz -> validate-quiz.mjs (deck validation)
      if (id === 'quiz') {
        await FileSystemUtils.writeFile(
          path.join(scriptsDir, 'validate-quiz.mjs'),
          this.readCompiledScript('validate-quiz.mjs'),
        );
      }
      // topic -> init-sessions.mjs
      if (id === 'topic') {
        await FileSystemUtils.writeFile(
          path.join(scriptsDir, 'init-sessions.mjs'),
          this.readCompiledScript('init-sessions.mjs'),
        );
      }

      // status → utils.mjs + status.mjs
      if (id === 'status') {
        await FileSystemUtils.writeFile(
          path.join(scriptsDir, 'utils.mjs'),
          this.readCompiledScript('utils.mjs'),
        );
        await FileSystemUtils.writeFile(
          path.join(scriptsDir, 'status.mjs'),
          this.readCompiledScript('status.mjs'),
        );
      }

      // review and next → no scripts needed
    }
  }

  /** Read a compiled script from dist/scripts/ (bundled alongside this module). */
  private readCompiledScript(filename: string): string {
    const cached = this.scriptCache?.get(filename);
    if (cached !== undefined) return cached;

    const scriptPath = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '..',
      'scripts',
      filename,
    );
    return fs.readFileSync(scriptPath, 'utf-8');
  }

  /**
   * Read every script any workflow can reference, up front, so a broken or
   * partially-installed build fails once with a clear message instead of
   * half way through writing skills.
   */
  private preloadCompiledScripts(): Map<string, string> {
    const cache = new Map<string, string>();
    const scriptsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts');

    for (const filename of COMPILED_SCRIPTS) {
      const scriptPath = path.join(scriptsDir, filename);
      try {
        cache.set(filename, fs.readFileSync(scriptPath, 'utf-8'));
      } catch (err) {
        const m = getMessages();
        console.error(chalk.red(m.init.missingCompiledScript(filename, scriptPath)));
        if (err instanceof Error) console.error(chalk.dim(err.message));
        process.exit(1);
      }
    }
    return cache;
  }

  private async generateCommandsForTool(resolvedPath: string, tool: AIToolOption): Promise<void> {
    const adapter = CommandAdapterRegistry.get(tool.value);
    if (!adapter) return;

    const commandContents = getCommandContents();
    const generatedCommands = generateCommands(commandContents, adapter);

    for (const cmd of generatedCommands) {
      const filePath = path.resolve(resolvedPath, cmd.path);
      await FileSystemUtils.writeFile(filePath, cmd.fileContent);
    }
  }
}

const DOC_VERIFICATION_WORKFLOWS = new Set(['topic', 'explain', 'practice', 'quiz']);

/** Workflows that get the shared `utils.mjs` + `render.mjs` pair. */
const RENDER_WORKFLOWS = new Set(['topic', 'explain', 'practice', 'quiz']);

/**
 * Every script copied into a generated skill directory. Preloaded before
 * any file is written so a missing script fails the whole run cleanly.
 */
const COMPILED_SCRIPTS = [
  'utils.mjs',
  'render.mjs',
  'validate-quiz.mjs',
  'status.mjs',
  'init-sessions.mjs',
];

function isDocVerificationTemplate(workflowId: string): boolean {
  return DOC_VERIFICATION_WORKFLOWS.has(workflowId);
}

function injectContext7Guidance(instructions: string): string {
  const marker = '\n## Command:';
  const index = instructions.indexOf(marker);
  if (index === -1) return instructions + CONTEXT7_GUIDANCE;
  return instructions.slice(0, index) + CONTEXT7_GUIDANCE + instructions.slice(index);
}
