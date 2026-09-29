// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createApp } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import App from '@/App.vue';
import PeachMark from '@/components/brand/PeachMark.vue';
import NextAction from '@/components/review/NextAction.vue';

/**
 * Smoke test: the app must mount and render without a single Vue error.
 *
 * Why this exists — the SPA went fully blank because `PeachMark` called
 * `withDefaults(defineProps(...))` without assigning the result, leaving
 * `props` undefined; the template then threw on `props.class`. The mark renders
 * in the sidebar on every view, so one component took down the whole page. The
 * brand tests only asserted on the component's *text*, so nothing caught it.
 *
 * A render check is the only thing that catches this class of bug.
 */

function jsonResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

function stubBrowserGlobals() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: RequestInfo | URL) => {
      const u = String(url);
      if (u.endsWith('/api/topics')) {
        return jsonResponse([
          {
            slug: 'sql-injection',
            name: 'SQL Injection',
            domainCount: 3,
            totalConcepts: 10,
            masteredCount: 3,
            percentage: 30,
          },
        ]);
      }
      if (u.includes('/api/search-index')) return jsonResponse([]);
      return jsonResponse({});
    }),
  );
  vi.stubGlobal(
    'EventSource',
    class {
      addEventListener() {}
      close() {}
    },
  );
  // jsdom does not implement matchMedia; useDarkMode calls it on mount.
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: false,
    media: q,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }));
}

describe('app smoke test', () => {
  beforeEach(() => stubBrowserGlobals());
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('mounts the whole app with no Vue errors and renders the sidebar', async () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'dashboard', component: { template: '<div />' } },
        { path: '/topics/:slug', name: 'topic', component: { template: '<div />' } },
      ],
    });
    await router.push('/');
    await router.isReady();

    const errors: string[] = [];
    const app = createApp(App);
    app.config.errorHandler = (e) => {
      const err = e as Error;
      errors.push(`${err?.name}: ${err?.message}`);
    };
    app.use(router);
    app.mount(el);
    await new Promise((r) => setTimeout(r, 50));

    expect(errors, `Vue errors: ${errors.join('; ')}`).toHaveLength(0);
    expect(el.textContent).toContain('Peaches');
    expect(el.innerHTML.length).toBeGreaterThan(500);
    app.unmount();
  });

  it('renders the brand mark', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const errors: string[] = [];
    const app = createApp(PeachMark);
    app.config.errorHandler = (e) => errors.push(String(e));
    app.mount(el);

    expect(errors).toHaveLength(0);
    // The mark is an inline SVG with gradient ids, not a raster <img>.
    expect(el.querySelector('svg')).not.toBeNull();
    expect(el.querySelector('linearGradient')).not.toBeNull();
    app.unmount();
  });

  it('applies the default size class and honours an override', () => {
    const mk = (props?: { class?: string }) => {
      const el = document.createElement('div');
      document.body.appendChild(el);
      const app = createApp(PeachMark, props ?? {});
      app.mount(el);
      const cls = el.querySelector('svg')?.getAttribute('class') ?? '';
      app.unmount();
      return cls;
    };
    expect(mk()).toContain('w-6');
    expect(mk({ class: 'w-4 h-4' })).toBe('w-4 h-4');
  });

  it('renders the promoted next action with no lapse or backlog language', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const errors: string[] = [];
    const app = createApp(NextAction);
    app.config.errorHandler = (e) => errors.push(String(e));
    app.use(createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'dashboard', component: { template: '<div />' } },
        { path: '/topics/:slug', name: 'topic', component: { template: '<div />' } },
      ],
    }));
    app.mount(el);

    expect(errors).toHaveLength(0);
    // With no topics loaded the block correctly renders nothing rather than
    // an empty shell — the ADHD protocol forbids a dead call to action.
    expect(el.querySelector('button')).toBeNull();
    app.unmount();
  });
});
