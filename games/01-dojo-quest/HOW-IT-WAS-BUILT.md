# How Dojo Quest Was Built

A walkthrough of the design and the code, file by file, for someone reading this repository cold.

Dojo Quest is a side-scrolling martial-arts game in the mould of **Karateka** (1984): you climb a mountain fortress, fight its guards one duel at a time, beat the warlord at the top and free your sister. It runs in a browser at 320×180 pixels. **Every sprite, sound and note of music is generated in code** — the repository contains no image or audio files.

It is 19 of 20 planned steps complete. The build plan and its checklist live in [README.md](README.md); this document explains *how* it was put together and *why* it is shaped the way it is.

---

## 1. The constraints that shaped everything

The project set its own rules before any code was written ([root README](../../README.md), "Rules"). Four of them drove nearly every design decision here:

| Rule | Consequence in this game |
|------|--------------------------|
| **Original content only** | No asset files at all. Art is text pixel-maps compiled to canvas textures at boot; audio is synthesised from oscillator data. |
| **Same structure in every game** | `main.ts`, `config.ts`, `scenes/`, `entities/`, `systems/`, `content/` — enforced strictly, which is what keeps a 64-file game navigable. |
| **No magic numbers** | Every speed, distance, timing and damage value lives in `config.ts`. Tuning never requires touching logic. |
| **No duplication** | Anything two games could want goes to `shared/`. The eighteen shared modules listed in §7 all came out of building this one game. |

Strict TypeScript throughout: no `any`, no unused code, no suppressed checks, with `noUncheckedIndexedAccess` and `verbatimModuleSyntax` on. That setting pays for itself repeatedly — see §8.

---

## 2. Stack, and why

- **Vite + TypeScript (strict)** — multi-page build, one page per game, auto-discovered by `tooling/pages.ts`. A Content-Security-Policy is injected into every page at build time by `tooling/csp.ts`.
- **Phaser 4** — scene lifecycle, sprite/animation management, input, tweens and the game loop. Used as a *framework for the boring parts*; all the game logic is plain classes that could be lifted out of it.
- **No React.** A game redraws a canvas 60 times a second from a game loop. A virtual DOM diffing tree has nothing to contribute, and would fight the renderer for control.
- **Web Audio API** directly, rather than Phaser's sound manager, because there are no audio files to load — everything is synthesised.

---

## 3. Architecture

Four layers, with dependencies pointing strictly downward:

```
scenes/     screens and flow        (knows everything below)
   ↓
systems/    logic acting on things  (combat, AI, controls, sound wiring)
   ↓
entities/   things in the world     (Fighter, Health, hazards, Cage)
   ↓
content/    data                    (poses, areas, story, sounds, music)
```

`config.ts` sits beside all of it and is read by every layer.

The rule that keeps this honest: **entities never reach upward**. A `Fighter` doesn't know what a scene is, doesn't play sounds and doesn't decide anything — it exposes state and *announces* events. That single discipline is why the same `Fighter` class serves the fortress duels, the boss fight and the ending, each of which wants different behaviour around it.

### The data-driven spine

Three things are described as data rather than written as code, and it's the reason the game grew as fast as it did:

1. **Fighters are poses + a body + a palette.** A new character is a data file, not a class.
2. **Areas are a paint function + an opponent + hazards.** Adding three fortress screens in step 14 meant appending three objects to an array.
3. **Sounds are envelopes and frequencies.** A new effect is five lines of data.

---

## 4. The art pipeline

There are no images. Art is produced at boot in three stages:

**Stage 1 — text pixel maps.** `shared/pixel-art/pixelMap.ts` defines art as arrays of strings, one character per pixel, `.` meaning transparent, every other character looked up in a palette:

```ts
flameLow: [
  '...r....',
  '..rorr..',
  '.roylyr.',
]
```

**Stage 2 — a drawing grid.** `shared/pixel-art/pixelGrid.ts` provides `plot`, `fillRect`, `square`, `line` (Bresenham with a square brush) and `stamp`, then hands back a pixel map. This exists so shapes can be *computed* rather than typed out by hand.

**Stage 3 — the humanoid rig.** `shared/pixel-art/humanoidRig.ts` is the important one. A pose is nothing but joint positions:

```ts
const FIGHT: HumanoidPose = {
  head: [26, 11], shoulder: [24, 17], hip: [22, 30],
  nearArm: [[29, 22], [32, 17]],   // elbow, hand
  nearLeg: [[28, 38], [31, 47]],   // knee, foot
  ...
};
```

