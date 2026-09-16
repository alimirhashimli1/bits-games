# 🥋 Game 01: Dojo Quest

A side-scrolling martial arts adventure inspired by **Karateka** (1984). Walk into a mountain fortress, beat the guards in slow, tactical one-on-one duels, and reach the warlord at the top. All characters, story and art are original.

## Story

Kenji comes home from his training journey to find his village dojo in ashes. **Warlord Gorran** has taken his sister **Mei** to a fortress on the cliffs. Kenji climbs the mountain alone, gate by gate and guard by guard.

## How it plays

- **Two stances.** *Running stance* is fast, but you can't attack or block. *Fighting stance* is slow, but lets you strike and defend. Running into a guard is a very bad idea.
- **Three heights.** Punches and kicks go high, mid or low. Blocks cover high or low.
- **One duel at a time.** Every fighter has a health bar made of pips. A clean hit removes one pip. You slowly regain health while walking between fights.
- **Eight areas:** mountain path, cliff stairs, outer gate, courtyard, barracks, inner hall, watchtower and throne room. Guards get tougher the higher Kenji climbs.
- **Two opening scenes:** the raid, where Gorran's men burn the village and carry Mei off, then Kenji arriving too late. Every area after that starts with its own story chapter.
- **A boss:** Warlord Gorran, in black and gold armour with a horned helmet and cape, fights differently from his guards.
- **A rescue ending:** Mei is held in a cage in the throne room, and Kenji has to break her out.
- **Classic touches:** a hawk that dives at your head, a portcullis that drops on whoever is standing under it, and an ending where *how* you approach Mei matters.

## Controls (planned)

| Action | Keyboard | Gamepad |
|--------|----------|---------|
| Walk / run | ← → | D-pad |
| Switch stance | Shift | Y |
| Punch: high / mid / low | ↑+Z / Z / ↓+Z | ↑+X / X / ↓+X |
| Kick: high / mid / low | ↑+X / X / ↓+X | ↑+A / A / ↓+A |
| Block: high / low | C / ↓+C | B / ↓+B |
| Mute sound and music | M | — |
| Pause | Esc | Start |
| Back to console menu | Backspace or the `< MENU` button | — |

## Technical plan

- **Engine:** Phaser, installed in step 1.
- **Resolution:** 320×180 pixels, scaled up with pixel-perfect scaling.
- **Art:** sprites are written as text pixel maps with a colour palette and turned into textures when the game starts, so there are no image files.
- **Tuning:** every speed, damage and timing value lives in `src/config.ts`.
- **Text:** drawn with the shared 5×7 pixel font (`addPixelText`), so it stays sharp at every zoom.
- **Sound** (`shared/audio/`, `src/content/sounds.ts`, `src/content/music.ts`): there are no audio files. Effects are written as data — layered oscillator tones with envelopes and pitch slides, plus bursts of filtered noise — and synthesised with the Web Audio API as they play, the same idea as drawing the art from pixel maps. The music is three sixteen-step loops in A minor, played by a **lookahead scheduler** that hands notes to the audio clock before they are due, so the loop point is just another step and never clicks. Playing the track that is already playing does nothing, which is how the title theme carries through the raid and the opening without a seam. Browsers keep a page silent until it is used, so the first key press wakes the audio, and **M** mutes everything.
  - Fighters make no sound of their own. They announce `attack`, `stance-change` and `footstep`, and the scene decides what to play, so the same Fighter suits the rescue scene, which wants different sounds. Everything that lands already passes through the area scene's `showOutcome`, so hits, blocks and knockouts needed no new plumbing at all.
