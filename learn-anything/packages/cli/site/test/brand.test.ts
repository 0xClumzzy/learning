import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(__dirname, '..');
// site -> cli -> packages -> <project root>
const repoRoot = resolve(siteRoot, '../../..');

const logoSvg = readFileSync(resolve(repoRoot, 'logo.svg'), 'utf-8');
const markVue = readFileSync(resolve(siteRoot, 'src/components/brand/PeachMark.vue'), 'utf-8');
const mainCss = readFileSync(resolve(siteRoot, 'src/styles/main.css'), 'utf-8');

/** Pull a `d="..."` value out of an SVG/Vue source blob. */
function paths(src: string): string[] {
  return [...src.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]!);
}

describe('brand identity', () => {
  it('logo.svg is the canonical mark and is a valid standalone SVG', () => {
    expect(logoSvg).toContain('<svg');
    expect(logoSvg).toContain('viewBox="0 0 512 512"');
    expect(paths(logoSvg).length).toBeGreaterThan(0);
  });

  it('the sidebar mark uses the same geometry as logo.svg', () => {
    // Regression guard: the sidebar once shipped a hand-drawn, flat, two-tone
    // glyph that did not match logo.svg, so the product UI and the published
    // logo showed two different marks.
    //
    // Compares the full multiset of path data, not just containment: the body
    // path appears twice in each file (clipPath + fill), so a one-sided edit
    // would otherwise still satisfy a naive "contains" check.
    const norm = (xs: string[]) => [...xs].sort();
    expect(norm(paths(markVue))).toEqual(norm(paths(logoSvg)));
  });

  it('the sidebar mark keeps the green leaf from the logo', () => {
    // The mismatched glyph drew its leaf in brand peach, which read as a
    // monochrome blob rather than a peach.
    expect(markVue).toContain('#4C7C38');
    expect(markVue).toContain('#93C468');
  });

  it('the inlined mark namespaces its gradient ids', () => {
    // Bare `id="peach"` / `id="leaf"` would collide with any other inline SVG.
    for (const id of ['pm-peach', 'pm-leaf', 'pm-blush', 'pm-body']) {
      expect(markVue).toContain(`id="${id}"`);
    }
    expect(markVue).not.toMatch(/id="(peach|leaf|blush|body)"/);
  });

  it('the mark is decorative, since the wordmark carries the name', () => {
    expect(markVue).toContain('aria-hidden="true"');
  });
});

describe('theme status scale', () => {
  const tokens = (name: string) =>
    [...mainCss.matchAll(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`, 'g'))].map((m) =>
      m[1]!.toLowerCase(),
    );

  it('defines every semantic status token in both the root and .dark scopes', () => {
    for (const name of ['mastered', 'in-progress', 'attention']) {
      // Declared twice: once in @theme, once in .dark.
      expect(tokens(name).length, `--color-${name} declaration count`).toBe(2);
    }
  });

  it('keeps every mastery state visually distinct', () => {
    // Regression guard: `mastered` and `needs_practice` once both resolved to
    // brand-2, rendering two different states pixel-identical in the heatmap.
    const mastered = tokens('mastered')[0]!;
    const inProgress = tokens('in-progress')[0]!;
    const attention = tokens('attention')[0]!;

    expect(new Set([mastered, inProgress, attention]).size).toBe(3);
  });

  it('agrees between the @theme and .dark declarations', () => {
    for (const name of ['mastered', 'in-progress', 'attention']) {
      const [a, b] = tokens(name);
      expect(a).toBe(b);
    }
  });

  it('has retired the ambiguous --color-progress token', () => {
    expect(mainCss).not.toContain('--color-progress:');
  });
});
