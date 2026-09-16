import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

import { contentSecurityPolicy } from './tooling/csp.ts';
import { findHtmlPages } from './tooling/pages.ts';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  // Relative asset paths, so the build works from any folder (e.g. GitHub Pages).
  base: './',
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
  plugins: [contentSecurityPolicy()],
  build: {
    target: 'es2022',
    // Phaser alone is ~1.4 MB (~360 kB gzipped). That is expected for a game engine.
    chunkSizeWarningLimit: 1500,
    rolldownOptions: {
      input: findHtmlPages(rootDir),
      output: {
        codeSplitting: {
          // One shared Phaser file, so the browser downloads it once for all games.
          groups: [{ name: 'phaser', test: /node_modules[\\/]phaser/ }],
        },
      },
    },
  },
});
