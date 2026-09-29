<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '@/composables/useI18n';
import SidebarTreeNode from '@/components/sidebar/SidebarTreeNode.vue';
import type { Concept, ConceptStatus } from '@/composables/topicDataTypes';
import { STATUS_GLYPH } from './statusGlyph';

defineProps<{ domains: { name: string; slug: string; concepts: Concept[] }[] }>();
const { t } = useI18n();

const collapsed = ref<Set<string>>(new Set());

function isExpanded(slug: string): boolean {
  return !collapsed.value.has(slug);
}

function toggle(slug: string): void {
  const next = new Set(collapsed.value);
  if (next.has(slug)) next.delete(slug);
  else next.add(slug);
  collapsed.value = next;
}

/** Paired with the glyph so status is not carried by hue alone. */
const glyphColorClass: Record<ConceptStatus, string> = {
  mastered: 'text-mastered',
  in_progress: 'text-(--color-in-progress)',
  needs_practice: 'text-(--color-attention)',
  unexplored: 'text-(--color-unmapped)',
};

const glyphBgClass: Record<ConceptStatus, string> = {
  mastered: 'bg-mastered shadow-[0_0_10px_var(--color-glow)]',
  in_progress: 'bg-(--color-in-progress) shadow-[0_0_10px_var(--color-glow-cyan)]',
  needs_practice: 'bg-(--color-attention)',
  unexplored: 'bg-(--color-unmapped)',
};
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="domain in domains"
      :key="domain.slug"
      class="rounded-[10px] border border-(--color-divider) bg-(--color-bg-alt) overflow-hidden"
    >
      <SidebarTreeNode
        :label="domain.name"
        :expanded="isExpanded(domain.slug)"
        class="px-4 py-3"
        @toggle="toggle(domain.slug)"
      >
        <div
          v-for="concept in domain.concepts"
          v-show="isExpanded(domain.slug)"
          :key="concept.slug"
          class="grid grid-cols-[18px_1fr_120px_46px] items-center gap-3 px-4 py-2.5 border-t border-white/[0.035]"
        >
          <span
            class="text-[11px] text-center leading-none"
            :class="glyphColorClass[concept.status]"
            :title="concept.status.replace('_', ' ')"
            aria-hidden="true"
            >{{ STATUS_GLYPH[concept.status] }}</span
          >
          <span class="text-[13px] text-text-1 truncate">{{ concept.name }}</span>
          <span class="h-[2px] rounded-full bg-white/[0.06] overflow-hidden">
            <span
              class="block h-full rounded-full"
              :class="glyphBgClass[concept.status]"
              :style="{
                width: concept.status === 'unexplored' ? '0%' : `${Math.round(concept.confidence * 100)}%`,
              }"
            />
          </span>
          <!-- An untouched concept has no percentage to report. Showing 0% would
               render "nothing done yet" as a deficit, so show nothing. -->
          <span
            class="font-mono text-[11.5px] text-right"
            :class="concept.status === 'unexplored' ? 'text-text-3' : 'text-text-2'"
            :title="concept.status === 'unexplored' ? 'not opened' : 'confidence'"
          >
            {{ concept.status === 'unexplored' ? '—' : `${Math.round(concept.confidence * 100)}%` }}
          </span>
        </div>
      </SidebarTreeNode>
    </div>
  </div>
</template>
