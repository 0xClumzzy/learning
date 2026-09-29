<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '@/composables/useI18n';
import { useReviewItems, type ReviewItem } from './useReview';
import { STATUS_GLYPH } from '@/components/stats/statusGlyph';

/**
 * One promoted next action.
 *
 * This is the single most important element on the dashboard, and it is
 * deliberately the only interactive thing above the fold. The ADHD protocol
 * forbids opening with a menu: we pick the highest-priority item, say why it
 * is the one, and hand the user a single action.
 *
 * We deliberately do NOT show a count of what is left, or how long ago
 * anything was touched. Lapses are not the user's debt.
 */
const { t } = useI18n();
const router = useRouter();
const items = useReviewItems(50);

const next = computed<ReviewItem | null>(() => {
  const ranked = items.value.filter((i) => i.reason !== 'never_practiced' || i.explainCount > 0);
  if (ranked.length > 0) return ranked[0] ?? null;
  return null;
});

/** Glyph and copy follow the reason, so the line explains itself. */
const presentation = computed(() => {
  const n = next.value;
  if (!n) return null;
  switch (n.reason) {
    case 'never_practiced':
      return { glyph: STATUS_GLYPH.in_progress, title: t('next.neverPracticed') };
    case 'needs_practice':
      return { glyph: STATUS_GLYPH.needs_practice, title: t('next.needsPractice') };
    case 'low_confidence':
      return { glyph: STATUS_GLYPH.in_progress, title: t('next.lowConfidence') };
    default:
      return { glyph: STATUS_GLYPH.mastered, title: t('next.reinforce') };
  }
});

function go() {
  const n = next.value;
  if (!n) return;
  router.push({
    name: 'topic',
    params: { slug: n.topicSlug },
    query: { tab: 'topics' },
  });
}
</script>

<template>
  <button
    v-if="next && presentation"
    class="group w-full text-left flex items-center gap-4 py-4 px-5 rounded-[10px] cursor-pointer transition-colors"
    style="
      background: linear-gradient(
        90deg,
        var(--color-brand-soft) 0%,
        rgba(255, 157, 99, 0.02) 55%,
        transparent 100%
      );
      border: 1px solid rgba(255, 157, 99, 0.22);
    "
    @click="go"
  >
    <span class="text-[15px] text-brand-2 shrink-0 leading-none" aria-hidden="true">{{
      presentation.glyph
    }}</span>

    <span class="min-w-0">
      <span class="block text-sm font-semibold text-text-1 truncate">
        {{ next.conceptName }}
      </span>
      <span class="block text-xs text-text-2 truncate">
        {{ presentation.title }} · {{ next.topicName }}
      </span>
    </span>

    <span
      class="ml-auto shrink-0 font-mono text-[11px] font-semibold tracking-[0.06em] text-[#0a0b0e] rounded-md px-3 py-1.5"
      style="background: var(--color-brand-2); box-shadow: 0 0 20px var(--color-glow)"
    >
      {{ t('next.continue') }}
    </span>
  </button>
</template>
