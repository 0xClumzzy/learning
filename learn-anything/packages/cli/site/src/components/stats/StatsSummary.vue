<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '@/composables/useI18n';
import type { DashboardStats } from './useDashboardStats';

const props = defineProps<{ stats: DashboardStats }>();

const { t } = useI18n();

// Everything except `unexplored` has been touched.
const explored = computed(
  () => props.stats.totalConcepts - props.stats.unexplored,
);
</script>

<template>
  <div
    class="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-(--color-divider)"
  >
    <!-- Activity -->
    <div class="p-5">
      <p class="text-xs text-text-3 mb-1.5">{{ t('dashboard.overview.activity') }}</p>
      <p class="text-sm text-text-2">
        <span class="font-semibold tabular-nums text-text-1">{{ stats.totalPractice }}</span>
        {{ t('dashboard.overview.practices') }}
        <span class="text-text-3 mx-1">·</span>
        <span class="font-semibold tabular-nums text-text-1">{{ stats.totalExplain }}</span>
        {{ t('dashboard.overview.explains') }}
      </p>
    </div>
    <!-- Content -->
    <div class="p-5">
      <p class="text-xs text-text-3 mb-1.5">{{ t('dashboard.overview.content') }}</p>
      <p class="text-sm text-text-2">
        <span class="font-semibold tabular-nums text-text-1">{{ stats.noteCount }}</span>
        {{ t('domain.notes') }}
        <span class="text-text-3 mx-1">·</span>
        <span class="font-semibold tabular-nums text-text-1">{{ stats.exerciseCount }}</span>
        {{ t('domain.exercises') }}
        <span class="text-text-3 mx-1">·</span>
        <span class="font-semibold tabular-nums text-text-1">{{ stats.domainCount }}</span>
        {{ t('topic.domains') }}
      </p>
    </div>
    <!-- Explored
         This tile used to show "N days ago". Recency is banned by the ADHD
         protocol: a gap in study is a scheduling artefact, not the user's
         debt, and surfacing it as a stat turns absence into a metric. It now
         reports how much has actually been touched. -->
    <div class="p-5">
      <p class="text-xs text-text-3 mb-1.5">{{ t('dashboard.overview.explored') }}</p>
      <p class="text-sm text-text-2">
        <span class="font-semibold tabular-nums text-text-1">{{ explored }}</span
        >/ {{ stats.totalConcepts }}
        {{ t('topic.concepts') }}
      </p>
    </div>
  </div>
</template>