- **Dev shortcut:** in `npm run dev`, add `?scene=Area` (or `Title`, `Controls`, `Raid`, `Prologue`, `Story`, `Rescue`, `GameOver`, `Victory`) to the URL to jump straight to a scene. `?scene=Area&area=3` starts in the fourth area (areas count from 0).
- **Sprite gallery:** `?scene=SpriteGallery` loops every fighter animation on one screen, for checking art.
- **Fighter art:** poses are joint positions (`src/content/fighters/`) that the shared humanoid rig draws as pixel maps. Guards reuse the same poses with a different palette.
- **Attacks:** each move has wind-up, active and recovery phases (timing in `config.ts`, hitboxes in `src/content/fighters/heroMoves.ts`). Only the active phase can hit.
- **Hitbox debug view:** press **H** during play to show or hide body outlines, attack hitboxes and the current move phase. It is hidden by default.
- **Health:** counted in pips (`src/entities/Health.ts`). Kenji regains one pip every 1.5 s outside fights.
- **Combat rules** (`src/systems/combat.ts`, numbers in `config.ts`): a hit lands when an active hitbox touches the opponent's hurtbox, once per attack. A high guard stops high and mid attacks, a low guard stops low attacks, and only while facing the attacker. Punches cost 1 pip, kicks 2, plus knockback and a short stun. A fighter caught in running stance goes down in one blow.
- **Guard AI** (`src/systems/guardAi.ts`): each frame a guard defends against an incoming attack (decided once per attack, after its reaction time), may back off after being hit, attacks when ready and in reach, and otherwise keeps its preferred distance. Ranks `rookie`, `veteran` and `elite` in `config.ts` set health, speed, reaction time, block chance, aggression, cooldowns and retreat chance. A guard whose reaction is slower than a punch's 100 ms wind-up can only block kicks.
- **Areas** (`src/content/areas/`): the fortress is eight screens, each with a painted background, torches, an opponent (rookie, rookie, veteran, veteran, veteran, elite, elite, and then Warlord Gorran in the throne room) and optional hazards. Once the opponent is down a blinking `>>` appears; walking off the right edge fades to the next area and Kenji's health carries over. He only regenerates while an area is clear. After the throne room comes Victory (the rescue ending arrives in step 17). Being knocked out leads to Game Over.
- **Hazards** (`src/entities/hazards/`): scenery that can hurt Kenji. Each area lists the hazards it has, and the area scene builds them the same way it builds a guard from its rank. They only stir once the guard is down, so duels stay one-on-one and the danger falls on the walk to the exit. Every number is in `config.ts`, and **H** shows their danger zones alongside the fighters' hitboxes.
  - The **hawk** (cliff stairs, watchtower) circles out of sight, then dives at wherever Kenji stood when it launched. It flares before striking — slowing down and levelling out at head height — and that flare is the window to answer it: duck under a low guard and it passes overhead, or meet it with a mid punch or a high kick and it climbs away until the next dive. Only if he does neither does it cost him a pip.
  - The **gate** (outer gate) is the portcullis, drawn by the hazard rather than the background so it can move. It rattles a warning, slams in a sixth of a second, sits shut, then grinds back up. Being under it when it falls costs 2 pips; walking into it once it is down costs nothing, but it will not let him past. The way through is to cross while it is up, which at walking pace is not quite possible.
- **The boss** (`src/content/fighters/gorran*.ts`, `src/systems/bossAi.ts`): Warlord Gorran ends the climb in the throne room, in place of an eighth guard. He is not a palette swap. The shared humanoid rig gained an optional **cape**, and he brings his own body — a horned helmet instead of a headband, thicker limbs, black and gold armour — so `createFighterSheet` now takes a body and any extra poses a fighter needs. His moves are his own as well (`gorranMoves.ts`): slower to start and reaching further, with the high punch replaced by an **overhead smash** worth 3 pips, whose long wind-up is the tell that it is coming. A move can now carry its own damage, so one blow can hurt more than its kind normally does. His brain (`BossBrain`) fights in two gears and changes to the enraged set at half health: shorter cooldowns, far more aggression and almost no retreating.
  - A fighter's `preferredDistance` has to stay inside `GUARD_AI.kickReach`. Set to the reach itself, he stands contentedly just outside his own range and never throws a blow.
  - The fight rewards the guard Kenji chooses. Holding a high guard and punishing between swings wins it with health to spare; mixing in a low guard, which only stops low attacks, lets most of Gorran's swings through and the hit-stun interrupts every counter.