`drawHumanoid(pose, body)` draws far limbs in shade colours, then the torso, belt, near limbs and a stamped head map. A `HumanoidBody` supplies frame size, the head pixel map, limb thicknesses, palette symbols and — added in step 16 — an optional **cape**.

The payoff: **22 poses × any number of characters.** Kenji, the guards and Mei share one pose set; swapping the palette produces a different character. Where a character needs a genuinely different silhouette, it brings its own `HumanoidBody`:

- **Gorran** — horned helmet head map, thicker limbs, a cape.
- **Mei** — long-haired head map, a slighter frame, plus two poses only she has.

`shared/phaser/pixelSprites.ts` then lays every frame of a sheet side by side on one canvas and registers it as a Phaser texture with named frames, validating that all frames share a size and that animations only reference frames that exist.

### Text

In-game text uses a **hand-made 5×7 font** (`shared/pixel-font/glyphs.ts`), drawn into a grid texture and registered as a Phaser `RetroFont` by `shared/phaser/pixelText.ts`. No web font is used in-game, because no web font stays sharp when scaled by whole numbers on a pixel grid (§8).

---

## 5. Audio

Also entirely synthesised. `shared/audio/audioEngine.ts` describes a sound as layered oscillator tones (with attack/decay envelopes and optional pitch slides) plus filtered noise bursts:

```ts
hit: {
  tones: [{ wave: 'square', freq: 200, toFreq: 60, durationMs: 130, volume: 0.24 }],
  noise: [{ durationMs: 110, volume: 0.2, cutoffHz: 900 }],
},
```

Music is three sixteen-step loops in A minor (`content/music.ts`), played by `shared/audio/music.ts` using a **lookahead scheduler**: every ~30 ms it hands the audio clock any notes due within the next 150 ms. This matters because the alternative — restarting a sound at the loop point from a JS timer — always leaves an audible seam. Scheduling ahead makes the loop boundary just another step.

Two details worth noting:

- **Playing the track that is already playing does nothing.** That one line is why the title theme carries seamlessly from the title screen through the raid, the opening and the story scenes without any of those scenes knowing about music.
- **Browsers keep pages silent until interacted with**, so the engine resumes its context on the first key press, wired up in `BootScene`.

---

## 6. Game systems

### Combat

The heart of the game, and deliberately slow and readable:

- **Two stances.** Running is fast but cannot attack or block. Fighting is slow but can do both. A fighter caught in running stance goes down in **one blow** — the Karateka rule, and the reason stance is a real decision.
- **Three heights** (high/mid/low) for punches and kicks; **two guards** (high/low). A high guard stops high and mid, a low guard stops only low, and only while facing the attacker.
- **Three attack phases.** Wind-up → active → recovery, with hitboxes live only during *active*. `attackPhaseAt()` derives the phase from elapsed time, so the drawn frame and the hitbox can never disagree.
- Each attack lands **at most once** (`markAttackLanded`), then applies damage, knockback and stun.

`Fighter.ts` is a state machine over `free | changingStance | blocking | attacking | hurt | knockedOut`, driven each frame by a `FighterIntent` — `{ move, toggleStance, attack, block }`. That interface is the seam that matters: **the player's controls and the enemy AI produce the same structure**, so neither the Fighter nor the combat system knows or cares which is driving.

### Enemy AI

`systems/guardAi.ts` decides in strict priority order: block an incoming attack → back off after being hit → attack if in reach and off cooldown → otherwise step toward the preferred distance. Difficulty is entirely data (`GUARDS.rookie/veteran/elite`): health, speed, reaction time, block chance, aggression, cooldowns, retreat chance, spacing.

Reaction time does something neat: a punch connects 100 ms after it starts, so a guard with a 160 ms reaction **physically cannot block punches** — only the slower kicks. Rookies feel clumsy for a reason that emerges from one number.

`systems/bossAi.ts` extends the same brain with two tactic sets and swaps between them at half health. Gorran visibly changes gear mid-fight.

### Hazards

`entities/hazards/` defines a tiny contract — `update(context) → outcome`, `dangerZone()` — implemented by:

- **The hawk**: cruises, then dives at wherever you stood when it launched, **flaring** (slowing and levelling out) before striking. Duck under a low guard, or strike it out of the air.
- **The gate**: a portcullis that rattles a warning, slams in 160 ms, and is solid while down.

