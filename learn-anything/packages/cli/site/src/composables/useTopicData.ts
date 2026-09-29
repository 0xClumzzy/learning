/* ================================================================== */
/*  useTopicData — Data access layer (fetch-based)                     */
/*                                                                     */
/*  Fetches data from the local API server (serve.mjs).                */
/*  All data is loaded eagerly on initTopicData() and cached in memory. */
/*  Session/exercise content is loaded on demand via fetch().          */
/*                                                                     */
/*  In dev, vite proxies /api → serve.mjs (port 24277).                */
/*  In prod, serve.mjs serves both static + API on a single port.      */
/* ================================================================== */

import { ref } from 'vue';
import type { StateV1, TopicSummary, TopicFiles } from './topicDataTypes';
import { createSSEListener } from './useSSE';
import { clearFileContentCache, setFileContent } from './fileContentCache';

/* ------------------------------------------------------------------ */
/*  Types (re-exported for consumers)                                 */
/* ------------------------------------------------------------------ */

export type {
  ConceptStatus,
  Concept,
  Domain,
  StateV1,
  TopicSummary,
  TopicFiles,
  SelectedFilePayload,
} from './topicDataTypes';

export { loadFileContent, loadSessionContent, loadExerciseContent } from './fileContentCache';

/* ------------------------------------------------------------------ */
/*  In-memory indexes (populated by initTopicData)                     */
/* ------------------------------------------------------------------ */

let ready = false;
let initPromise: Promise<void> | null = null;
let initVersion = 0;

/* Last init failure, surfaced so the UI can explain an empty dashboard
   instead of showing a bare "no topics" state. Cleared on a good load. */
const initError = ref<string | null>(null);

const stateBySlug = new Map<string, StateV1>();
const knowledgeMapBySlug = new Map<string, string>();
const filesBySlug = new Map<string, TopicFiles>();

let topicSummaryCache: TopicSummary[] | null = null;

const dataVersion = ref(0);

export function getDataVersion(): number {
  return dataVersion.value;
}

export function getInitError(): string | null {
  return initError.value;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function clearIndexes() {
  initPromise = null;
  ready = false;
  initError.value = null;
  initVersion++;
  stateBySlug.clear();
  knowledgeMapBySlug.clear();
  filesBySlug.clear();
  clearFileContentCache();
  topicSummaryCache = null;
}

/* ------------------------------------------------------------------ */
/*  Test-only injection API                                            */
/* ------------------------------------------------------------------ */

export function __resetForTest(): void {
  clearIndexes();
}

export function __injectTestData(data: {
  summaries: TopicSummary[];
  states: Record<string, StateV1>;
  knowledgeMaps: Record<string, string>;
  fileContents: Record<string, string>;
  files?: Record<string, TopicFiles>;
}): void {
  topicSummaryCache = data.summaries;
  for (const [slug, state] of Object.entries(data.states)) stateBySlug.set(slug, state);
  for (const [slug, md] of Object.entries(data.knowledgeMaps)) knowledgeMapBySlug.set(slug, md);
  for (const [slug, files] of Object.entries(data.files ?? {})) filesBySlug.set(slug, files);
  for (const [path, content] of Object.entries(data.fileContents)) setFileContent(path, content);
  ready = true;
}

/* ------------------------------------------------------------------ */
/*  Build indexes from API response                                    */
/* ------------------------------------------------------------------ */

function buildIndexes(
  summaries: TopicSummary[],
  topicDataMap: Map<
    string,
    {
      state: StateV1;
      knowledgeMap: string;
      files?: TopicFiles;
    }
  >,
) {
  topicSummaryCache = summaries;

  for (const [slug, data] of topicDataMap) {
    stateBySlug.set(slug, data.state);
    knowledgeMapBySlug.set(slug, data.knowledgeMap || '');
    if (data.files) filesBySlug.set(slug, data.files);
  }
}

/* ------------------------------------------------------------------ */
/*  Initialization (called once on app mount)                          */
/* ------------------------------------------------------------------ */

export async function initTopicData(): Promise<void> {
  if (ready) return;
  if (initPromise) return initPromise;

  const version = initVersion;

  /* Never rejects: a server that is down or an aborted request must not
     propagate out to callers (main.ts awaits this before mounting, and
     listenForChanges chains off it). Failures land in `initError` and the
     in-flight promise is released so a later SSE reload can retry. */
  initPromise = (async () => {
    try {
      const resp = await fetch('/api/topics');
      if (!resp.ok) {
        throw new Error(`GET /api/topics responded ${resp.status} ${resp.statusText}`);
      }
      if (version !== initVersion) {
        initPromise = null;
        return;
      }
      const summaries: TopicSummary[] = await resp.json();

      const topicDataMap = new Map();
      await Promise.all(
        summaries.map(async (s) => {
          try {
            const r = await fetch(`/api/topics/${encodeURIComponent(s.slug)}`);
            if (r.ok && version === initVersion) {
              topicDataMap.set(s.slug, await r.json());
            }
          } catch {
            /* One unreadable topic should not blank the whole dashboard;
               the topic renders as not-found and the others still load. */
          }
        }),
      );

      if (version !== initVersion) {
        initPromise = null;
        return;
      }
      buildIndexes(summaries, topicDataMap);
      ready = true;
      initError.value = null;
    } catch (err) {
      initVersion++;
      ready = false;
      topicSummaryCache = null;
      initPromise = null;
      initError.value = err instanceof Error ? err.message : String(err);
    }
  })();

  return initPromise;
}

/* ------------------------------------------------------------------ */
/*  SSE file change listener                                           */
/* ------------------------------------------------------------------ */

export function listenForChanges(callback: () => void): () => void {
  return createSSEListener('/api/events', () => {
    clearIndexes();
    initTopicData().then(() => {
      /* A failed re-init now resolves rather than rejects, so only signal a
         data change when the reload actually produced indexes — otherwise
         every component re-renders against an empty cache. */
      if (!ready) return;
      dataVersion.value++;
      callback();
    });
  });
}

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

export function listAllTopics(): TopicSummary[] {
  return topicSummaryCache ?? [];
}

export function loadTopic(slug: string): StateV1 | null {
  return stateBySlug.get(slug) ?? null;
}

export function loadKnowledgeMap(slug: string): string | null {
  return knowledgeMapBySlug.get(slug) ?? null;
}

export function loadTopicFiles(slug: string): TopicFiles | null {
  return filesBySlug.get(slug) ?? null;
}
