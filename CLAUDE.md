# CLAUDE.md

Retro Console: five original Nintendo-style browser games behind a console menu.
Stack: Vite + TypeScript (strict) + Phaser. Plain Canvas for game 04, PeerJS for game 03 online play. No React.

## Always

- Follow the **Rules** section in `README.md`.
- One game at a time. Read that game's `README.md` checklist first, and tick a step (`- [x]`) only once it is built and tested.
- Explain the plan before each step and summarise the changes after it.
- Game layout: `src/main.ts`, `src/config.ts`, `src/scenes/`, `src/entities/`, `src/systems/`, `src/content/`.
- Code used by more than one game goes in `shared/` (import it as `@shared/...`).
- Original art, sound and names only, generated in code.

## Commands

- `npm run dev` / `npm run typecheck` / `npm run build` / `npm run security:audit`
- Run `npm run build` before ticking a step.

## Adding a game

A folder in `games/` that contains an `index.html` is picked up automatically by `tooling/pages.ts`.
In `src/console/gameCatalog.ts`, set its status to `in-development` while building it and to `playable` when it is finished.
Game pages use the shared shell: `@shared/game-shell/*` (page CSS, menu button) and `@shared/phaser/createPixelGame`.
In-game text must use `addPixelText` from `@shared/phaser/pixelText` (data font in `shared/pixel-font/`), never `scene.add.text`, which blurs when zoomed.

## Do not read

`node_modules/`, `dist/`, `package-lock.json`, `.env` / `.env.local` (`.env.example` is fine).
