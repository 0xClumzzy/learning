<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '@/composables/useI18n';
import type { MasteryStats } from './useDashboardStats';
import { STATUS_GLYPH } from './statusGlyph';

const props = defineProps<{ stats: MasteryStats }>();

const { t } = useI18n();

const cells = computed(() => [
  {
    key: 'mastered',
    glyph: STATUS_GLYPH.mastered,
    glyphClass: 'text-mastered',
    value: props.stats.mastered,
    label: t('status.mastered'),
  },
  {
    key: 'in_progress',
    glyph: STATUS_GLYPH.in_progress,
    glyphClass: 'text-(--color-in-progress)',
    value: props.stats.inProgress,
    label: t('status.inProgress'),
  },
  {
    key: 'needs_practice',
    glyph: STATUS_GLYPH.needs_practice,
    glyphClass: 'text-(--color-attention)',
    value: props.stats.needsPractice,
    label: t('status.needsPractice'),
  },
  {
    key: 'unexplored',
    glyph: STATUS_GLYPH.unexplored,
    glyphClass: 'text-(--color-unmapped)',
    value: props.stats.unexplored,
    label: t('status.unexplored'),
  },
]);
</script>

<template>
  <div>
    <!-- Numbers lead, labels recede. 1px grid lines separate the tiles with no
         borders of their own, so the row reads as one object. -->
    <div
      class="grid grid-cols-4 gap-px bg-(--color-divider) border border-(--color-divider) rounded-[10px] overflow-hidden"
    >
      <div
        v-for="cell in cells"
        :key="cell.key"
        class="bg-(--color-bg-alt) px-4 py-4"
      >
        <div class="text-[12px] leading-none" :class="cell.glyphClass" aria-hidden="true">
          {{ cell.glyph }}
        </div>
        <div class="mt-2 font-mono text-[26px] font-semibold tracking-tight leading-none">
          {{ cell.value }}
        </div>
        <div
          class="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-text-3"
        >
          {{ cell.label }}
        </div>
      </div>
    </div>

    <!-- Hairline ledger, glowing only where there is progress. -->
    <div class="mt-6 flex h-[3px] w-full overflow-hidden rounded-full bg-white/[0.05]">
      <div
        class="h-full bg-mastered shadow-[0_0_10px_var(--color-glow)] transition-all duration-500"
        :style="{ flexGrow: stats.mastered, flexBasis: 0 }"
      />
      <div
        class="h-full bg-(--color-in-progress) shadow-[0_0_10px_var(--color-glow-cyan)] transition-all duration-500"
        :style="{ flexGrow: stats.inProgress, flexBasis: 0 }"
      />
      <div
        class="h-full bg-(--color-attention) transition-all duration-500"
        :style="{ flexGrow: stats.needsPractice, flexBasis: 0 }"
      />
      <div
        class="h-full bg-(--color-unmapped) transition-all duration-500"
        :style="{ flexGrow: stats.unexplored, flexBasis: 0 }"
      />
    </div>

    <!-- Glyph + label: the shape carries the meaning, the hue reinforces it. -->
    <div class="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-text-3">
      <span
        v-for="cell in cells"
        :key="cell.key"
        class="inline-flex items-center gap-1.5"
      >
        <span :class="cell.glyphClass" aria-hidden="true">{{ cell.glyph }}</span>
        {{ cell.label }}
      </span>
    </div>
  </div>
</template>
