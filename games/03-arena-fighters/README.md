# 🥊 Game 03: Arena Fighters

A one-on-one versus fighting game inspired by **Street Fighter II** (1991). Pick a fighter and battle the CPU, a friend on the same keyboard, or anyone online by sending them a link. All characters, story and art are original.

## Story

Every ten years the **Iron Crown** tournament is held in the tower city of **Vanmoor**, and every ten years its host, **Magnus Vane**, keeps the crown. Four fighters have their own reasons to take it from him. Each one fights through the others to reach the top of his tower.

## Fighters

| Fighter | Style | Special moves |
|---------|-------|---------------|
| **Brand** | Balanced street brawler. The one to learn the game with. | *Ember Shot*: a fireball. *Flare Rise*: a rising uppercut that beats jump-ins. |
| **Tala** | Fast dancer-kicker with a short reach and quick feet. | *Whirl Kick*: a spinning kick that travels. *Cartwheel*: a dash that passes through fireballs. |
| **Grom** | Huge, slow wrestler who hits very hard. | *Boulder Toss*: a command throw. *Ram*: a charging headbutt. |
| **Nova** | Long-legged kickboxer who controls space. | *Static Wave*: a slow projectile. *Thunder Heel*: an overhead axe kick that must be blocked standing. |
| **Magnus Vane** | The boss. CPU only, at the end of arcade mode. | His own set, revealed in step 15. |

## How it plays

- **Best of three rounds**, 99 seconds each. The fighter with more health when time runs out wins the round. A double KO or equal health is a draw round.
- **Four attack buttons:** light punch, heavy punch, light kick, heavy kick. Standing, crouching and jumping versions of each.
- **Blocking:** hold away from the opponent. Standing blocks stop high attacks and overheads, crouching blocks stop low attacks. Blocked special moves still chip a little health.
- **Throws:** light punch + light kick up close. Pressing the same buttons at the same moment escapes the throw.
- **Special moves** use classic motion inputs, such as ↓ ↘ → + punch. The game reads the last half-second of inputs, so they do not need frame-perfect timing.
- **Combos:** some normal attacks can be cancelled into special moves on hit or block, and a combo counter shows the hits.
- **Knockdowns:** heavy hits, throws and some specials knock the opponent down. They get up after a fixed time and cannot be hit while they are down.
- **Game modes:**
  - **Arcade:** fight the other three fighters, then Magnus Vane, with a story intro and an ending for each fighter. Continue after a loss.
  - **Versus:** two players on one keyboard, one keyboard plus a gamepad, or two gamepads.
  - **Online:** one player creates a room and sends the link. The other opens it and the match starts. There are no accounts, and nothing is stored on a server.
- **Five arenas**, one for each fighter plus the tower roof. Each has animated crowds and background details.

## Controls

The keyboard is shared in versus mode, so each player gets their own half. Gamepads work for either player. The final layout is fixed in step 4 and listed on the controls screen.

| Action | Player 1 | Player 2 | Gamepad |
|--------|----------|----------|---------|
| Move / jump / crouch | W A S D | ← ↑ → ↓ | D-pad / left stick |
| Light / heavy punch | F / G | K / L | X / Y |
| Light / heavy kick | V / B | , / . | A / B |
| Pause | Esc | Esc | Start |
| Mute sound and music | M | M | — |
| Back to console menu | Backspace or the `< MENU` button | | — |

In arcade and online mode, the single player uses the Player 1 keys or any gamepad.

## Technical plan

- **Engine:** Phaser (already installed) draws the game and runs the menus. The fight itself does **not** use Phaser physics.
- **Resolution:** 320×180 pixels through `@shared/phaser/createPixelGame`, the same as games 01 and 02.
- **Fight simulation** (`src/systems/sim/`): the fight is a pure, fixed-step simulation that runs at 60 steps per second. Each step takes the current state and one input per player and returns the next state. The simulation does not read the clock, `Math.random` or anything else from Phaser.
  - **Whole numbers only.** Positions and speeds are integers in sub-pixels (1 pixel = 256 units), and randomness comes from a seeded generator stored in the state. Two browsers given the same inputs therefore compute the same fight, frame for frame, which is what makes online play possible.
  - Phaser scenes only **draw** the current state: sprites, the HUD, camera and effects.
