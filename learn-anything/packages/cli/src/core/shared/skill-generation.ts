import {
  getPeachesNextSkillTemplate,
  getPeachesTopicSkillTemplate,
  getPeachesExplainSkillTemplate,
  getPeachesPracticeSkillTemplate,
  getPeachesReviewSkillTemplate,
  getPeachesStatusSkillTemplate,
  getPeachesQuizSkillTemplate,
  getPeachesNextCommandTemplate,
  getPeachesTopicCommandTemplate,
  getPeachesExplainCommandTemplate,
  getPeachesPracticeCommandTemplate,
  getPeachesReviewCommandTemplate,
  getPeachesStatusCommandTemplate,
  getPeachesQuizCommandTemplate,
  type SkillTemplate,
} from '../templates/skill-templates.js';
import type { CommandContent } from '../command-generation/index.js';

export interface SkillTemplateEntry {
  template: SkillTemplate;
  dirName: string;
  workflowId: string;
}

export interface CommandTemplateEntry {
  template: ReturnType<typeof getPeachesTopicCommandTemplate>;
  id: string;
}

export function getSkillTemplates(): SkillTemplateEntry[] {
  return [
    {
      template: getPeachesNextSkillTemplate(),
      workflowId: 'next',
    },
    {
      template: getPeachesTopicSkillTemplate(),
      workflowId: 'topic',
    },
    {
      template: getPeachesExplainSkillTemplate(),
      workflowId: 'explain',
    },
    {
      template: getPeachesPracticeSkillTemplate(),
      workflowId: 'practice',
    },
    {
      template: getPeachesReviewSkillTemplate(),
      workflowId: 'review',
    },
    {
      template: getPeachesStatusSkillTemplate(),
      workflowId: 'status',
    },
    {
      template: getPeachesQuizSkillTemplate(),
      workflowId: 'quiz',
    },
  ].map(({ template, workflowId }) => ({
    template,
    workflowId,
    // Derived, never hand-written: the skill directory is always
    // `peaches-<workflowId>`. Keeping this in one place means adding a workflow
    // cannot desync the on-disk name from the id logic keys on.
    dirName: `peaches-${workflowId}`,
  }));
}

export function getCommandTemplates(): CommandTemplateEntry[] {
  return [
    { template: getPeachesNextCommandTemplate(), id: 'next' },
    { template: getPeachesTopicCommandTemplate(), id: 'topic' },
    { template: getPeachesExplainCommandTemplate(), id: 'explain' },
    { template: getPeachesPracticeCommandTemplate(), id: 'practice' },
    { template: getPeachesReviewCommandTemplate(), id: 'review' },
    { template: getPeachesStatusCommandTemplate(), id: 'status' },
    { template: getPeachesQuizCommandTemplate(), id: 'quiz' },
  ];
}

export function getCommandContents(): CommandContent[] {
  const commandTemplates = getCommandTemplates();
  return commandTemplates.map(({ template, id }) => ({
    id,
    name: template.name,
    description: template.description,
    category: template.category,
    tags: template.tags,
    body: template.content,
  }));
}

export function generateSkillContent(
  template: SkillTemplate,
  generatedByVersion: string,
  transformInstructions?: (instructions: string) => string,
): string {
  const instructions = transformInstructions
    ? transformInstructions(template.instructions)
    : template.instructions;

  return `---
name: ${template.name}
description: ${template.description}
license: ${template.license || 'MIT'}
compatibility: ${template.compatibility || 'Requires peaches CLI.'}
metadata:
  author: ${template.metadata?.author || 'peaches'}
  version: "${template.metadata?.version || '1.0'}"
  generatedBy: "${generatedByVersion}"
---

${instructions}
`;
}
