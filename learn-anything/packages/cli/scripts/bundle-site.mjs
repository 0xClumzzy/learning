#!/usr/bin/env node
/* global console, process */
/**
 * bundle-site.mjs — Build script
 *
 * 1. Runs `vite build` in packages/cli/site/ to produce site/dist/
 * 2. Copies site/dist/ + serve.mjs + .gitignore → site-dist/
 *
 * site-dist/ is published to npm and copied to .peaches/site/ at runtime.
 *
 * Usage: node scripts/bundle-site.mjs
 */
import {
  cpSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  existsSync,
  readdirSync,
  readFileSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const packageDir = join(__dirname, '..');
const siteDir = join(packageDir, 'site');
const distDir = join(siteDir, 'dist');
const outputDir = join(packageDir, 'site-dist');

/**
 * Absolute path to a package's `bin` script, resolved from the site
 * workspace. Goes through package.json because vite's `exports` map does not
 * expose ./bin/vite.js as a subpath, so require.resolve() alone would throw.
 */
function resolveBin(pkg, binName) {
  const pkgJson = require.resolve(`${pkg}/package.json`, { paths: [siteDir] });
  const manifest = JSON.parse(readFileSync(pkgJson, 'utf-8'));
  const bin = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.[binName];
  if (!bin) throw new Error(`Could not resolve ${pkg} binary "${binName}"`);
  return join(dirname(pkgJson), bin);
}

/* ------------------------------------------------------------------ */
/*  Main (only when run as script, not on import)                      */
/* ------------------------------------------------------------------ */

const isMain = fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  console.log('[bundle-site] Building site with vite...');
  /* Resolve vite's entry point directly rather than shelling out to `pnpm
     exec`, which made the build depend on pnpm being installed and on PATH.

     stdio is inherited deliberately, but execSync does NOT block when it
     cannot capture output: with `inherit` it returns as soon as the child is
     spawned, so the copy below used to race an unfinished build (and fail
     with a bare ENOENT on site/dist). Poll for the child's exit instead. */
  const child = spawnSync(process.execPath, [resolveBin('vite', 'vite'), 'build'], {
    cwd: siteDir,
    stdio: 'inherit',
  });

  if (child.error) {
    console.error(`[bundle-site] Failed to launch vite: ${child.error.message}`);
    process.exit(1);
  }
  if (child.status !== 0) {
    console.error(`[bundle-site] vite build failed with exit code ${child.status}`);
    process.exit(child.status ?? 1);
  }

  // Clear output
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });

  // Copy dist/ contents. Guard the copy: a missing or empty site/dist means
  // the build silently produced nothing, and failing here is far clearer than
  // shipping an npm package with no dashboard in it.
  if (!existsSync(distDir) || readdirSync(distDir).length === 0) {
    console.error(
      `[bundle-site] vite build reported success but produced no output in ${distDir}`,
    );
    process.exit(1);
  }

  console.log('[bundle-site] Copying dist/ -> site-dist/');
  cpSync(distDir, outputDir, { recursive: true });

  // Copy serve.mjs
  const serveSrc = join(siteDir, 'serve.mjs');
  const serveDest = join(outputDir, 'serve.mjs');
  if (existsSync(serveSrc)) {
    cpSync(serveSrc, serveDest);
  }

  // Write .gitignore
  writeFileSync(join(outputDir, '.gitignore'), 'node_modules\ndist\n', 'utf-8');

  const count = readdirSync(outputDir, { recursive: true }).length;
  console.log(`[bundle-site] site-dist/ ready with ${count} files`);
}