- **Inputs** (`src/systems/input/`): every source, whether keyboard half, gamepad, CPU or online opponent, is turned into one small **bitmask per frame** (4 directions and 4 buttons). The simulation cannot tell who is playing, so the CPU cannot cheat and an online opponent is handled like any other player.
  - A short **input history** is kept per player, and motion inputs (↓ ↘ →, → ↓ ↘, charge back then forward, …) are read from it with a little leniency.
- **Frame data** (`src/content/fighters/`): every move is data: startup, active and recovery frames, damage, hitstun, blockstun, pushback, how it must be blocked (high, low or overhead) and what it can cancel into. Hitboxes and hurtboxes are listed per frame. Every number lives there or in `config.ts`.
- **Hitbox debug view:** press **H** during a fight to see hurtboxes, hitboxes and throw boxes.
- **Art:** fighters are posed with the shared humanoid rig (`@shared/pixel-art/humanoidRig`), each with its own body, head and palette. Arenas and effects are text pixel maps. There are no image files.
- **CPU** (`src/systems/cpu/`): the CPU produces inputs just like a player. It reacts after a delay and makes mistakes on purpose, both set per difficulty. Each fighter has its own tendencies: Grom walks in for throws, and Nova keeps her distance.
- **Online play** (`src/systems/net/`, PeerJS installed in step 18):
  - The host's PeerJS id goes into the link (`?room=…`). The guest's browser connects to the host directly (WebRTC). The signalling server only introduces the two browsers. It is the free public PeerJS server unless `VITE_PEER_HOST` in `.env.local` points to your own (see `.env.example`).
  - **Delay-based lockstep:** each browser sends its input for frame *N + delay*, and a frame is only simulated once both inputs for it have arrived. The delay is a few frames, chosen from the measured round-trip time when the match starts.
  - **Every message is untrusted** (rule 14). Each message is checked against a strict shape: known type, whole-number frame within a window around the current frame, input bitmask within 0–255, and a fighter id from the roster. Anything else is dropped. Messages are never put into the page as HTML.
  - **Desync check:** every second both sides compare a checksum of the fight state, and a mismatch ends the match with a message instead of letting the two games drift apart.
  - Disconnects and pauses are handled: if the opponent's inputs stop arriving, the fight freezes and shows a notice, and after a few seconds it returns to the menu.
  - The build CSP (`tooling/csp.ts`) is extended only by the signalling server's address.
- **Dev shortcut:** in `npm run dev`, add `?scene=Fight` (or another scene name) to jump straight to a scene, and `&p1=brand&p2=grom&stage=dock` to pick the matchup.

```
games/03-arena-fighters/
├─ README.md
├─ index.html
└─ src/
   ├─ main.ts          Creates the Phaser game
   ├─ config.ts        Tunable numbers and control bindings
   ├─ scenes/          Boot, Title, mode select, character select, VS, Fight, results, ...
   ├─ entities/        Drawn fighters, projectiles and effects
   ├─ systems/         sim/ (the fight), input/, cpu/, net/
   └─ content/         Fighter bodies, poses and frame data, arenas, story, sounds, music
```

## Build steps

Each step is ticked only when it is built **and** tested.

### Phase 1: Foundation

- [ ] **1. Game page.** Add `index.html`, `main.ts` and `config.ts` using the shared game shell, and set the cartridge to `in-development` in the console menu.
  *Done when:* the game opens from the console menu and shows a placeholder screen.
- [ ] **2. Scene flow.** Placeholder Boot → Title → Mode Select → Character Select → VS → Fight → Results scenes with transitions.
  *Done when:* you can step through every scene with key presses.
