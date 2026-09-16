import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Lists every HTML page Vite should build: the console menu, plus each
 * folder in `games/` that has its own `index.html`.
 */
export function findHtmlPages(rootDir: string): Record<string, string> {
  const pages: Record<string, string> = { console: join(rootDir, 'index.html') };
  const gamesDir = join(rootDir, 'games');
  if (!existsSync(gamesDir)) return pages;

  for (const entry of readdirSync(gamesDir, { withFileTypes: true })) {
    const htmlPath = join(gamesDir, entry.name, 'index.html');
    if (entry.isDirectory() && existsSync(htmlPath)) {
      pages[entry.name] = htmlPath;
    }
  }
  return pages;
}
