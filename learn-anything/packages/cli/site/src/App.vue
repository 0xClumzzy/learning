<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import AppSidebar from './components/sidebar/AppSidebar.vue';
import LoadingOverlay from './components/LoadingOverlay.vue';
import SearchModal from './components/search/SearchModal.vue';
import QuizModal from './components/quiz/QuizModal.vue';
import { listenForChanges } from './composables/useTopicData';
import { useFileNavigation } from './composables/useFileNavigation';
import { useViewMode } from './composables/useViewMode';
import { useSearchLauncher } from './composables/useSearchLauncher';
import { useQuizLauncher } from './composables/useQuizLauncher';
import { useDarkMode } from './composables/useDarkMode';

const route = useRoute();

useDarkMode();

const {
  selectedFilePath,
  currentTopicSlug,
  initialTab,
  contentLoading,
  selectFile,
  inferTabFromPath,
  resetLoader,
  onFileSelected,
  onTopicSelected,
  onBackToDashboard,
  refreshCurrentFile,
} = useFileNavigation();

useViewMode();

const sidebarContext = computed<'dashboard' | 'topic'>(() => {
  return route.name === 'topic' ? 'topic' : 'dashboard';
});

/* ------------------------------------------------------------------ */
/*  Search modal                                                        */
/* ------------------------------------------------------------------ */

const { searchOpen, onSearchSelect } = useSearchLauncher({
  currentTopicSlug,
  inferTabFromPath,
  selectFile,
  resetLoader,
});

/* ------------------------------------------------------------------ */
/*  Quiz modal                                                          */
/* ------------------------------------------------------------------ */

const { quizOpen, quizDeck, quizQueue, quizSessionKey, onQuizSelected, onQuizBatchSelected } =
  useQuizLauncher(currentTopicSlug);

/* ------------------------------------------------------------------ */
/*  SSE reload                                                          */
/* ------------------------------------------------------------------ */

let stopReloadListener: (() => void) | null = null;

onMounted(() => {
  stopReloadListener = listenForChanges(async () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    await refreshCurrentFile();
    await nextTick();
    document.documentElement.style.scrollBehavior = 'auto';
    document.documentElement.scrollTop = scrollTop;
    document.documentElement.style.scrollBehavior = '';
  });
});

onUnmounted(() => {
  stopReloadListener?.();
});
</script>

<template>
  <div
    class="flex min-h-screen bg-(--color-page) text-(--color-ink)"
    style="background: radial-gradient(900px 500px at 12% -8%, var(--color-glow), transparent 70%), radial-gradient(700px 500px at 88% 108%, var(--color-glow-cyan), transparent 70%), var(--color-page); background-attachment: fixed;"
  >
    <AppSidebar
      :context="sidebarContext"
      :topic-slug="currentTopicSlug"
      :initial-tab="initialTab"
      :selected-file-path="selectedFilePath"
      @file-selected="onFileSelected"
      @topic-selected="onTopicSelected"
      @back-to-dashboard="onBackToDashboard"
      @search-open="searchOpen = true"
      @quiz-selected="onQuizSelected"
      @quiz-batch-selected="onQuizBatchSelected"
    />

    <main class="flex-1 min-w-0 lg:pl-62">
      <div class="px-8 py-10 lg:px-11">
        <router-view />
      </div>
    </main>

    <Transition name="ld-fade">
      <LoadingOverlay v-if="contentLoading" />
    </Transition>

    <SearchModal :open="searchOpen" @close="searchOpen = false" @select="onSearchSelect" />

    <QuizModal
      :key="quizSessionKey"
      :open="quizOpen"
      :quiz-deck="quizDeck"
      :quiz-queue="quizQueue"
      :topic-slug="currentTopicSlug ?? ''"
      @close="quizOpen = false"
    />
  </div>
</template>