- [ ] **3. Fight simulation core.** A fixed 60 Hz step with whole-number positions and a seeded random generator, kept separate from drawing. Two placeholder boxes walk, jump, push against each other and stop at the arena edges, and the camera follows both.
  *Done when:* the boxes move correctly, and replaying the same recorded inputs twice gives exactly the same final state.

### Phase 2: Fighting

- [ ] **4. Inputs.** Keyboard halves for P1 and P2, gamepads, a per-frame input bitmask, input history and a motion-input reader.
  *Done when:* both players can move independently, and a debug view shows ↓ ↘ → + punch being recognised.
- [ ] **5. Brand's sprite.** Idle, walk, crouch, jump, block, hit, knockdown, get-up and win poses, plus standing, crouching and jumping normals.
  *Done when:* every animation plays correctly in a sprite gallery scene.
- [ ] **6. Moves and frame data.** Startup, active and recovery frames with hitboxes and hurtboxes per frame, and the **H** debug view.
  *Done when:* the debug view shows hitboxes only during active frames.
- [ ] **7. Combat rules.** Hits, standing and crouching blocks, overheads and lows, hitstun, blockstun, chip damage, pushback, knockdowns, throws and throw escapes, cancels and the combo counter.
  *Done when:* all of these work between two Brands.
- [ ] **8. Special moves.** Brand's Ember Shot and Flare Rise from motion inputs, with projectiles that cancel each other out.
  *Done when:* both specials come out reliably from their motions, and never by accident while walking.
- [ ] **9. Rounds and HUD.** Health bars, timer, round wins, *ROUND 1* / *FIGHT* / *KO* / *TIME* announcements, best of three and draws.
  *Done when:* a full match can be won, lost and drawn.

### Phase 3: The roster

- [ ] **10. Tala.** Sprite, normals, Whirl Kick and Cartwheel.
- [ ] **11. Grom.** Sprite, normals, Boulder Toss and Ram.
- [ ] **12. Nova.** Sprite, normals, Static Wave and Thunder Heel.
  *Done when (10–12):* the fighter is playable against every other fighter, and no matchup is one-sided in testing.
- [ ] **13. CPU opponent.** CPU inputs with reaction delay, deliberate mistakes, difficulty levels and per-fighter tendencies.
  *Done when:* the easy CPU can be beaten by a new player and the hard CPU needs blocking and specials.
- [ ] **14. Arenas.** Four arenas with animated backgrounds, one per fighter.
  *Done when:* every arena can be picked and animates while fighting.
- [ ] **15. The boss.** Magnus Vane: his own body, moves and CPU behaviour, and the tower-roof arena.
  *Done when:* he looks clearly different from the roster and the fight is beatable but noticeably harder.

### Phase 4: Game modes

- [ ] **16. Arcade mode.** The ladder of three fighters and then the boss, rising difficulty, story intro and ending for each fighter, and continue after a loss.
  *Done when:* arcade can be finished with every fighter and shows that fighter's ending.
- [ ] **17. Local versus.** Both players choose on the character select screen, then pick an arena, and can rematch or change fighters after the match.
  *Done when:* a full versus match works on one keyboard and on keyboard + gamepad.
- [ ] **18. Online play.** Install PeerJS, create a room and share its link, join from the link, delay-based lockstep, message validation, desync check, disconnect handling and the CSP update.
  *Done when:* a full online match plays between two browsers, invalid messages are dropped, and closing one tab is handled cleanly in the other.

### Phase 5: Polish and release

- [ ] **19. Sound and music.** Hits, blocks, whiffs, specials, knockdowns and announcer jingles, plus a loop for each arena.
  *Done when:* every action has sound, and music loops without gaps.
- [ ] **20. Title, pause and options.** Menus, controls screen, CPU difficulty, round time and number of rounds. There is no pause in online matches.
  *Done when:* all menus work with keyboard and gamepad.
- [ ] **21. Final check.** Full play-through of every mode, `npm run build`, `npm run security:audit`, set the game to `playable` in the console menu, and tick game 03 in the root README.
  *Done when:* all of the above pass.
