import { describe, expect, it } from 'vitest';
import {
  buildFileTree,
  collectFiles,
  ancestorDirPaths,
} from '@/components/sidebar/tabs/buildFileTree';

describe('buildFileTree', () => {
  it('builds nested tree from flat paths', () => {
    const tree = buildFileTree([
      'exercises/css/box-model/challenge/README.md',
      'exercises/css/box-model/task.md',
      'exercises/js/basics/1.js',
      'exercises/root.md',
    ]);
    expect(tree).toEqual([
      {
        type: 'dir',
        name: 'css',
        path: 'css',
        children: [
          {
            type: 'dir',
            name: 'box-model',
            path: 'css/box-model',
            children: [
              {
                type: 'dir',
                name: 'challenge',
                path: 'css/box-model/challenge',
                children: [
                  {
                    type: 'file',
                    name: 'README.md',
                    label: 'README',
                    path: 'exercises/css/box-model/challenge/README.md',
                  },
                ],
              },
              { type: 'file', name: 'task.md', label: 'Task', path: 'exercises/css/box-model/task.md' },
            ],
          },
        ],
      },
      {
        type: 'dir',
        name: 'js',
        path: 'js',
        children: [
          {
            type: 'dir',
            name: 'basics',
            path: 'js/basics',
            children: [{ type: 'file', name: '1.js', label: '1.js', path: 'exercises/js/basics/1.js' }],
          },
        ],
      },
      { type: 'file', name: 'root.md', label: 'Root', path: 'exercises/root.md' },
    ]);
  });

  it('places directories before files and sorts alphabetically', () => {
    const tree = buildFileTree([
      'sessions/z.md',
      'sessions/a/b.md',
      'sessions/a/c.md',
      'sessions/b.md',
    ]);
    expect(tree).toEqual([
      {
        type: 'dir',
        name: 'a',
        path: 'a',
        children: [
          { type: 'file', name: 'b.md', label: 'B', path: 'sessions/a/b.md' },
          { type: 'file', name: 'c.md', label: 'C', path: 'sessions/a/c.md' },
        ],
      },
      { type: 'file', name: 'b.md', label: 'B', path: 'sessions/b.md' },
      { type: 'file', name: 'z.md', label: 'Z', path: 'sessions/z.md' },
    ]);
  });

  it('handles single root file', () => {
    expect(buildFileTree(['sessions/overview.md'])).toEqual([
      { type: 'file', name: 'overview.md', label: 'Overview', path: 'sessions/overview.md' },
    ]);
  });

  it('handles multiple files in same directory', () => {
    expect(buildFileTree(['exercises/css/README.md', 'exercises/css/task.js'])).toEqual([
      {
        type: 'dir',
        name: 'css',
        path: 'css',
        children: [
          { type: 'file', name: 'README.md', label: 'README', path: 'exercises/css/README.md' },
          { type: 'file', name: 'task.js', label: 'Task', path: 'exercises/css/task.js' },
        ],
      },
    ]);
  });

  it('returns empty array for empty input', () => {
    expect(buildFileTree([])).toEqual([]);
  });
});

describe('collectFiles', () => {
  it('collects all files from nested tree', () => {
    const tree = buildFileTree(['exercises/a/1.md', 'exercises/a/2.md', 'exercises/b/3.md']);
    expect(collectFiles(tree)).toEqual([
      { type: 'file', name: '1.md', label: '1.md', path: 'exercises/a/1.md' },
      { type: 'file', name: '2.md', label: '2.md', path: 'exercises/a/2.md' },
      { type: 'file', name: '3.md', label: '3.md', path: 'exercises/b/3.md' },
    ]);
  });

  it('returns empty for empty tree', () => {
    expect(collectFiles([])).toEqual([]);
  });

  it('handles single root file', () => {
    expect(collectFiles(buildFileTree(['sessions/x.md']))).toEqual([
      { type: 'file', name: 'x.md', label: 'X', path: 'sessions/x.md' },
    ]);
  });
});

describe('ancestorDirPaths', () => {
  it('returns multiple ancestors for nested path', () => {
    expect(ancestorDirPaths('sessions/css/advanced/box.md')).toEqual(['css', 'css/advanced']);
  });

  it('returns single ancestor for one-level path', () => {
    expect(ancestorDirPaths('sessions/css/box.md')).toEqual(['css']);
  });

  it('returns empty for root file (no ancestors)', () => {
    expect(ancestorDirPaths('sessions/overview.md')).toEqual([]);
  });

  it('returns empty for short path', () => {
    expect(ancestorDirPaths('sessions')).toEqual([]);
  });
});