Both only act once the area's guard is down, so duels stay one-on-one.

---

## 7. Complete file inventory

### Shared code written or extended for this game

| File | Purpose |
|------|---------|
| `shared/pixel-art/pixelMap.ts` | Text pixel maps → canvas; palette lookup, size validation |
| `shared/pixel-art/pixelGrid.ts` | Drawing surface: plot, rect, square, Bresenham line, stamp, rotate |
| `shared/pixel-art/humanoidRig.ts` | Poses as joint positions → drawn figures; optional cape |
| `shared/phaser/pixelSprites.ts` | Pixel maps → Phaser textures and animations |
| `shared/pixel-font/glyphs.ts` | The 5×7 font data |
| `shared/phaser/pixelText.ts` | Registers the font as a RetroFont; `addPixelText`, centring helpers |
| `shared/phaser/createPixelGame.ts` | Whole-**physical**-pixel zoom, recalculated on resize and DPI change |
| `shared/phaser/actionInput.ts` | Keyboard + gamepad → named actions, with sub-frame tap buffering |
| `shared/phaser/sceneInput.ts` | `onKeyPress` with per-listener event de-duplication |
| `shared/phaser/menu.ts` | The menu widget used by every menu in every game |
| `shared/phaser/typewriter.ts` | Letter-by-letter text, with an `onReveal` hook for the typing sound |
| `shared/phaser/sceneTransitions.ts` | Fades, guarded against double transitions |
| `shared/phaser/effects.ts` | `blink` — toggles `visible` on a timer |
| `shared/phaser/devStartScene.ts` | `?scene=` / `?area=` jumps, dev builds only |
| `shared/input/gamepads.ts` | Button and stick polling |
| `shared/audio/audioEngine.ts` | Chiptune synthesis: tones, noise, envelopes, mute, unlock |
| `shared/audio/notes.ts` | Note names (`A4`, `C#3`) → hertz |
| `shared/audio/music.ts` | Lookahead scheduler for gapless loops |

### The game itself (64 TypeScript files)

**Entry and configuration**

| File | Purpose |
|------|---------|
| `main.ts` | Creates the game, registers all 12 scenes |
| `config.ts` | Every tunable number: screen, colours, controls, arena, health, attack timings, combat, hazards, boss, story, raid, rescue |

**Scenes** (`scenes/`)

| File | Purpose |
|------|---------|
| `sceneKeys.ts` | Every scene name in one place |
| `BootScene.ts` | Builds all textures, unlocks audio, binds mute, handles `?scene=` |
| `TitleScene.ts` | Title art and menu |
| `ControlsScene.ts` | The controls table |
| `RaidScene.ts` | Cold open: the village burns, Mei is taken |
| `PrologueScene.ts` | Kenji arrives too late |
| `StoryScene.ts` | The chapter before each area |
| `AreaScene.ts` | **The game.** One fortress screen: fighter, opponent, hazards, HUD, pause, transitions |
| `RescueScene.ts` | The ending: the cage, the choice, both outcomes |
| `PauseScene.ts` | Overlay on a frozen game |
| `GameOverScene.ts` | Defeat, with continue and an optional explanation |
| `VictoryScene.ts` | The end of a won run |
| `SpriteGalleryScene.ts` | Dev tool: every animation and attack, replayed at real phase timing |
| `hud/HealthBar.ts` | Pip health bars |
| `hud/StoryTextBox.ts` | Framed panel, typewriter text, prompt |
| `hud/ControlsPanel.ts` | The controls table, shared by the title and pause |

**Entities** (`entities/`)

| File | Purpose |
|------|---------|
| `Fighter.ts` | The state machine: stances, attacks, blocks, hits, knockback; emits events |
| `Health.ts` | Pips, damage, slow regeneration |
| `fighterMoves.ts` | Move/hitbox types and phase timing |
| `Cage.ts` | Mei's cage: takes blows, rattles, breaks, leaves a wreck |
| `hazards/Hazard.ts` | The hazard contract and placement data |
| `hazards/Hawk.ts` | The diving hawk |
| `hazards/Gate.ts` | The slamming portcullis |
| `hazards/createHazard.ts` | Placement data → hazard instance |

**Systems** (`systems/`)

