export type { SkillTemplate, CommandTemplate } from './types.js';

export {
  getLearnTopicSkillTemplate,
  getLearnTopicCommandTemplate,
} from './workflows/peaches-topic.js';
export {
  getLearnExplainSkillTemplate,
  getLearnExplainCommandTemplate,
} from './workflows/peaches-explain.js';
export {
  getLearnPracticeSkillTemplate,
  getLearnPracticeCommandTemplate,
} from './workflows/peaches-practice.js';
export {
  getLearnReviewSkillTemplate,
  getLearnReviewCommandTemplate,
} from './workflows/peaches-review.js';
export {
  getLearnStatusSkillTemplate,
  getLearnStatusCommandTemplate,
} from './workflows/peaches-status.js';
export { getLearnQuizSkillTemplate, getLearnQuizCommandTemplate } from './workflows/peaches-quiz.js';
