import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  // Required so tests can mount .vue SFCs (useModalA11y, and any component
  // test). Without it, vitest treats a .vue file as raw JS and fails to parse.
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    pool: 'forks',
    globals: true,
    include: ['test/**/*.test.ts', 'test/**/*.spec.ts'],
  },
});