- **The rescue** (`src/scenes/RescueScene.ts`, `src/entities/Cage.ts`): the ending is played, not watched. Gorran lies where he fell, Mei is behind bars beside the throne, and it runs in three beats. Standing iron is solid, so Kenji is held clear of the cage and has to **strike it down**: every blow rings through the bars and the third brings them down, leaving the wreck on the floor. Mei steps out and simply stands there. Then the last few steps decide it, and the game says nothing beforehand. Walk up to her **in running stance, with his hands down**, and she knows him: they leave together and the victory screen follows. Walk up **still in fighting stance** and her hands go up first — she is frightened of him, not fighting him — and then she puts him down. The game over screen is where it explains itself: *Mei did not know you with your fists up. Go to her with your guard down.* Continuing from there returns to the cage, so the lesson can be used straight away. Nothing is given away by a warning, and nothing is left a mystery either.
  - Mei has her own body (`src/content/fighters/meiBody.ts`) — long hair, a slighter frame — and her own poses: hands on the bars while she is caged, arms up in front of her face when someone comes at her. Everyone else is the shared fighter rig recoloured, and without this she was Kenji in a pink kimono: the woman in the cage read as an enemy who could not be killed, which is precisely how the scene was first played.
  - A blinking label owns its own `visible` flag, because `blink` toggles it. Anything that also needs to show or hide such a label does it with alpha, the way the area scene's `>>` hint does.
- **Menus** (`shared/phaser/menu.ts`): one menu widget serves every screen that asks a question, and it reads its input through `ActionInput`, so the keyboard, the D-pad and the stick all work without any of it being written twice. Labels are padded to a common width and share one left edge, so the cursor stays put instead of jumping about between long and short words.
  - **Pause** lays a scene over the frozen game (`scene.pause()`, then `scene.launch()`) rather than replacing it, so the fight is still visible behind it and none of it has to be saved and rebuilt. **Esc** pauses in the fortress and the rescue, and still skips in the story scenes, exactly as the controls table says.
  - A menu ignores its own first frame. Menus are opened by a key press, and that key is usually still down when the menu appears, so without this the menu would act on the press that opened it and shut again at once.
  - **Game over** offers *continue*, which starts the area Kenji fell in again at full health instead of sending him back down the mountain. The rescue hands over its own scene, so dying there returns him to the cage rather than to the fortress.
  - The **controls table** (`src/content/controls.ts`) is drawn by a panel rather than a scene, because the title screen and the pause menu both show the same thing.
- **Raid scene** (`src/scenes/RaidScene.ts`): the cold open, staged in beats whose timings are all in `config.ts`. The village is still whole and Mei waits outside the dojo; Gorran's men run in and crowd around her, one lunges and seizes her while she recoils and struggles, fires catch one by one, and finally she is hauled off towards the cliffs facing backwards, still resisting. The village painting (`src/content/village.ts`) has two states, `intact` and `burnt`, so both opening scenes share one drawing.
- **Opening scene** (`src/content/prologue.ts`, `src/scenes/PrologueScene.ts`): the burning village, with the collapsed dojo, animated fires, drifting smoke and rising embers. It has its own lower ground line, so the picture is taller than a fighting screen. Title → opening scene → Chapter 1.
- **Story scenes** (`src/content/story.ts`): each area opens with its chapter. The picture is that area's own background, dimmed, with its torches and waiting guard, and Kenji running in. The text types out letter by letter (`shared/phaser/typewriter.ts`); **Enter** shows all of it and continues, **Esc** skips the chapter.
- **Dev cheat:** in `npm run dev` only, **K** knocks out the current guard, to test walking through the fortress quickly.

```
games/01-dojo-quest/
├─ README.md
├─ index.html
└─ src/
   ├─ main.ts          Creates the Phaser game
   ├─ config.ts        Tunable numbers and control bindings
   ├─ scenes/          Boot, Title, Controls, Raid, Prologue, Story, Area, Rescue, Pause, GameOver, Victory (+ SpriteGallery dev tool), hud/
   ├─ entities/        Fighter, Health, fighter moves, hazards, the cage
   ├─ systems/         Player controls, combat, guard AI, boss AI, fighter sounds, hitbox debug view
   └─ content/         Story text, palette, areas, fighter poses and moves, sprites, sounds, music, controls
```

## Build steps

Each step is ticked only when it is built **and** tested.

### Phase 1: Foundation

