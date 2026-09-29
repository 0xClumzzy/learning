import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { PEACHES_DIR } from '../src/core/config.js';
import { InitCommand } from '../src/core/init.js';

type CheckboxChoice = { value: string; checked?: boolean };

describe('CLI Integration — init', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'peaches-cli-test-'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should not create .peaches/site/ directory after init', async () => {
    const cmd = new InitCommand({ tools: 'none' });
    await cmd.execute(tmpDir);

    const sd = path.join(tmpDir, PEACHES_DIR, 'site');
    expect(fs.existsSync(sd)).toBe(false);
  });

  it('should not affect existing .peaches/ data after init', async () => {
    const topicsDir = path.join(tmpDir, PEACHES_DIR, 'topics', 'python');
    fs.mkdirSync(topicsDir, { recursive: true });
    const statePath = path.join(topicsDir, 'state.json');
    fs.writeFileSync(statePath, '{"slug":"python"}', 'utf-8');

    const cmd = new InitCommand({ tools: 'none' });
    await cmd.execute(tmpDir);

    expect(fs.existsSync(statePath)).toBe(true);
    const sd = path.join(tmpDir, PEACHES_DIR, 'site');
    expect(fs.existsSync(sd)).toBe(false);
  });

  it('pre-selects tool dirs from the target project, not the current directory', async () => {
    // Guards the bug where interactiveSelect() passed process.cwd() to
    // hasToolDir(), so `peaches init ../other-project` pre-selected based on
    // the directory you happened to be standing in.
    const target = path.join(tmpDir, 'target-project');
    const sibling = path.join(tmpDir, 'sibling-project');
    fs.mkdirSync(path.join(target, '.claude'), { recursive: true });
    fs.mkdirSync(path.join(sibling, '.cursor'), { recursive: true });

    let preselected: string[] = [];
    vi.doMock('@inquirer/prompts', () => ({
      checkbox: async ({ choices }: { choices: CheckboxChoice[] }) => {
        preselected = choices.filter((c) => c.checked).map((c) => c.value);
        return preselected;
      },
    }));

    try {
      const { InitCommand: FreshInit } = await import('../src/core/init.js');
      const fresh = new FreshInit({});
      const select = (
        fresh as unknown as {
          interactiveSelect: (p: string, t: unknown[]) => Promise<unknown>;
        }
      ).interactiveSelect.bind(fresh);

      await select(target, [
        { value: 'claude', name: 'Claude Code', available: true, skillsDir: '.claude' },
        { value: 'cursor', name: 'Cursor', available: true, skillsDir: '.cursor' },
      ]);
    } finally {
      vi.doUnmock('@inquirer/prompts');
    }

    // .claude exists under the target; .cursor exists only in the sibling.
    expect(preselected).toEqual(['claude']);
  });

  it('loads compiled scripts before writing any skill file', async () => {
    // Preload runs ahead of the per-tool write loop so a broken install fails
    // cleanly instead of leaving a half-populated .claude/skills tree.
    const cmd = new InitCommand({ tools: 'claude' });
    const readCache = () =>
      (cmd as unknown as { scriptCache: Map<string, string> | null }).scriptCache;

    expect(readCache()).toBeNull();

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('__exit__');
    }) as never);

    let failed = false;
    try {
      await cmd.execute(tmpDir);
    } catch (err) {
      failed = (err as Error).message === '__exit__';
    } finally {
      exitSpy.mockRestore();
    }

    if (failed) {
      // Compiled scripts are genuinely absent when tests run from src/.
      // That is the failure being exercised: nothing should be on disk.
      expect(fs.existsSync(path.join(tmpDir, '.claude', 'skills'))).toBe(false);
      return;
    }

    // Scripts are present: the cache was filled before any write, and every
    // entry is real content rather than an empty string.
    const cache = readCache();
    expect(cache).not.toBeNull();
    expect(cache!.size).toBeGreaterThan(0);
    for (const [name, content] of cache!) {
      expect(content, `script ${name} should have content`).toBeTypeOf('string');
      expect(content.length).toBeGreaterThan(0);
    }
  });
});
