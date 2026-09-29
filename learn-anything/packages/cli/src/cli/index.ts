import { Command } from 'commander';
import { createRequire } from 'module';
import path from 'path';
import { promises as fs } from 'fs';
import chalk from 'chalk';
import { AI_TOOLS } from '../core/config.js';
import { getMessages } from '../i18n/index.js';

const program = new Command();
const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

/* Peaches ships in English only, so there is no locale to sniff before
   Commander parses and every message comes from the single `en` table. */
const m = getMessages();
const mc = m.cli;

program.name('peaches').description(mc.programDescription).version(version);

const availableToolIds = AI_TOOLS.filter((tool) => tool.skillsDir).map((tool) => tool.value);

program
  .command('init [path]')
  .description(mc.initCommandDescription)
  .option('--tools <tools>', mc.toolsOptionDescription(availableToolIds.join(', ')))
  .option('--force', mc.forceOption)
  .option('--context7', 'Enable Context7 documentation verification')
  .option('--no-context7', 'Disable Context7 documentation verification')
  .action(
    async (
      targetPath = '.',
      options?: {
        tools?: string;
        force?: boolean;
        context7?: boolean;
      },
    ) => {
      try {
        const resolvedPath = path.resolve(targetPath);

        try {
          const stats = await fs.stat(resolvedPath);
          if (!stats.isDirectory()) {
            throw new Error(mc.notDirectory(targetPath));
          }
        } catch (error: any) {
          if (error.code === 'ENOENT') {
            console.log(chalk.yellow(mc.dirNotExist(targetPath)));
          } else if (error.message && error.message.includes('not a directory')) {
            throw error;
          } else {
            throw new Error(mc.cannotAccess(targetPath, error.message), { cause: error });
          }
        }

        const { InitCommand } = await import('../core/init.js');
        const initCommand = new InitCommand({
          tools: options?.tools,
          force: options?.force,
          context7: options?.context7,
        });
        await initCommand.execute(targetPath);
        console.log(chalk.dim(mc.serveHint));
      } catch (error) {
        console.log();
        console.error(chalk.red(mc.errorPrefix((error as Error).message)));
        process.exit(1);
      }
    },
  );

program
  .command('update [path]')
  .description(mc.updateCommandDescription)
  .option('--tools <tools>', mc.toolsOptionDescription(availableToolIds.join(', ')))
  .option('--force', mc.forceOption)
  .action(async (targetPath = '.', options?: { tools?: string; force?: boolean }) => {
    try {
      const resolvedPath = path.resolve(targetPath);

      try {
        const stats = await fs.stat(resolvedPath);
        if (!stats.isDirectory()) {
          throw new Error(mc.notDirectory(targetPath));
        }
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          console.log(chalk.yellow(mc.dirNotExist(targetPath)));
        } else if (error.message && error.message.includes('not a directory')) {
          throw error;
        } else {
          throw new Error(mc.cannotAccess(targetPath, error.message), { cause: error });
        }
      }

      const { InitCommand } = await import('../core/init.js');
      const initCommand = new InitCommand({
        tools: options?.tools,
        force: options?.force,
        update: true,
      });
      await initCommand.execute(targetPath);
    } catch (error) {
      console.log();
      console.error(chalk.red(mc.errorPrefix((error as Error).message)));
      process.exit(1);
    }
  });

program
  .command('serve [path]')
  .description(mc.serveCommandDescription)
  .option('--port <port>', mc.portOption)
  .option('--strict-port', mc.strictPortOption)
  .option('--no-open', mc.noOpenOption)
  .action(
    async (targetPath = '.', options?: { port?: string; strictPort?: boolean; open?: boolean }) => {
      try {
        const { executeServe } = await import('../core/serve.js');
        await executeServe({
          targetPath,
          port: options?.port ? Number(options.port) : undefined,
          strictPort: options?.strictPort,
          open: options?.open,
        });
      } catch (error) {
        console.log();
        console.error(chalk.red(mc.errorPrefix((error as Error).message)));
        process.exit(1);
      }
    },
  );

program.parse();
