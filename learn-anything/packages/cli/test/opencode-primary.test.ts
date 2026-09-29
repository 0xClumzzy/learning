import { describe, it, expect } from 'vitest';
import { CommandAdapterRegistry } from '../src/core/command-generation/registry.js';
import { opencodeAdapter } from '../src/core/command-generation/adapters/opencode.js';
import { getCommandContents } from '../src/core/shared/skill-generation.js';
import { generateCommand } from '../src/core/command-generation/generator.js';
import { AI_TOOLS, PREFERRED_TOOL } from '../src/core/config.js';

describe('OpenCode is the primary target', () => {
  it('registers an adapter, so commands are actually generated', () => {
    // Regression guard: `generateCommandsForTool` returns early when a tool
    // has no adapter, so OpenCode used to receive skill files and *no command
    // files at all* — silently.
    expect(CommandAdapterRegistry.has(PREFERRED_TOOL)).toBe(true);
    expect(CommandAdapterRegistry.get(PREFERRED_TOOL)).toBe(opencodeAdapter);
  });

  it('declares exactly one preferred tool and it is OpenCode', () => {
    const preferred = AI_TOOLS.filter((t) => t.preferred);
    expect(preferred.length).toBe(1);
    expect(preferred[0]!.value).toBe(PREFERRED_TOOL);
    expect(preferred[0]!.value).toBe('opencode');
  });

  it('keeps OpenCode available and listed', () => {
    const oc = AI_TOOLS.find((t) => t.value === PREFERRED_TOOL);
    expect(oc).toBeDefined();
    expect(oc!.available).toBe(true);
    expect(oc!.skillsDir).toBe('.opencode');
  });

  it('still supports the other tools', () => {
    for (const v of ['claude', 'cursor', 'codex', 'gemini', 'windsurf']) {
      expect(AI_TOOLS.some((t) => t.value === v), `${v} missing`).toBe(true);
    }
  });
});

describe('OpenCode command format', () => {
  const topic = getCommandContents().find((c) => c.id === 'topic')!;

  it('writes to .opencode/commands/peaches/<id>.md', () => {
    // V2 discovers `.opencode/commands/` (plural); nested paths become
    // `/`-separated command names, so this is `/peaches/topic`.
    const cmd = generateCommand(topic, opencodeAdapter);
    expect(cmd.path.replace(/\\/g, '/')).toBe('.opencode/commands/peaches/topic.md');
  });

  it('emits only frontmatter OpenCode understands, and no template key', () => {
    const cmd = generateCommand(topic, opencodeAdapter);
    const fm = cmd.fileContent.match(/^---\n([\s\S]*?)\n---\n/);
    expect(fm, 'missing frontmatter').not.toBeNull();

    const keys = [...fm![1]!.matchAll(/^([a-z]+):/gm)].map((m) => m[1]);
    // V2 accepts description/agent/model/subagent. `template` is JSON-only and
    // must never appear — the Markdown body is the prompt template.
    expect(keys).toEqual(['description']);
    expect(cmd.fileContent).not.toContain('template:');
  });

  it('puts the prompt template in the body', () => {
    const cmd = generateCommand(topic, opencodeAdapter);
    expect(cmd.fileContent).toContain(topic.body);
  });

  it('generates one command per workflow', () => {
    for (const c of getCommandContents()) {
      const cmd = generateCommand(c, opencodeAdapter);
      expect(cmd.path.replace(/\\/g, '/')).toBe(
        `.opencode/commands/peaches/${c.id}.md`,
      );
      expect(cmd.fileContent).toContain('description:');
    }
  });
});
