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

/** The free public PeerJS server, used when no server of our own is configured. */
const DEFAULT_PEER_HOST = '0.peerjs.com';

/**
 * Online play (game 03) needs the signalling server, which introduces the two players'
 * browsers to each other and is then done with: the match itself goes straight between them.
 * Only the page that has online play is allowed to reach it, so the other games and the
 * console menu stay shut in to their own origin.
 */
export interface CspOptions {
  /** Part of the path of the page allowed to reach the signalling server. */
  readonly onlinePage: string;
  /** The signalling server, from `VITE_PEER_HOST`. Empty means the free public one. */
  readonly peerHost?: string;
}

function peerConnectSources({ peerHost }: CspOptions): readonly string[] {
  const host = peerHost === undefined || peerHost === '' ? DEFAULT_PEER_HOST : peerHost;
  return [`https://${host}`, `wss://${host}`];
}

function buildPolicy(isDevServer: boolean, isOnlinePage: boolean, options: CspOptions): string {
  const extras = [
    ...(isDevServer ? DEV_SERVER_CONNECT_SOURCES : []),
    ...(isOnlinePage ? peerConnectSources(options) : []),
  ];
  return Object.entries(DIRECTIVES)
    .map(([name, sources]) => {
      const allSources = name === 'connect-src' ? [...sources, ...extras] : sources;
      return `${name} ${allSources.join(' ')}`;
    })
    .join('; ');
}

/** Vite plugin that adds a Content Security Policy meta tag to every HTML page. */
export function contentSecurityPolicy(options: CspOptions): Plugin {
  return {
    name: 'retro-console:csp',
    transformIndexHtml(_html, context) {
      return [
        {
          tag: 'meta',
          attrs: {
            'http-equiv': 'Content-Security-Policy',
            content: buildPolicy(context.server !== undefined, context.path.includes(options.onlinePage), options),
          },
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}
