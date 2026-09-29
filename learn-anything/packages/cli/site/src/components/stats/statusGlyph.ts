import type { ConceptStatus } from '@/composables/topicDataTypes';

/**
 * A distinct glyph per mastery state.
 *
 * This exists so status is never conveyed by colour alone — the dot carries
 * hue, the glyph carries shape, so the knowledge map stays readable for
 * colourblind users and in greyscale. Glyphs are drawn from a set that renders
 * at a consistent advance width in common terminals and UI fonts, because this
 * output also appears in the fixed-width tables printed by `status.mjs`.
 *
 * Never introduce glyphs outside this set: the width variance breaks the
 * column alignment in the CLI's box-drawing output.
 */
export const STATUS_GLYPH: Record<ConceptStatus, string> = {
  mastered: '✦', // four-pointed star, filled
  in_progress: '▸', // right-pointing triangle, in motion
  needs_practice: '❖', // attention
  unexplored: '◦', // hollow bullet, nothing there yet
};
