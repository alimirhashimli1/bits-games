# 🏁 Game 04: Turbo Road

A pseudo-3D road racer inspired by **OutRun** (1986). Drive a red roadster down winding coast roads, overtake traffic and rival drivers, and reach each checkpoint before the clock runs out. At the end of every stage the road forks, and the side you take decides where the race goes and where it ends. All characters, places, cars and music are original.

## Story

Once a year the island of **Solmara** closes its roads for the **Sunward Run**, a race from the harbour at **Port Calla** to whichever far shore a driver dares to reach. There is no fixed route: at every fork the drivers choose their own road. You drive the **Comet GT**, a cherry-red roadster rebuilt from scrap in a beach garage. Three rival drivers are out to prove that it belongs back there: **Juno Reyes** in a teal coupé, **Brock Hale** in a black one with a red wing, and **Sable Quinn**, the fastest of them, in purple.

## How it plays

- **Drive.** Hold accelerate to build speed and brake to slow down. The car has two gears: **LOW** pulls hard from a standstill but runs out of speed early, **HIGH** is slow to get going but much faster at the top. Changing gear at the right moment is part of driving well.
- **Steer through curves.** Curves push the car towards the outside, and more so the faster it goes. Off the tarmac the grass and sand slow the car down.
- **Hills.** The road climbs and dips, and the crest of a hill hides whatever is behind it.
- **Traffic.** Slow cars and trucks share the road and sometimes change lanes. Touching one bumps the Comet sideways and costs speed.
- **Crashes.** Hitting a palm, a rock or a sign at speed flips the car. It is put back on the road at a standstill, and the clock keeps running.
- **Rivals.** Three rival drivers race each stage at close to top speed. Each one overtaken is worth a bonus, and the HUD counts how many are behind you.
- **Checkpoints.** The race starts with 60 seconds on the clock. Every checkpoint adds more time (**EXTENDED PLAY**). If the clock reaches zero, the car rolls to a stop and the race is over.
- **Forks and routes.** Every stage ends at a fork. Keep left or keep right to pick the next stage. Three legs make a pyramid of six stages and three different finish lines, each with its own ending:

```
                 Leg 1:          Sunset Coast
                              /                \
  Leg 2:           Palm Canyon                  Harbour Lights
                  /           \                /              \
  Leg 3:  Redrock Desert       Pinewood Pass              Neon Boulevard
              |                     |                           |
  Goal:   Star Observatory     Summit Lodge                 Skyline Pier
```

- **Score.** Points for distance driven at speed, for rivals overtaken, and a bonus at the goal for every second left on the clock. The best five scores are kept in this browser, with the driver's three initials.
- **Radio.** Before the start, pick one of three original songs on the car radio.

## Controls

| Action | Keyboard | Gamepad |
|--------|----------|---------|
| Steer | ← → or A D | D-pad / left stick |
| Accelerate | ↑ or W or X | A |
| Brake | ↓ or S or Z | B or X |
| Change gear (LOW / HIGH) | Space or C | Y or right shoulder |
| Pause | Esc | Start |
| Mute sound and music | M | — |
| Back to console menu | Backspace or the `< MENU` button | — |

## Technical plan

- **No engine.** Unlike the other four games, Turbo Road does not use Phaser. A pseudo-3D road is a few hundred horizontal lines drawn every frame, which is simpler and faster to do directly with the Canvas 2D API than through sprites.
- **Pixel screen** (`src/systems/screen/`): the game draws at **320×180** on an off-screen canvas, then the visible canvas is scaled up by the same pixel-perfect zoom the Phaser games use (moved into `shared/` so both share it). Sprites are scaled with smoothing off, so they stay blocky rather than blurry.
- **Game loop:** a fixed 60 steps per second, independent of the monitor's refresh rate. Each step updates the current scene, then the scene draws itself.
- **Scenes** (`src/scenes/`): plain classes with `update` and `draw`, switched by a small scene manager with fade-to-black transitions. Flow: Boot → Title (or its High Scores and Controls screens) → Radio → Race (with Pause laid over it) → Route Map between stages → Goal / Game Over → High Score entry, when the score makes the table → High Scores → Title.
- **Text:** the shared pixel font (`shared/pixel-font/`) drawn straight onto the canvas by a shared Canvas text helper, so it matches the other games exactly.
- **Input:** keyboard and gamepad read into named actions (`steer`, `accelerate`, `brake`, `gear`, ...) with "held" and "just pressed" states, using the shared gamepad helpers.
- **The road** (`src/systems/road/`): the track is a list of short **segments**, each with a curve amount and a height. Every frame the segments ahead of the camera are projected to the screen, near to far. Curves are drawn by adding each segment's curve to a running sideways offset, and hills by projecting each segment at its own height. The road is drawn row by row with whole-pixel rectangles (grass, rumble strips, tarmac, lane lines), so every edge is sharp. A segment is skipped when a nearer hill already covers its rows.
- **Sprites:** scenery, traffic and the Comet are pixel maps (`src/content/sprites/`) drawn once to off-screen canvases, then scaled by distance. Sprites are drawn far to near and clipped at the crest of any hill in front of them.
- **Tracks** (`src/content/stages/`): each stage is built from short, readable instructions (`straight`, `curve`, `hill`, `scenery`, `checkpoint`, ...) by a track builder.
- **Sound:** engine, tyres, crashes and the radio songs all use the shared Web Audio engine (`shared/audio/`). The engine note follows the car's RPM.

