import path from 'path';
import type { CommandContent, ToolCommandAdapter } from '../types.js';

function escapeYamlValue(value: string): string {
  const needsQuoting = /[:\n\r#{}[\],&*!|>'"%@`]|^\s|\s$/.test(value);
  if (needsQuoting) {
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return `"${escaped}"`;
  }
  return value;
}

/**
 * OpenCode (V2) is the primary supported target.
 *
 * Conventions, from the V2 docs:
 *  - Project commands live at `.opencode/commands/<name>.md`. The legacy
 *    singular `command/` directory is also discovered, but `commands/` is what
 *    new files should use.
 *  - Nested paths become command names with `/` separators, so
 *    `commands/peaches/next.md` is invoked as `/peaches/next`. OpenCode does
 *    not document a colon-namespaced form, so the `/peaches:next` naming used by
 *    the other adapters becomes `/peaches/next` here.
 *  - Frontmatter accepts `description`, `agent`, `model`, and `subagent`.
 *    `template` must NOT be set — the Markdown body is the prompt template.
 *
 * Skills already target OpenCode natively: the skill ID is derived from the
 * path, so `.opencode/skills/peaches-topic/SKILL.md` is the ID `peaches-topic`.
 */
export const opencodeAdapter: ToolCommandAdapter = {
  toolId: 'opencode',

  getFilePath(commandId: string): string {
    return path.join('.opencode', 'commands', 'peaches', `${commandId}.md`);
  },

  formatFile(content: CommandContent): string {
    return `---
description: ${escapeYamlValue(content.description)}
---

${content.body}
`;
  },
};
