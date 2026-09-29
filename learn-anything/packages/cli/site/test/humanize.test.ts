import { describe, it, expect } from 'vitest';
import { humanizeFileName, buildFileTree, collectFiles } from '@/components/sidebar/tabs/buildFileTree';

describe('humanizeFileName', () => {
  it('strips the date suffix from session notes', () => {
    expect(humanizeFileName('taint-analysis-2026-09-24.md')).toBe('Taint Analysis');
  });

  it('strips a compact timestamp from quiz decks', () => {
    expect(humanizeFileName('second-order-injection-quiz-2026-09-27-101500.json')).toBe(
      'Second Order Injection Quiz',
    );
    expect(humanizeFileName('closures-quiz-20260927-101500.json')).toBe('Closures Quiz');
  });

  it('leaves short acronyms uppercase', () => {
    expect(humanizeFileName('sql-injection-2026-09-20.md')).toBe('SQL Injection');
    expect(humanizeFileName('cve-2026-01-01.md')).toBe('CVE');
  });

  it('does not mangle a name with no date', () => {
    expect(humanizeFileName('README.md')).toBe('README');
    expect(humanizeFileName('owasp-top-10.md')).toBe('OWASP Top 10');
  });

  it('never returns an empty label', () => {
    // A date-only filename must not collapse to "".
    expect(humanizeFileName('2026-09-24.md')).not.toBe('');
  });
});

describe('buildFileTree labels', () => {
  it('every file leaf carries a display label', () => {
    const tree = buildFileTree([
      'sessions/injection-fundamentals/taint-analysis-2026-09-24.md',
      'sessions/defence/parameterised-queries-2026-09-25.md',
    ]);
    const files = collectFiles(tree);
    expect(files.length).toBe(2);
    for (const f of files) {
      expect(f.label).toBeTruthy();
      expect(f.label).not.toMatch(/\d{4}-\d{2}-\d{2}/); // no raw date leaks
    }
  });
});
