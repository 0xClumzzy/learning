export type { SkillTemplate, CommandTemplate } from './types.js';

export {
  getPeachesNextSkillTemplate,
  getPeachesNextCommandTemplate,
} from './workflows/peaches-next.js';
export {
  getPeachesTopicSkillTemplate,
  getPeachesTopicCommandTemplate,
} from './workflows/peaches-topic.js';
export {
  getPeachesExplainSkillTemplate,
  getPeachesExplainCommandTemplate,
} from './workflows/peaches-explain.js';
export {
  getPeachesPracticeSkillTemplate,
  getPeachesPracticeCommandTemplate,
} from './workflows/peaches-practice.js';
export {
  getPeachesReviewSkillTemplate,
  getPeachesReviewCommandTemplate,
} from './workflows/peaches-review.js';
export {
  getPeachesStatusSkillTemplate,
  getPeachesStatusCommandTemplate,
} from './workflows/peaches-status.js';
export { getPeachesQuizSkillTemplate, getPeachesQuizCommandTemplate } from './workflows/peaches-quiz.js';
