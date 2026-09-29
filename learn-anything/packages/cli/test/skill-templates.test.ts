import { describe, it, expect } from 'vitest';
import {
  getPeachesNextSkillTemplate,
  getPeachesTopicSkillTemplate,
  getPeachesExplainSkillTemplate,
  getPeachesPracticeSkillTemplate,
  getPeachesReviewSkillTemplate,
  getPeachesStatusSkillTemplate,
  getPeachesQuizSkillTemplate,
} from '../src/core/templates/skill-templates.js';
import {
  getSkillTemplates,
  getCommandTemplates,
  getCommandContents,
  generateSkillContent,
} from '../src/core/shared/skill-generation.js';
import { CONTEXT7_GUIDANCE } from '../src/core/templates/context7-guidance.js';
import {
  ADHD_PROTOCOL,
  SECURITY_SCOPE,
  HIDDEN_DIR_WARNING,
} from '../src/core/templates/workflows/_shared.js';
import { CommandAdapterRegistry } from '../src/core/command-generation/registry.js';
import { generateCommand, generateCommands } from '../src/core/command-generation/generator.js';

describe('Skill Templates', () => {
  it('should return all skill templates with required fields', () => {
    const templates = getSkillTemplates();
    expect(templates.map((t) => t.workflowId)).toEqual([
      'next',
      'topic',
      'explain',
      'practice',
      'review',
      'status',
      'quiz',
    ]);

    for (const entry of templates) {
      expect(entry.template.name).toBeTruthy();
      expect(entry.template.description).toBeTruthy();
      expect(entry.template.instructions).toBeTruthy();
      expect(entry.template.instructions.length).toBeGreaterThan(100);
      expect(entry.dirName).toBeTruthy();
      expect(entry.workflowId).toBeTruthy();
    }
  });

  it('derives dirName from workflowId for every skill', () => {
    // Regression guard: dirName used to be hand-written alongside workflowId,
    // so the two could silently drift and a skill would ship in the wrong
    // directory (or lose its scripts, which are keyed on workflowId).
    for (const entry of getSkillTemplates()) {
      expect(entry.dirName).toBe(`peaches-${entry.workflowId}`);
      expect(entry.template.name).toBe(entry.dirName);
    }
  });

  it('gives every workflow the ADHD protocol and security scope', () => {
    // These two shared blocks are what make the product usable for chronic ADHD
    // and security-specific rather than generic. A workflow that omits either
    // will behave inconsistently with the rest, so fail loudly here.
    for (const entry of getSkillTemplates()) {
      expect(entry.template.instructions, entry.workflowId).toContain('ADHD Protocol');
      expect(entry.template.instructions, entry.workflowId).toContain('full-spectrum security');
    }
  });

  it('forbids lapse-guilt language in every workflow', () => {
    // No workflow may tell the user how long they have been away, or that they
    // are behind. ADHD_PROTOCOL itself *names* these phrases in order to ban
    // them, so strip the shared blocks first — what is left is the
    // workflow-specific prose, which is what this guard is for.
    const banned = [
      'days ago',
      'last studied',
      'you are behind',
      "you're behind",
      'catch up',
      'streak',
      'needs attention',
    ];
    for (const entry of getSkillTemplates()) {
      const own = entry.template.instructions
        .split(ADHD_PROTOCOL)
        .join('')
        .split(SECURITY_SCOPE)
        .join('')
        .split(HIDDEN_DIR_WARNING)
        .join('')
        .toLowerCase();
      for (const phrase of banned) {
        expect(own, `${entry.workflowId} contains guilt phrase "${phrase}"`).not.toContain(
          phrase,
        );
      }
    }
  });

  it('should have unique workflow IDs', () => {
    const templates = getSkillTemplates();
    const ids = templates.map((t) => t.workflowId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should generate valid SKILL.md content with YAML frontmatter', () => {
    const template = getPeachesExplainSkillTemplate();
    const content = generateSkillContent(template, '0.1.0');

    expect(content).toContain('---');
    expect(content).toContain('name: peaches-explain');
    expect(content).toContain('generatedBy: "0.1.0"');
    expect(content).toContain('Peaches');
  });

  it('should generate English SKILL.md content', () => {
    const template = getPeachesExplainSkillTemplate();
    const content = generateSkillContent(template, '0.1.0');

    expect(content).toContain('---');
    expect(content).toContain('name: peaches-explain');
    expect(content).toContain("You are Peaches'");
  });

  it('should use English name and description', () => {
    const template = getPeachesExplainSkillTemplate();

    expect(template.name).toBe('peaches-explain');
    expect(template.description).toContain('Recursively deep-dive');
    expect(template.instructions).toContain("You are Peaches'");
  });
});

describe('Command Templates', () => {
  it('should return all command templates', () => {
    const templates = getCommandTemplates();
    expect(templates.map((t) => t.id)).toEqual([
      'next',
      'topic',
      'explain',
      'practice',
      'review',
      'status',
      'quiz',
    ]);
  });

  it('should generate CommandContent array', () => {
    const contents = getCommandContents();
    expect(contents.map((c) => c.id)).toEqual([
      'next',
      'topic',
      'explain',
      'practice',
      'review',
      'status',
      'quiz',
    ]);
    for (const c of contents) {
      expect(c.id).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(c.category).toBe('Learning');
      expect(c.body).toBeTruthy();
    }
  });
});

describe('Command Generation', () => {
  it('should generate Claude Code command files correctly', () => {
    const adapter = CommandAdapterRegistry.get('claude');
    expect(adapter).toBeDefined();

    const contents = getCommandContents();
    const cmds = generateCommands(contents, adapter!);
    expect(cmds).toHaveLength(contents.length);

    for (const cmd of cmds) {
      expect(cmd.path.replace(/\\/g, '/')).toContain('.claude/commands/peaches/');
      expect(cmd.path).toMatch(/\.md$/);
      expect(cmd.fileContent).toContain('---');
      expect(cmd.fileContent).toContain('category: Learning');
    }
  });

  it('should generate Cursor command files correctly', () => {
    const adapter = CommandAdapterRegistry.get('cursor');
    expect(adapter).toBeDefined();

    // Look up by id: array order is a UI concern, not a contract.
    const topicContent = getCommandContents().find((c) => c.id === 'topic')!;
    const cmd = generateCommand(topicContent, adapter!);
    expect(cmd.path.replace(/\\/g, '/')).toContain('.cursor/commands/peaches-topic.md');
    expect(cmd.fileContent).toContain('/peaches-topic');
  });

  it('should generate Codex command files with absolute paths', () => {
    const adapter = CommandAdapterRegistry.get('codex');
    expect(adapter).toBeDefined();

    // Look up by id: array order is a UI concern, not a contract.
    const topicContent = getCommandContents().find((c) => c.id === 'topic')!;
    const cmd = generateCommand(topicContent, adapter!);
    expect(cmd.path.replace(/\\/g, '/')).toContain('.codex/prompts/peaches-topic.md');
  });

  it('should generate Gemini command files in TOML format', () => {
    const adapter = CommandAdapterRegistry.get('gemini');
    expect(adapter).toBeDefined();

    // Look up by id: array order is a UI concern, not a contract.
    const topicContent = getCommandContents().find((c) => c.id === 'topic')!;
    const cmd = generateCommand(topicContent, adapter!);
    expect(cmd.path.replace(/\\/g, '/')).toContain('.gemini/commands/peaches/');
    expect(cmd.path).toMatch(/\.toml$/);
    expect(cmd.fileContent).toContain('description =');
    expect(cmd.fileContent).toContain('prompt = """');
  });

  it.each(['claude', 'cursor', 'codex', 'gemini'])(
    'should generate quiz command for %s',
    (toolId) => {
      const adapter = CommandAdapterRegistry.get(toolId);
      expect(adapter).toBeDefined();

      const quizContent = getCommandContents().find((content) => content.id === 'quiz');
      expect(quizContent).toBeDefined();

      const cmd = generateCommand(quizContent!, adapter!);
      expect(cmd.path).toContain('quiz');
      expect(cmd.fileContent).toContain('peaches-quiz');
    },
  );
});

describe('Skill Template Content Quality', () => {
  it('explain template should include Socratic guidance', () => {
    const t = getPeachesExplainSkillTemplate();
    expect(t.instructions).toContain('Socratic');
    expect(t.instructions).toContain('Recursive');
    expect(t.instructions).toContain('analogy');
    expect(t.instructions).toContain('./.peaches/topics/');
  });

  it('practice template should offer security lab types, not TDD exercises', () => {
    const t = getPeachesPracticeSkillTemplate();
    expect(t.instructions).toContain('Dynamic Difficulty');
    expect(t.instructions).toContain('Socratic Feedback');
    // Security lab model
    expect(t.instructions).toContain('blast radius');
    expect(t.instructions).toContain('Find it');
    expect(t.instructions).toContain('Harden it');
    expect(t.instructions).toContain('Read the evidence');
    // The TDD framing is gone
    expect(t.instructions).not.toContain('Project Mode');
    expect(t.instructions).not.toContain('languages, frameworks, algorithms');
  });

  it('next template should recommend and start, never ask', () => {
    const t = getPeachesNextSkillTemplate();
    // The whole point: one action, taken immediately.
    expect(t.instructions).toContain('Choose exactly one next step');
    expect(t.instructions).toContain('Announce and go');
    expect(t.instructions).toContain('Never emit a syllabus');
    // It must not open with a choice prompt, and must not surface the backlog.
    // ADHD_PROTOCOL quotes the forbidden phrasing in order to ban it, so
    // compare against the workflow's own prose.
    const own = t.instructions.split(ADHD_PROTOCOL).join('').toLowerCase();
    expect(own).not.toContain('what would you like');
    expect(own).not.toContain('which would you like');
  });

  it('topic template should include knowledge map generation via state.json', () => {
    const t = getPeachesTopicSkillTemplate();
    expect(t.instructions).toContain('Knowledge Map');
    expect(t.instructions).toContain('state.json');
    expect(t.instructions).toContain('render.mjs');
    expect(t.instructions).toContain('mkdir -p');
  });

  it.each(['topic', 'explain', 'practice', 'review', 'quiz'])(
    '%s template should warn about glob not matching hidden .peaches directory',
    (workflow) => {
      const getters = {
        topic: getPeachesTopicSkillTemplate,
        explain: getPeachesExplainSkillTemplate,
        practice: getPeachesPracticeSkillTemplate,
        review: getPeachesReviewSkillTemplate,
        quiz: getPeachesQuizSkillTemplate,
      } as const;
      const t = getters[workflow]();
      expect(t.instructions).toContain('hidden directory');
      expect(t.instructions).toContain('ls -d .peaches/topics/*/');
    },
  );

  it('review template should include spaced repetition', () => {
    const t = getPeachesReviewSkillTemplate();
    expect(t.instructions).toContain('spaced repetition');
    expect(t.instructions).toContain('priority = (1 - confidence)');
  });

  it('status template should reference status.mjs script', () => {
    const t = getPeachesStatusSkillTemplate();
    expect(t.instructions).toContain('status.mjs');
    expect(t.instructions).toContain('heatmap');
  });

  it('quiz template should define a single-flow reusable-deck workflow', () => {
    const t = getPeachesQuizSkillTemplate();
    expect(t.instructions).toContain('/peaches:quiz <concept');
    expect(t.instructions).toContain('quiz.json');
    expect(t.instructions).toContain('quizzes/<concept-slug>/');
    expect(t.instructions).toContain('gradeable');
    expect(t.instructions).toContain('accepted_answers');
    expect(t.instructions).toContain('multiple_choice');
    expect(t.instructions).toContain('true_false');
    expect(t.instructions).toContain('fill_in_blank');
    expect(t.instructions).toContain('error_correction');
    expect(t.instructions).toContain('validate-quiz.mjs');
    expect(t.instructions).toContain('order irrelevant');
    expect(t.instructions).not.toContain('answer-key.json');
    expect(t.instructions).not.toContain('submission.json');
    expect(t.instructions).not.toContain('assessment.md');
    expect(t.instructions).not.toContain('scope_policy');
    expect(t.instructions).not.toContain('/peaches:quiz generate');
    expect(t.instructions).not.toContain('/peaches:quiz grade');
  });

  it('quiz template should scope to touched concepts and update state only after grading', () => {
    const t = getPeachesQuizSkillTemplate();
    expect(t.instructions).toContain('touched concept');
    expect(t.instructions).toContain('status !== "unexplored"');
    expect(t.instructions).toContain('explain_count > 0');
    expect(t.instructions).toContain('practice_count > 0');
    expect(t.instructions).toContain('confidence > 0');
    expect(t.instructions).toContain('practice_count +1');
    expect(t.instructions).toContain('mastered');
    expect(t.instructions).toContain('batch');
  });

  it('quiz template should keep deck-write independent from state updates and portable', () => {
    const t = getPeachesQuizSkillTemplate();
    expect(t.instructions).toContain('do NOT update state.json');
    expect(t.instructions).not.toContain('generate_html.py');
    expect(t.instructions).not.toContain('generate_pdf.py');
    expect(t.instructions).not.toContain('generate_docx.py');
    expect(t.instructions).not.toContain('C:/Users/');
    expect(t.instructions).not.toContain('launch parallel agents');
  });

  it('quiz template should reference session notes as preferred source material', () => {
    const t = getPeachesQuizSkillTemplate();
    expect(t.instructions).toContain('session notes');
    expect(t.instructions).toContain('sessions/<domain-slug>/');
    expect(t.instructions).toContain('PREFERRED reference');
    expect(t.instructions).toContain('details[]');
  });
});

// ── v1 Format: state.json and render.mjs integration ────────────────

describe('Skill Template v1 Format Compliance', () => {
  // topic, explain, practice should reference render.mjs (write workflows)
  const writeTemplates = [
    { name: 'topic', getter: getPeachesTopicSkillTemplate },
    { name: 'explain', getter: getPeachesExplainSkillTemplate },
    { name: 'practice', getter: getPeachesPracticeSkillTemplate },
    { name: 'quiz', getter: getPeachesQuizSkillTemplate },
  ];

  // review should NOT run render.mjs (read-only workflow)
  const readTemplates = [{ name: 'review', getter: getPeachesReviewSkillTemplate }];

  it.each(writeTemplates.map((t) => ({ name: t.name })))(
    '$name template should reference render.mjs for write workflows',
    ({ name }) => {
      const t = writeTemplates.find((w) => w.name === name)!.getter();
      expect(t.instructions).toContain('render.mjs');
    },
  );

  it.each(readTemplates.map((t) => ({ name: t.name })))(
    '$name template should NOT run render.mjs (read-only)',
    ({ name }) => {
      const t = readTemplates.find((r) => r.name === name)!.getter();
      // Read-only templates explicitly say "do NOT run render.mjs"
      expect(t.instructions).toContain('do NOT run render.mjs');
    },
  );

  // Templates that directly reference state.json (script-based status handles data internally)
  const stateJsonTemplates = [
    { name: 'topic', getter: getPeachesTopicSkillTemplate },
    { name: 'explain', getter: getPeachesExplainSkillTemplate },
    { name: 'practice', getter: getPeachesPracticeSkillTemplate },
    { name: 'review', getter: getPeachesReviewSkillTemplate },
    { name: 'status', getter: getPeachesStatusSkillTemplate },
    { name: 'quiz', getter: getPeachesQuizSkillTemplate },
  ];

  it.each(stateJsonTemplates.map((t) => ({ name: t.name })))(
    '$name template should reference state.json as data source',
    ({ name }) => {
      const t = stateJsonTemplates.find((a) => a.name === name)!.getter();
      expect(t.instructions).toContain('state.json');
    },
  );

  // Only templates that instruct AI to read state.json directly need the "single source of truth" warning.
  // status delegates data handling to status.mjs, so it doesn't need this phrase.
  const singleSourceTemplates = [
    { name: 'topic', getter: getPeachesTopicSkillTemplate },
    { name: 'explain', getter: getPeachesExplainSkillTemplate },
    { name: 'practice', getter: getPeachesPracticeSkillTemplate },
    { name: 'review', getter: getPeachesReviewSkillTemplate },
    { name: 'quiz', getter: getPeachesQuizSkillTemplate },
  ];

  it.each(singleSourceTemplates.map((t) => ({ name: t.name })))(
    '$name template should explicitly say not to read state.yaml or knowledge-map.md for data',
    ({ name }) => {
      const t = singleSourceTemplates.find((a) => a.name === name)!.getter();
      expect(t.instructions).toContain('state.json is the single source of truth');
    },
  );

  it.each(writeTemplates.map((t) => ({ name: t.name })))(
    '$name template should instruct AI that render.mjs validates state.json',
    ({ name }) => {
      const t = writeTemplates.find((w) => w.name === name)!.getter();
      expect(t.instructions).toContain('validates state.json');
      expect(t.instructions).toContain('re-run render.mjs');
    },
  );
  describe('Context7 Guidance Injection', () => {
    function injectContext7Guidance(instructions: string): string {
      const marker = '\n## Command:';
      const index = instructions.indexOf(marker);
      if (index === -1) return instructions + CONTEXT7_GUIDANCE;
      return instructions.slice(0, index) + CONTEXT7_GUIDANCE + instructions.slice(index);
    }

    it('should inject Context7 guidance when transform is provided', () => {
      const template = getPeachesTopicSkillTemplate();
      const content = generateSkillContent(template, '0.3.0', injectContext7Guidance);
      expect(content).toContain('resolve-library-id');
      expect(content).toContain('query-docs');
      expect(content).toContain('Documentation Verification');
    });

    it('should not contain Context7 when no transform is provided', () => {
      const template = getPeachesTopicSkillTemplate();
      const content = generateSkillContent(template, '0.3.0');
      expect(content).not.toContain('resolve-library-id');
      expect(content).not.toContain('Context7');
    });

    it('should place guidance before ## Command: section', () => {
      const template = getPeachesExplainSkillTemplate();
      const content = generateSkillContent(template, '0.3.0', injectContext7Guidance);
      const guidancePos = content.indexOf('Documentation Verification');
      const commandPos = content.indexOf('## Command:');
      expect(guidancePos).toBeGreaterThan(0);
      expect(commandPos).toBeGreaterThan(guidancePos);
    });

    it('review and status templates should not contain Context7 by default', () => {
      const review = getPeachesReviewSkillTemplate();
      const status = getPeachesStatusSkillTemplate();
      expect(review.instructions).not.toContain('Context7');
      expect(status.instructions).not.toContain('Context7');
    });
  });
});

describe('Context7 Guidance Injection', () => {
  function injectContext7Guidance(instructions: string): string {
    const marker = '\n## Command:';
    const index = instructions.indexOf(marker);
    if (index === -1) return instructions + CONTEXT7_GUIDANCE;
    return instructions.slice(0, index) + CONTEXT7_GUIDANCE + instructions.slice(index);
  }

  it('should inject Context7 guidance when transform is provided', () => {
    const template = getPeachesTopicSkillTemplate();
    const content = generateSkillContent(template, '0.3.0', injectContext7Guidance);
    expect(content).toContain('resolve-library-id');
    expect(content).toContain('query-docs');
    expect(content).toContain('Documentation Verification');
  });

  it('should not contain Context7 when no transform is provided', () => {
    const template = getPeachesTopicSkillTemplate();
    const content = generateSkillContent(template, '0.3.0');
    expect(content).not.toContain('resolve-library-id');
    expect(content).not.toContain('Context7');
  });

  it('should place guidance before ## Command: section', () => {
    const template = getPeachesExplainSkillTemplate();
    const content = generateSkillContent(template, '0.3.0', injectContext7Guidance);
    const guidancePos = content.indexOf('Documentation Verification');
    const commandPos = content.indexOf('## Command:');
    expect(guidancePos).toBeGreaterThan(0);
    expect(commandPos).toBeGreaterThan(guidancePos);
  });

  it('review and status templates should not contain Context7 by default', () => {
    const review = getPeachesReviewSkillTemplate();
    const status = getPeachesStatusSkillTemplate();
    expect(review.instructions).not.toContain('Context7');
    expect(status.instructions).not.toContain('Context7');
  });
});
