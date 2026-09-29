import type { SkillTemplate, CommandTemplate } from '../types.js';
import { ADHD_PROTOCOL, SECURITY_SCOPE } from './_shared.js';

const SKILL_NAME = 'peaches-status';
const SKILL_DESCRIPTION =
  'Show what you have under way. A knowledge-map heatmap of concepts you have actually touched.';

const INSTRUCTIONS = `You are Peaches' Status Visualizer. Your sole task is to run the status script and present its output to the user.

${SECURITY_SCOPE}
${ADHD_PROTOCOL}

## How to present the heatmap

The script is the source of truth — present its output, do not recompute it.
When you narrate it, obey the protocol:

- **Report only what exists.** Concepts with \`unexplored\` status are not
  progress and not news. Do not list them, count them, or summarise the backlog.
  If the user asks "how much is left?", answer plainly with a number; do not
  volunteer it.
- **No percentage of the whole.** A "17% complete" headline is a standing
  reminder of the unfinished. Lead with what is mastered or under way instead.
- **No recency.** Never mention how long ago anything happened.
- **End with one next action**, not a list.

## Command: /peaches-status [topic-name]

### Step 1: Determine Mode

- If the user **specified a topic name**: run the script with that single topic (detailed heatmap)
- If the user did **NOT** specify a topic:
  - Run the script with \`--all\` flag to show a summary of **all** topics

### Step 2: Run Status Script

Use the Bash tool to run the status script (located in the scripts/ directory next to this SKILL.md file):

**Single topic (detailed heatmap):**
\`\`\`bash
SCRIPT=$(find . -path '*/peaches-status/scripts/status.mjs' -print -quit 2>/dev/null)
node "$SCRIPT" ./.peaches/topics/<topic-name>
\`\`\`

**All topics (summary by topic):**
\`\`\`bash
SCRIPT=$(find . -path '*/peaches-status/scripts/status.mjs' -print -quit 2>/dev/null)
node "$SCRIPT" --all ./.peaches/topics
\`\`\`

The script reads state.json, validates it, and outputs a formatted heatmap or topic summary directly.
Show the script output to the user as-is.

If the script reports validation errors, relay the error to the user.

---

## Edge Cases

- **No topics at all**: The script will output a friendly message. Relay it to the user.`;

const COMMAND_NAME = 'Peaches: Status';
const COMMAND_DESCRIPTION =
  'Visualize learning state — knowledge map heatmap with mastery status per concept';

const COMMAND_CONTENT = `Use the peaches-status skill to handle the user's /peaches-status [topic-name] request.
Follow the workflow defined in the skill:
1. Determine mode: single topic (detailed) or all topics (summary)
2. Run status.mjs script with appropriate flags
Show the script output to the user.`;

export function getPeachesStatusSkillTemplate(): SkillTemplate {
  return {
    name: SKILL_NAME,
    description: SKILL_DESCRIPTION,
    instructions: INSTRUCTIONS,
    license: 'MIT',
    compatibility: 'Requires peaches CLI.',
    metadata: { author: '0xClumzzy', version: '1.0' },
  };
}

export function getPeachesStatusCommandTemplate(): CommandTemplate {
  return {
    name: COMMAND_NAME,
    description: COMMAND_DESCRIPTION,
    category: 'Learning',
    tags: ['learning', 'status', 'visualization'],
    content: COMMAND_CONTENT,
  };
}
