import type { Plugin } from 'vite';

type Directives = Readonly<Record<string, readonly string[]>>;

/** Where each kind of resource may be loaded from. Keep these lists short. */
const DIRECTIVES: Directives = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  // Vite (in dev) and Phaser set element styles at runtime.
  'style-src': ["'self'", "'unsafe-inline'"],
  // Generated sprites and sounds are created as data/blob URLs.
  'img-src': ["'self'", 'data:', 'blob:'],
  'font-src': ["'self'", 'data:'],
  'media-src': ["'self'", 'data:', 'blob:'],
  'connect-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'none'"],
};

/** The dev server also needs a WebSocket connection for hot reload. */
const DEV_SERVER_CONNECT_SOURCES = ['ws:', 'wss:'];

function buildPolicy(isDevServer: boolean): string {
  return Object.entries(DIRECTIVES)
    .map(([name, sources]) => {
      const allSources =
        name === 'connect-src' && isDevServer ? [...sources, ...DEV_SERVER_CONNECT_SOURCES] : sources;
      return `${name} ${allSources.join(' ')}`;
    })
    .join('; ');
}

/** Vite plugin that adds a Content Security Policy meta tag to every HTML page. */
export function contentSecurityPolicy(): Plugin {
  return {
    name: 'retro-console:csp',
    transformIndexHtml(_html, context) {
      return [
        {
          tag: 'meta',
          attrs: {
            'http-equiv': 'Content-Security-Policy',
            content: buildPolicy(context.server !== undefined),
          },
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}