| File | Purpose |
|------|---------|
| `playerControls.ts` | Input → `FighterIntent` |
| `combat.ts` | Hit resolution, blocking rules, damage, separation |
| `guardAi.ts` | Guard decision-making |
| `bossAi.ts` | Gorran's two gears |
| `fighterSounds.ts` | Subscribes a fighter's events to sounds |
| `hitboxDebugView.ts` | **H** — hurtboxes, hitboxes, danger zones, current move phase |

**Content** (`content/`)

| File | Purpose |
|------|---------|
| `palette.ts` | Every colour in the game |
| `story.ts` | Eight chapters |
| `prologue.ts`, `rescue.ts`, `controls.ts` | Scene text |
| `village.ts` | The village, painted `intact` or `burnt`, shared by two scenes |
| `sounds.ts`, `music.ts` | Sound effects and the three loops |
| `areas/paint.ts` | Painting helpers: bands, brick walls, battlements, pillars, banners |
| `areas/areas.ts` | The eight fortress screens |
| `fighters/fighterBody.ts` | The shared body |
| `fighters/heroPoses.ts` | All 22 poses |
| `fighters/heroMoves.ts` | Six moves with hitboxes |
| `fighters/fighterConfig.ts` | Assembles a fighter from sheet + stats + moves |
| `fighters/heroFighter.ts`, `guardFighter.ts` | Kenji and the guards |
| `fighters/gorranBody.ts`, `gorranPoses.ts`, `gorranMoves.ts`, `gorranFighter.ts` | The boss |
| `fighters/meiBody.ts`, `meiPoses.ts` | Mei's own build and poses |
| `sprites/fighterSprites.ts` | Draws a pose set with a body into a sheet |
| `sprites/hero.ts`, `guard.ts`, `mei.ts`, `gorran.ts` | Palette definitions |
| `sprites/torch.ts`, `fire.ts`, `hawk.ts`, `hud.ts` | Scenery and HUD art |
| `sprites/index.ts` | The registry Boot walks |

---

## 8. Problems worth talking about

The interesting part. Each of these changed the code.

### Blurry text at high zoom

The canvas was scaled by a whole number of **CSS** pixels — but the machine ran Windows display scaling at 125%, so one CSS pixel is 1.25 physical pixels and a "5×" zoom drew each game pixel 6.25 screen pixels wide. Fixed by computing the zoom in *physical* pixels and converting back:

```ts
const screenPixelsPerGamePixel = Math.floor(min(screenWidth / width, screenHeight / height));
return screenPixelsPerGamePixel / window.devicePixelRatio;   // e.g. 6 / 1.25 = 4.8
```

Text was still soft, because browser font rasterisation antialiases regardless. Alpha-snapping and sub-pixel calibration both made it worse. The fix was to stop using a font: a hand-made 5×7 pixel font, drawn as data. **Some problems are solved by removing the dependency.**

### Phaser's RetroFont sizes by width

All text rendered at a fractional scale until it turned out `RetroFont` takes its size from cell **width**, not height. `CELL_WIDTH * scale` fixed it.

### Sub-frame key taps were lost

Polling `key.isDown` once per frame misses a tap shorter than 16 ms; `JustDown` also failed, because Phaser clears its flag on key-up. Fixed by listening to Key DOWN events and **buffering presses until the next update**, so no tap is lost regardless of frame timing.

### Phaser delivering one key event twice

A dev key fired twice per press. Page-side logging proved the DOM delivered exactly one event — Phaser handed the same event to the scene twice. Fixed with a per-listener `WeakSet<KeyboardEvent>`. **Instrument before theorising.**

### The boss who never attacked

Gorran stood still through an entire fight, throwing nothing. The cause was arithmetic, not logic: his `preferredDistance` was 24 and `kickReach` was also 24, so with a ±2 tolerance he settled at 25–26 — content with his spacing and permanently just outside his own range. Every guard worked because their spacing (21–22) sits *inside* reach. The constraint is now documented in `config.ts` beside the values.

### The unhittable hawk

"Strike it out of the air" was impossible: the dive touched its lowest point at exactly one x — the player's own position — so at punch range it was still ~10 px too high and always struck first. Fixed by giving the swoop a **level stretch** at striking height and a **flare** (slowing as it closes). A real raptor telegraphs its strike the same way; the fix was both fairer and more natural.

### A gate that hurt you for touching it

Standing against an already-closed portcullis cost a pip, because the hero's hurtbox overlaps the gate column when he leans on it. Now only the *falling* gate hurts; a closed one is just a wall.

