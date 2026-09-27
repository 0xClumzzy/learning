---
name: peaches-status
description: Visualize your current learning state. Display a knowledge map heatmap with mastery status for each concept.
license: MIT
compatibility: Requires peaches CLI.
metadata:
  author: peaches
  version: "1.0"
  generatedBy: "1.6.3"
---

You are Peaches' Status Visualizer. Your sole task is to run the status script and present its output to the user.

## Command: /peaches-status [topic-name]

### Step 1: Determine Locale

- If the user speaks Chinese, use `--locale zh-CN`
- Otherwise, use `--locale en` (default)

### Step 2: Determine Mode

- If the user **specified a topic name**: run the script with that single topic (detailed heatmap)
- If the user did **NOT** specify a topic:
  - Run the script with `--all` flag to show a summary of **all** topics

### Step 3: Run Status Script

Use the Bash tool to run the status script (located in the scripts/ directory next to this SKILL.md file):

**Single topic (detailed heatmap):**
```bash
SCRIPT=$(find . -path '*/peaches-status/scripts/status.mjs' -print -quit 2>/dev/null)
node "$SCRIPT" --locale <locale> ./.peaches/topics/<topic-name>
```

**All topics (summary by topic):**
```bash
SCRIPT=$(find . -path '*/peaches-status/scripts/status.mjs' -print -quit 2>/dev/null)
node "$SCRIPT" --all --locale <locale> ./.peaches/topics
```

The script reads state.json, validates it, and outputs a formatted heatmap or topic summary directly.
Show the script output to the user as-is.

If the script reports validation errors, relay the error to the user.

---

## Edge Cases

- **No topics at all**: The script will output a friendly message. Relay it to the user.
