# 🎮 Retro Console

A browser game console inspired by classic Nintendo-era games. You start on a **console menu**, pick a cartridge, and play one of five original games. Every sprite and sound is made in code, so there are no copyrighted characters, images or music.

## Games

| #  | Game | Genre | Inspired by | Status |
|----|------|-------|-------------|--------|
| 01 | [Dojo Quest](games/01-dojo-quest/README.md) | Story-driven fighting | Karateka | ✅ Playable |
| 02 | Pixel Plumber | Platformer | Super Mario Bros. | ⏳ Planned |
| 03 | Arena Fighters | Versus fighting, online play by link | Street Fighter II | ⏳ Planned |
| 04 | Turbo Road | Pseudo-3D road racing | OutRun | ⏳ Planned |
| 05 | Crystal Dungeon | Top-down action adventure | The Legend of Zelda | ⏳ Planned |

## Tech stack

| Tool | Used for |
|------|----------|
| [Vite](https://vite.dev) | Dev server and multi-page build (menu + one page per game) |
| [TypeScript](https://www.typescriptlang.org) (strict) | All code |
| [Phaser](https://phaser.io) | Game engine for games 01, 02, 03 and 05 (installed with game 01) |
| HTML Canvas | Pseudo-3D road renderer for game 04 |
| [PeerJS](https://peerjs.com) | Peer-to-peer online play in game 03 (installed with game 03) |
| Web Audio API | Chiptune sound effects and music |

**Why no React?** Games redraw a canvas 60 times per second in a game loop, which is Phaser's job. The menu is small enough for plain TypeScript.

## Getting started

Requires **Node.js 20.19 or newer**.

```bash
npm install
npm run dev
```

Then open <http://localhost:5173>.

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the dev server with hot reload |
| `npm run typecheck` | Type-check all code |
| `npm run build` | Type-check, then build everything into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run security:audit` | Check dependencies for known vulnerabilities |

## Console controls

| Action | Keyboard | Gamepad | Mouse |
|--------|----------|---------|-------|
| Move between cartridges | Arrow keys / WASD | D-pad / left stick | Hover |
| Start the game | Enter / Space | A / Start | Click |

## Project structure

```
.
├─ index.html              Console menu page
├─ src/console/            Console menu code
├─ shared/                 Code reused by several games (audio, sprites, ...)
├─ games/                  One folder per game, each with its own README
├─ tooling/                Build helpers used by vite.config.ts
├─ CLAUDE.md               Rules for the AI assistant
├─ .claudeignore           Files the AI assistant should not read
└─ .claude/settings.json   Enforced read-deny rules for the AI assistant
```

## Rules

These apply to every change in this project.

### Workflow

1. **One game at a time.** A game is finished (all steps ticked, tested and audited) before the next one starts.
2. **README before code.** Each game folder starts with a `README.md` that lists every build step as `- [ ]`.
3. **Tick as you go.** A step becomes `- [x]` only when it is built **and** tested.
4. **Explain every step.** Say what will be built before building it, and summarise what changed afterwards.

### Code

5. **Same structure in every game:**
   - `src/main.ts`: entry point
   - `src/config.ts`: tunable numbers (speeds, damage, sizes)
   - `src/scenes/`: screens (title, level, game over, ...)
   - `src/entities/`: things in the world (player, enemies, items)
   - `src/systems/`: logic that acts on entities (combat, AI, physics)
   - `src/content/`: data such as levels, story text and sprite pixel maps
6. **Small files, one job each.** Use clear names and no magic numbers (those live in `config.ts`).
7. **No duplication.** Code used by two or more games moves to `shared/`.
8. **Strict TypeScript.** No `any`, no unused code, no disabled type checks.
9. **Original content only.** No copyrighted characters, sprites, music or names.

### Security

10. **No secrets in code.** Local configuration goes in `.env.local` (git-ignored), and `.env.example` documents it. Variables starting with `VITE_` are visible in the browser, so they must never hold secrets.
11. **Pinned, minimal dependencies.** Exact versions only (`.npmrc` sets `save-exact`), and only packages we actually use.
12. **Audit before finishing a game.** `npm run security:audit` must pass.
13. **Content Security Policy.** Every page gets a CSP added at build time (`tooling/csp.ts`). Never use `eval`, and never put dynamic data into `innerHTML`.
14. **Network data is untrusted.** Online multiplayer messages are validated before they are used.

### Token efficiency

15. `node_modules/`, `dist/`, lock files, logs and env files are listed in `.claudeignore` and blocked in `.claude/settings.json`.

## Known issues

- **External monitors:** game pixels can still look slightly uneven on some external screens (reported with Windows display scaling at 125%). The zoom is already calculated in physical screen pixels; the next thing to check is the canvas landing on a half screen pixel when it is centred.

## Roadmap

### Step 0: Project setup

- [x] Root README with project description and rules
- [x] `CLAUDE.md`, `.claudeignore`, `.claude/settings.json`, `.gitignore`, `.editorconfig`, `.env.example`, `.npmrc`
- [x] Vite + TypeScript project (strict mode, `@shared` alias, auto-discovered game pages, CSP)
- [x] Console menu: cartridge library, keyboard / mouse / gamepad controls, sound effects
- [x] Game 01 README with its step-by-step plan

### Games

- [x] 01 Dojo Quest
- [ ] 02 Pixel Plumber
- [ ] 03 Arena Fighters
- [ ] 04 Turbo Road
- [ ] 05 Crystal Dungeon