- [x] **1. Game page and Phaser setup.** Install Phaser, add `index.html`, `main.ts` and `config.ts`, set up a pixel-perfect 320×180 canvas and a "back to menu" key.
  *Done when:* the game opens from the console menu and shows an empty scene.
- [x] **2. Scene flow.** Placeholder Boot → Title → Story → Fight → Game Over / Victory scenes with transitions.
  *Done when:* you can step through every scene with key presses.
- [x] **3. Pixel sprite system.** Shared helpers (`shared/pixel-art/pixelMap.ts`, `shared/phaser/pixelSprites.ts`) that turn text pixel maps plus a palette into Phaser textures and animations. Test sprite: the animated wall torch on the title screen.
  *Done when:* a test sprite renders crisp and unblurred.

### Phase 2: The hero

- [x] **4. Hero sprite and animations.** Idle, walk, run, stance change, 3 punches, 3 kicks, 2 blocks, hit and fall.
  *Done when:* every animation plays correctly in a test scene.
- [x] **5. Movement and stances.** Running and fighting stances, walking, facing direction, keyboard and gamepad input.
  *Done when:* the hero moves and switches stance with both keyboard and gamepad.
- [x] **6. Attacks and blocks.** Attack phases (wind-up, active, recovery) with hitboxes; blocks with high and low guard.
  *Done when:* the debug view shows hitboxes appearing only in the active frames.

### Phase 3: Combat

- [x] **7. Health and HUD.** Pip health bars for the hero and the current enemy, plus slow regeneration outside fights.
  *Done when:* health bars update and regenerate correctly.
- [x] **8. Combat system.** Hit detection, blocks that must match the attack height, damage, knockback, stun and KO.
  *Done when:* hits, blocks and KOs work against a dummy target.
- [x] **9. Guard enemy and AI.** Approach, keep distance, attack, block and retreat. Difficulty values come from config, so later guards are tougher.
  *Done when:* a full duel against a guard can be won and lost.

### Phase 4: The fortress

- [x] **10. Areas and screen transitions.** Background art for the 5 areas, flip-screen transitions and guard placement per area.
  *Done when:* you can walk from the mountain path to the throne room.
- [x] **11. Story scenes.** Typewriter text and simple animated pictures between areas.
  *Done when:* each area transition shows its story scene, and the scenes can be skipped.
- [x] **12. Opening scene.** The burning village: the collapsed dojo in flames, burning houses, drifting smoke, and Kenji arriving and turning towards the mountain. Runs before Chapter 1 and can be skipped.
  *Done when:* starting a new game plays the opening scene, the fire animates, and Esc skips into Chapter 1.
- [x] **13. Raid scene.** The cold open before the opening scene: the village still whole, Gorran's men running in with torches, fires catching one by one, and Mei dragged off towards the cliffs.
  *Done when:* a new game plays the raid, then the burning village, then Chapter 1, and both scenes can be skipped.
- [x] **14. Three more areas.** Cliff stairs, barracks and watchtower, each with background art, a story chapter and a guard, giving eight areas with a smoother difficulty curve.
  *Done when:* all eight areas can be walked through in order, each with its own chapter.
- [x] **15. Hazards.** The diving hawk and the slamming gate.
  *Done when:* both hazards can hurt the hero and both can be avoided.
- [x] **16. Boss fight.** Warlord Gorran: his own outfit (black and gold armour, horned helmet, cape), his own moves and attack patterns.
  *Done when:* the boss looks clearly different from the guards and the fight is beatable but noticeably harder.
- [x] **17. Rescue ending.** After Gorran falls: Mei held in a cage, Kenji breaking it open, and the escape. Approaching her in fighting stance still ends badly.
  *Done when:* both endings can be reached — the rescue leads to the victory screen, and the mistake to game over.

### Phase 5: Polish and release

- [x] **18. Sound and music.** Chiptune hits, blocks, footsteps and short music loops.
  *Done when:* every action has sound, and music loops without gaps.
- [x] **19. Title, pause and game over.** Menus, controls screen and a continue option.
  *Done when:* all menus work with keyboard and gamepad.
- [ ] **20. Final check.** Full play-through, `npm run build`, `npm run security:audit`, set the game to `playable` in the console menu, tick game 01 in the root README.
  *Done when:* all of the above pass.
