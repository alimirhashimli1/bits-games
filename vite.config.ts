import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

import { contentSecurityPolicy } from './tooling/csp.ts';
import { findHtmlPages } from './tooling/pages.ts';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

/** The only game with online play: the one page whose CSP may reach a signalling server. */
const ONLINE_PAGE = '03-arena-fighters';

export default defineConfig(({ mode }) => ({
  // Relative asset paths, so the build works from any folder (e.g. GitHub Pages).
  base: './',
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
  plugins: [
    contentSecurityPolicy({ onlinePage: ONLINE_PAGE, peerHost: loadEnv(mode, rootDir, 'VITE_').VITE_PEER_HOST }),
  ],
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
}));