### `blink` owns `visible`

A prompt refused to disappear. `blink` toggles `visible` on a timer, so `setVisible(false)` was undone milliseconds later. Anything that also shows/hides such a label must use **alpha** — which is exactly what `AreaScene` already did for its exit hint, a convention I hadn't noticed before re-inventing the bug.

### `as const` and `.includes()`

`KEYS.mute.includes(event.key)` failed to compile: `as const` makes it `readonly ["M"]`, whose `includes` only accepts `"M"`. A small reminder that `as const` narrows *method signatures*, not just values.

### The ending nobody understood

The most instructive failure, and it was a design bug, not a code bug. Play-testing produced: *"why is the person in the cage not Mei but another fighter, and there is no way to kill this fighter?"*

Three causes compounding:
1. Every character was the same humanoid rig recoloured, so Mei was Kenji in a pink kimono — she read as an enemy.
2. I had deliberately posed her fists-up as a "warning", which shouted *enemy* even louder.
3. She has no hurtbox, so attacks passed through her; then approaching with a raised guard killed you instantly with no explanation.

The result was an unkillable enemy followed by an unexplained death. Fixed by giving her **her own body** (long hair, slighter frame), a **captive pose**, a **name label**, a neutral standing pose when freed — and by moving the lesson to *after* the mistake: she flinches, then puts you down, and the game-over screen explains why and what to do instead, with **continue** returning you to the cage to act on it.

The general lesson: a rule the player cannot see is not a twist, it's a trap. Teach it, or explain it afterwards — but never both hide it and punish it.

---

## 9. How it was tested

There is no unit-test suite; this is a real-time visual game where almost every defect is a *rendering* or *timing* defect that assertions would not catch. Instead, a **headless Edge harness driven over the Chrome DevTools Protocol** runs scripted sessions:

```
wait:2500  key:Enter  down:ArrowRight  wait:1300  up:ArrowRight  shot:fight  eval:<js>
```

It dispatches real key events, takes screenshots, assembles annotated contact sheets (optionally cropped and magnified), and — importantly — **captures every page error and console error**. A fake gamepad is injected with `eval:` to test pad navigation without hardware.

Every step was verified by reading the resulting screenshots: pip counts to confirm damage values, hitbox overlays to confirm attacks existed, contact sheets to confirm animation beats. Several bugs above were found *only* because a screenshot disagreed with what the code claimed.

Its limits are worth stating plainly:

- **Audibility is unverified.** Headless has no audio device, and the engine deliberately returns early while its context is suspended, so it is likely nothing was ever synthesised during testing. What *is* proven: all note data parses (the tracks are built at module load, so a bad note name would stop the game booting), nothing throws along any sound path, and it type-checks and builds. Whether it *sounds* right needs human ears.
- **Capture timing can lie.** One run appeared to show broken keyboard navigation; the first screenshot was blank white, meaning the canvas hadn't painted and every later keypress fired early. A blank first tile invalidates a whole run.

---

## 10. Known gaps

Stated plainly rather than left to be discovered:

- **`shared/audio/sfx.ts` duplicates `shared/audio/audioEngine.ts`.** The former was written in step 0 for the console menu (`playTone`, `unlockAudioOnFirstInput`); the latter in step 18 for the games. Two audio contexts, two unlock paths, two tone players. This violates the project's own no-duplication rule and should be reconciled — the console menu's needs are a strict subset of the engine's.
- **Step 20 is outstanding**: a full play-through, `npm run security:audit`, flipping the catalogue entry to `playable`, and ticking the game in the root README.
- **Rookie guards can be stun-locked**, because the 350 ms hit-stun exceeds their attack cooldown at close range.
- **Pixel evenness on some external monitors** is imperfect; the zoom maths is right, so the next suspect is the canvas landing on a half physical pixel when centred.

---

## 11. What I would do differently

- **Reconcile the audio modules before writing the second one.** I wrote a general engine without checking what already existed in `shared/`, which is the exact mistake the no-duplication rule is meant to prevent.
- **Give characters distinct bodies from the start.** The palette-swap shortcut was the right call for guards and cost nothing — but applying it to Mei, a character with a completely different role, created the worst bug in the project. Silhouette communicates role before colour does.
- **Test the default path first.** The ending's bad outcome was reachable by simply continuing to hold *forward* after breaking the cage — the most natural thing a player can do. I tested that both endings *worked* long before asking which one an ordinary player would hit.
