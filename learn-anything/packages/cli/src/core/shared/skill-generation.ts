import {
  getLearnTopicSkillTemplate,
  getLearnExplainSkillTemplate,
  getLearnPracticeSkillTemplate,
  getLearnReviewSkillTemplate,
  getLearnStatusSkillTemplate,
  getLearnQuizSkillTemplate,
  getLearnTopicCommandTemplate,
  getLearnExplainCommandTemplate,
  getLearnPracticeCommandTemplate,
  getLearnReviewCommandTemplate,
  getLearnStatusCommandTemplate,
  getLearnQuizCommandTemplate,
  type SkillTemplate,
} from '../templates/skill-templates.js';
import type { CommandContent } from '../command-generation/index.js';

export interface SkillTemplateEntry {
  template: SkillTemplate;
  dirName: string;
  workflowId: string;
}

export interface CommandTemplateEntry {
  template: ReturnType<typeof getLearnTopicCommandTemplate>;
  id: string;
}

export function getSkillTemplates(): SkillTemplateEntry[] {
  return [
    {
      template: getLearnTopicSkillTemplate(),
      dirName: 'peaches-topic',
      workflowId: 'topic',
    },
    {
      template: getLearnExplainSkillTemplate(),
      dirName: 'peaches-explain',
      workflowId: 'explain',
    },
    {
      template: getLearnPracticeSkillTemplate(),
      dirName: 'peaches-practice',
      workflowId: 'practice',
    },
    {
      template: getLearnReviewSkillTemplate(),
      dirName: 'peaches-review',
      workflowId: 'review',
    },
    {
      template: getLearnStatusSkillTemplate(),
      dirName: 'peaches-status',
      workflowId: 'status',
    },
    {
      template: getLearnQuizSkillTemplate(),
      dirName: 'peaches-quiz',
      workflowId: 'quiz',
    },
  ];
}

export function getCommandTemplates(): CommandTemplateEntry[] {
  return [
    { template: getLearnTopicCommandTemplate(), id: 'topic' },
    { template: getLearnExplainCommandTemplate(), id: 'explain' },
    { template: getLearnPracticeCommandTemplate(), id: 'practice' },
    { template: getLearnReviewCommandTemplate(), id: 'review' },
    { template: getLearnStatusCommandTemplate(), id: 'status' },
    { template: getLearnQuizCommandTemplate(), id: 'quiz' },
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
