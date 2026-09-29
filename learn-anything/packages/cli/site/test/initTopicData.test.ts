import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  initTopicData,
  getInitError,
  getDataVersion,
  __resetForTest,
} from '@/composables/useTopicData';

/* ==================================================================== */
/*  initTopicData() must never reject.                                 */
/*                                                                     */
/*  main.ts awaits this before app.mount(), so a rejected promise meant  */
/*  a permanently blank page whenever the API server was unreachable.  */
/*  Failures belong on getInitError() instead.                          */
/* ==================================================================== */

function mockFetch(impl: (url: string) => Promise<Response>) {
  const spy = vi.fn(impl);
  vi.stubGlobal('fetch', spy);
  return spy;
}

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Internal Server Error',
    json: async () => body,
  } as unknown as Response;
}

describe('initTopicData — failure handling', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    __resetForTest();
  });

  it('resolves and records the error when /api/topics is unreachable', async () => {
    mockFetch(async () => {
      throw new TypeError('Failed to fetch');
    });

    await expect(initTopicData()).resolves.toBeUndefined();
    expect(getInitError()).toBe('Failed to fetch');
  });

  it('resolves and records the error on a non-OK /api/topics response', async () => {
    mockFetch(async () => jsonResponse(null, false, 500));

    await expect(initTopicData()).resolves.toBeUndefined();
    expect(getInitError()).toContain('500');
  });

  it('clears a previous error after a later successful load', async () => {
    mockFetch(async () => {
      throw new TypeError('Failed to fetch');
    });
    await initTopicData();
    expect(getInitError()).not.toBeNull();

    __resetForTest();
    mockFetch(async (url) =>
      url === '/api/topics' ? jsonResponse([]) : jsonResponse({ state: null }),
    );
    await initTopicData();
    expect(getInitError()).toBeNull();
  });

  it('still succeeds when a single topic request fails', async () => {
    mockFetch(async (url) => {
      if (url === '/api/topics') {
        return jsonResponse([{ slug: 'js' }, { slug: 'python' }]);
      }
      if (url === '/api/topics/js') {
        throw new TypeError('Failed to fetch');
      }
      return jsonResponse({ state: { slug: 'python' }, knowledgeMap: '# Python' });
    });

    await expect(initTopicData()).resolves.toBeUndefined();
    // The healthy topic loaded and no error was surfaced for the broken one.
    expect(getInitError()).toBeNull();
  });

  it('allows a retry after a failure instead of caching the rejection', async () => {
    const fetchSpy = mockFetch(async () => {
      throw new TypeError('Failed to fetch');
    });
    await initTopicData();
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // initPromise must have been released, so a second attempt re-fetches
    // rather than returning the already-settled first promise.
    fetchSpy.mockImplementation(async (url: string) =>
      url === '/api/topics' ? jsonResponse([]) : jsonResponse({}),
    );
    await initTopicData();
    expect(fetchSpy.mock.calls.length).toBeGreaterThan(1);
  });

  it('does not bump the data version when the reload produced no indexes', async () => {
    mockFetch(async () => {
      throw new TypeError('Failed to fetch');
    });
    await initTopicData();
    const version = getDataVersion();
    expect(version).toBe(0);
  });
});