## Build steps

Each step is ticked only when it is built **and** tested.

### Phase 1: Foundation

- [x] **1. Game page.** Add `index.html`, `main.ts` and `config.ts` using the shared game shell, a 320×180 pixel screen with pixel-perfect zoom and a fixed-step game loop, and set the cartridge to `in-development` in the console menu.
  *Done when:* the game opens from the console menu, shows a crisp test screen at any window size, and the menu button goes back.
- [x] **2. Canvas toolkit and scene flow.** Pixel text on Canvas (shared), keyboard and gamepad actions, a scene manager with fades, and placeholder Boot → Title → Radio → Race → Goal / Game Over scenes.
  *Done when:* you can step through every scene with the keyboard and with a gamepad.

### Phase 2: The road

- [x] **3. Road renderer.** Segments, projection and row-by-row drawing of grass, rumble strips, tarmac and lane lines, with a straight test track.
  *Done when:* a crisp, striped road scrolls smoothly towards the horizon.
- [x] **4. Curves, hills and sky.** Curve and height data, the track builder, and parallax sky and horizon layers that slide with the curves.
  *Done when:* a test track with curves and hills draws correctly, and hill crests hide the road behind them.
- [x] **5. The Comet GT.** Car sprite (straight, turning left and right), acceleration, braking, two gears, steering, the outward pull of curves and slowing down off-road.
  *Done when:* the car drives the test track with keyboard and gamepad, and it feels good.

### Phase 3: The world

- [x] **6. Roadside scenery.** Scaled scenery sprites (palms, rocks, signs, buildings) drawn far to near and hidden behind hill crests.
  *Done when:* scenery sits at the right size and distance and never shows through a hill.
- [x] **7. Crashes.** Hitting scenery at speed flips the car, then puts it back on the road at a standstill. A slow touch only bumps it.
  *Done when:* every crash plays out and the car can drive off again.
- [x] **8. Traffic.** Cars and trucks at their own speeds in their own lanes, with the odd lane change. Touching one bumps the Comet and costs speed.
  *Done when:* traffic can be overtaken, and every collision behaves as described.
- [x] **9. Rivals.** Three named rival drivers who race at close to top speed and weave between lanes, with a bonus for each one overtaken.
  *Done when:* rivals can be caught and overtaken, and the counter and bonus are right.

### Phase 4: The race

- [x] **10. HUD, timer and checkpoints.** Speed, gear, time, score, stage name and a progress bar. Checkpoints add time with an **EXTENDED PLAY** banner, and running out of time ends the race.
  *Done when:* all counters update correctly, and a time-out leads to Game Over.
- [x] **11. Stage themes.** A palette, sky and scenery set for each of the six stages, including night on Harbour Lights and Neon Boulevard.
  *Done when:* every theme can be driven and reads clearly.
- [x] **12. Stages and forks.** All six stages, the fork at the end of each one, and a route map between stages showing the road taken.
  *Done when:* every route through the pyramid can be driven from the start to a goal.
- [x] **13. Goals and endings.** The three finish lines, the time bonus and an ending scene for each goal.
  *Done when:* each goal leads to its own ending with the right bonus.

### Phase 5: Polish and release

- [x] **14. Sound and music.** Engine note that follows RPM, gear change, tyre squeal, bump, crash, checkpoint and countdown sounds, plus three radio songs.
  *Done when:* every action has sound, and the chosen song loops without gaps.
- [x] **15. Title, radio, pause and high scores.** Title menu, controls screen, radio select, pause menu, and the top-five table with initials entry, remembered in this browser.
  *Done when:* all menus work with keyboard and gamepad, and scores survive a page reload.
- [x] **16. Final check.** Full play-through of every route, `npm run build`, `npm run security:audit`, set the game to `playable` in the console menu, and tick game 04 in the root README.
  *Done when:* all of the above pass.
