# 🔧 Game 02: Pixel Plumber

A side-scrolling platformer inspired by **Super Mario Bros.** (1985). Run, jump and stomp through four worlds of pipes, bricks and secret blocks. All characters, story and art are original.

## Story

The town of **Brasswick** runs on its pipes: water, steam and heat all flow through them. Overnight the **Sludge Baron** crawled up from the old boiler works, clogged every main with living sludge and turned the town's pumps into his own. **Rusty**, the town's plumber, grabs a wrench and heads down the line, from the streets to the sewers, over the rooftops and into the boiler works, to flush him out.

## How it plays

- **Run and jump.** Rusty speeds up and slows down instead of starting and stopping dead. Holding the run button raises his top speed and makes long jumps possible. Holding jump longer jumps higher.
- **Stomp to win.** Landing on most enemies defeats them. Touching them from the side hurts.
- **Blocks.** Hit a `?` block from below for a coin or a power-up. Big Rusty breaks bricks; small Rusty only bumps them. Some bricks hide several coins or a secret.
- **Power-ups:**
  - **Gear**: small Rusty grows big and can take one extra hit.
  - **Steam Valve**: big Rusty can fire bouncing puffs of steam.
  - **Golden Gasket**: a few seconds of invincibility, and every enemy he touches is defeated.
  - **1-Up Wrench**: an extra life.
- **Enemies** (all original):
  - **Gloop**: a slime blob that walks back and forth. One stomp.
  - **Shellbug**: a beetle. A stomp knocks it into its shell, and kicking the shell sends it sliding into other enemies (and back into Rusty).
  - **Sprout**: a snapping plant that rises out of pipes, but not while Rusty stands right next to the pipe.
  - **Flutterbug**: a Shellbug with wings that hops or flies in a pattern.
  - **Spark**: a fireball that circles on a chain in the boiler works. It cannot be stomped.
- **Coins, score and lives.** 100 coins give an extra life. The HUD shows score, coins, world, time and lives.
- **Eight levels in four worlds:** streets (1-1, 1-2), sewers (2-1, 2-2), rooftops (3-1, 3-2) and the boiler works (4-1, and 4-2 with the boss).
- **Level end:** a **valve wheel** on a tall pipe ends each level. Grabbing it higher scores more, and leftover time turns into points.
- **Pipes you can enter** lead to hidden coin rooms and shortcuts.
- **A boss:** the Sludge Baron at the end of 4-2 hops often and high and throws sludge. He cannot be stomped: he is beaten by getting past him to the pressure-release lever behind him, or by wearing him down with a lot of steam puffs.
- **An ending:** the pipes run clear and the town lights up again.

## Controls

| Action | Keyboard | Gamepad |
|--------|----------|---------|
| Move | ← → | D-pad / left stick |
| Duck / enter pipe | ↓ | D-pad down |
| Jump (hold for higher) | Z / Space | A |
| Run / fire steam | X | X / B |
| Mute sound and music | M | — |
| Pause | Esc | Start |
| Back to console menu | Backspace or the `< MENU` button | — |

## Technical plan

- **Engine:** Phaser (already installed), with **Arcade physics** for gravity and collisions.
- **Resolution:** 320×180 pixels, like Dojo Quest, through `@shared/phaser/createPixelGame`.
- **Tiles:** 16×16 pixels. Levels are **text maps** in `src/content/levels/`, one character per tile (`#` ground, `B` brick, `?` question block, `[` `]` pipe top, `X` stair block, ...), turned into a Phaser tilemap when a level starts. No level editor files.
- **Art:** tiles, Rusty, enemies and items are text pixel maps with a palette, drawn with the shared `pixelMap` and `pixelSprites` helpers. No image files.
- **Tile sheet** (`src/content/sprites/tiles.ts`): every tile is a frame in one `tiles` texture, and a tile's index in the tilemap is simply its frame's position in that sheet, so new frames only ever go at the end. Regular patterns are built rather than typed out: cobbles and bricks repeat one row pattern and shift every other course by half a stone, and two-tile pieces (pipes, clouds, bushes) are drawn 32 pixels wide and cut in half, so no row can come out the wrong width. Brasswick's pipes are brass, not green.
  - **One sheet per world.** A world's tiles are the same drawings in different colours, so `tiles-sewer` shares every frame of `tiles` and only swaps its palette, exactly as Steam Rusty shares big Rusty's frames. Frame order, and so every tile index, is the same in all of them. `src/content/levels/worldThemes.ts` says which tile texture, brick-debris texture and background colour a world uses, `loadLevel` takes that theme and carries it on the loaded level, and block bumps and broken bricks read it from there, so a sewer brick bursts into sewer brick.
  - **World 2 underground:** wet grey stone for the cobbles, brick gone blue, algae instead of bushes and dim steam instead of clouds. Brass pipes, `?` blocks and used blocks keep their colours in every world so they always read as the same thing.
  - **World 4, the boiler works:** sooty iron plate underfoot, furnace brick, riveted iron blocks, smoke instead of clouds and heaps of coal instead of bushes, against a dark furnace glow. The one new tile, the iron **grate** (`_`), went on the end of the sheet as the rule says.
- **Level loading** (`src/systems/levelLoader.ts`, legend in `src/content/levels/tileLegend.ts`): the legend says which frame each character draws and whether it is solid, and the loader checks the map (row count, equal row widths, known characters, with the exact column and row in the error) before building a tilemap layer with collision on the solid tiles. Clouds and bushes are scenery. Every map is 12 rows (192 px) and the camera shows the bottom 180, so the top row sits half behind the HUD, as on the original console. Underground levels start their roof on the third row for that reason: the two rows above it stay dark behind the counters.
  - Phaser 4's `createLayer` may return a GPU layer as well as a normal one, so the loader checks it really got a `TilemapLayer`.
  - **Moving platforms are written as their tracks:** a row of `=` for a girder that rides sideways, a column of `:` for a lift. `src/systems/platformTracks.ts` joins the cells into one track each and refuses a track too short to move along.
  - `src/content/levels/levels.ts` says which map each level plays. Every level has its own map now; the test street in `testLevel.ts`, with `testRoom.ts` under it, is only what a level without one would fall back to.
- **Rusty's art** (`src/content/sprites/rustyParts.ts`, `rusty.ts`): a brown flat cap, a big rust-orange beard, a teal work shirt and khaki overalls with brass buckles. Frames are stacked from a head, a torso and legs and pinned to the bottom of the frame, so a face or a boot is drawn once and every pose stands on the same line. Small Rusty (16×16) and big Rusty (16×32) are two sheets, because every frame in a sheet must be the same size. Big Rusty has his own hand-drawn torsos and legs: stretching the small body to twice the height gave him stilts for legs.
  - Growing and shrinking flicker between sizes instead of scaling, like the original console. The big sheet also holds small Rusty and an in-between Rusty (the small body with its rows repeated) pinned to the bottom of a 32-row frame, so the whole flicker is one animation on one texture.
  - Walking and running are the same three frames at 10 and 18 frames per second.
- **Sprite gallery:** `?scene=SpriteGallery` plays every animation in the game on one screen, for checking art. It fills a page at a time; Enter or Space shows the next.
- **Feel:** acceleration, friction, jump height, variable jump cut-off, *coyote time* (a jump still works a moment after walking off a ledge) and *jump buffering* (a jump pressed just before landing still counts). All of these numbers live in `config.ts` (`RUSTY`).
  - **Movement** (`src/systems/playerMovement.ts`) only reads and writes a body's velocity and whether it stands on something, so it knows nothing about Phaser and can be run on its own. Gravity comes from the physics world. Pushing against the direction of travel on the ground brakes hard, and that is the skid. Letting go of run above walking speed eases down instead of stopping short. Rusty only turns round on the ground, as in the original.
  - **Measured** at 60 fps with the current numbers: walking tops out at 90 px/s, running reaches 150 px/s in under 0.4 s, a skid from a full run lasts 9 frames (9 px), letting go slides 7 px from a walk and 19 px from a run, a tapped jump rises 14 px, a held jump 73 px (4.6 tiles), and a running jump 82 px while covering almost 8 tiles. The browser measured the same heights as the stand-alone simulation.
  - **Play-test changes.** The slide was too long (32 px from a run), so both brakes were strengthened. And the jump was too low: a standing jump reached 58 px, short of a 4-tile (64 px) ledge, so the brick row and the high `?` block in the test street could only be reached with a running jump, and barely. Jump speed and gravity went up together (330 → 390, 900 → 1000), so Rusty jumps higher without floating for much longer (0.8 s in the air instead of 0.75 s). Level design rule that follows: a ledge up to 4 tiles high needs no run-up, 5 tiles needs one.
  - **Held keys are one press.** The OS repeats key-downs while a key is held, and the shared `ActionInput` used to count every repeat as a new press: holding jump kept refilling the jump buffer, so Rusty jumped again the moment he landed. It now ignores repeats, as a held gamepad button always was. It also reads the gamepads once per frame instead of once per button, because `navigator.getGamepads()` is not free in every browser.
  - **Rusty** (`src/entities/Rusty.ts`) is an Arcade physics sprite with its origin at his feet, so switching between small and big, or ducking, never moves where he stands. Each shape has its own body (`RUSTY_BODIES`), and big Rusty's body shrinks while he ducks. Small Rusty cannot duck, as in the original.
  - **Spawn:** `@` in a level map marks where Rusty starts. The loader insists on exactly one.
  - **Dev keys** in the level (keyboard only): **G** cycles Rusty through small, big and steam straight away, **K** hurts him, **J** drops the next enemy (Gloop, Shellbug, Flutterbug, in turn) three tiles in front of him, **H** shows solid tiles and physics bodies, **Enter** clears the level and **L** loses a life.
- **Camera:** follows Rusty forwards only, as in the original. The screen never scrolls back.
  - **Forward camera** (`src/systems/forwardCamera.ts`): once Rusty passes `LEVEL.cameraLeadX` (144 px, a little left of centre, so more of what is coming is visible), the camera keeps him there. It only ever scrolls right, in whole pixels, and stops at the end of the level.
  - **The left edge is a wall.** Every frame the physics world's left bound is moved to the camera's left edge, so the world-bounds collision that already stops Rusty at both ends of the level also stops him walking back off screen. The world is open above and below.
  - **Pits:** Rusty loses a life once the top of his sprite has dropped below the bottom of the level, so he is completely out of sight; the first version checked his body, and the top of his cap still showed at the bottom of the screen. His controls and body stop, the level stays up for `LEVEL.pitLifeLostDelayMs`, and then it goes to the world intro, or Game Over with no lives left.
  - **The camera moves after physics.** Phaser moves a body during its update, but only copies the body's position onto the sprite after the scene's `update()`. A camera placed in `update()` therefore follows where Rusty was one physics step ago. On a 60 Hz screen that lag is the same every frame and invisible, but on a faster screen some frames have a physics step and some do not, so Rusty shook back and forth against the scenery and looked blurry once the screen started scrolling (found in play-testing). The camera and the left wall are now updated on the scene's `POST_UPDATE` event, and the scroll is no longer rounded by hand: rendering with `roundPixels` rounds every object, and an exact distance between Rusty and the scroll is what keeps him still. With physics forced to 30 steps a second to imitate a fast screen, Rusty's screen position went from alternating 144.23 / 147.23 px to exactly 144 px in every frame.
  - **Tested** in the browser: running right kept Rusty at 144–144.5 px on screen; walking back left never lowered the scroll and left his body exactly at the screen edge; walking into the gap lost a life and the intro showed one fewer.
- **Blocks and coins** (`src/systems/blockHits.ts`, effects in `src/entities/effects/`, numbers in `BLOCKS`):
  - **Level map characters:** `?` gives one coin and becomes a used block. `B` is a brick: big Rusty breaks it into four falling pieces, small Rusty only bumps it. `C` looks like a brick but pays a coin on every hit, for 4 seconds after the first hit or up to 10 coins, then becomes a used block. `H` is a hidden coin block. `o` is a loose coin.
  - **Head hits:** the collider callback records every tile that stopped Rusty moving up during physics, and after physics only the one nearest his middle is hit, as in the original, so jumping under the seam between two blocks hits one of them.
  - **Hidden blocks** are not in the tilemap, so physics lets Rusty's head straight into them. Each frame the block system checks whether the top of his head crossed a hidden block's bottom edge since the previous frame; if it did, the block appears as a used block, Rusty is pushed back down under it and his rise stops. Only from below: walking or falling into the cell does nothing.
  - **Placed tiles need their faces worked out again.** Arcade only collides with the sides of a tile that face open space, so a row of blocks is one smooth surface. A tile placed with `putTileAt` came with a face on every side, so walking along a row of blocks stopped Rusty dead at the edge of a used block (found while testing step 8). Used blocks now recalculate the faces of their cell and its neighbours. Removing a broken brick already did.
  - **Bumps:** tiles in a tilemap cannot move, so a bumped tile is hidden while an image of it pops up 4 px and back, and the tile stays solid throughout.
  - **Coins** carry from level to level in `RunState` and are kept when a life is lost.
  - **Tested** in the browser by steering Rusty from a per-frame position log: the hidden block paid one coin and was solid on the next jump; three loose coins added three; a `?` block paid once and nothing on the second hit; a brick hit by small Rusty paid nothing and stayed; the coin brick paid on each of three hits; and big Rusty broke a brick and then jumped up through the gap it left.
- **Power-ups** (`src/systems/powerState.ts`, `src/entities/Items.ts`, `src/entities/SteamPuffs.ts`, numbers in `POWER`, `ITEMS` and `STEAM`, art in `src/content/sprites/powerUps.ts`):
  - **Level map characters:** `P` looks like a `?` block but holds a power-up. `*` looks like a brick but holds a Golden Gasket. `W` is a hidden block holding a 1-Up Wrench. The test street has a second `*` early on, so the Gasket can be tried without crossing the whole level.
  - **Power states:** small, big and steam. The rules are plain functions with no Phaser in them. A power-up block decides what it holds when it is hit: a Gear for small Rusty, a Steam Valve for big or steam Rusty. Each power-up raises the state by at most one step. A hit takes it down one step (steam → big → small), and a hit while small loses a life. Power carries into the next level in `RunState` and goes back to small when a life is lost.
  - **Changing state** freezes physics while Rusty flickers, as on the original console: growing and shrinking use the grow and shrink animations, and big ↔ steam flickers between the two colour sheets. Steam Rusty is big Rusty's frames with a white shirt and red overalls: the sheet shares the frames and only the palette changes.
  - **After a hit** Rusty blinks and cannot be hurt for 2 seconds. With the **Golden Gasket** he flashes gold and orange for 9 seconds, more slowly for the last 2, and cannot be hurt either; every enemy he touches is thrown over. The **1-Up Wrench** adds a life and floats a green `1UP` above him.
  - **Defeat:** when small Rusty is hit, everything freezes for a moment, then he hops up and falls through the ground out of the level, and the life is lost after 2.5 seconds.
  - **Items** rise out of their block behind the tiles, then get a body. The Gear and Wrench slide and turn round at walls, the Gasket bounces along, and the Valve stays where it came out. A body that hits a wall is stopped dead, so turning round uses each item's own speed. Items also turn at the level's side walls: without that, the Gasket bounced off the end of the test street and fell out of the world (found in testing).
  - **Steam puffs:** X fires a puff while steam Rusty is not ducking, at most two at once. Puffs fly straight, bounce each time they land, burst against walls, and vanish when they leave the screen.
  - **Sprite gallery** now also shows steam Rusty, the four items and the puff.
  - **Tested** in the browser with a per-frame log:
    - A `P` block gave small Rusty a Gear. He chased it down and grew, with physics frozen during the flicker.
    - The second `P` block gave big Rusty a Steam Valve. Walking into it on top of the block row turned him to steam.
    - Three quick presses of X put out only two puffs, which disappeared off screen. A puff fired at a pipe burst.
    - Clearing the level kept steam.
    - Hits went steam → big and big → small. A hit during the blinking was ignored. A hit while small hopped him out of the level and cost a life.
    - The hidden `W` block's Wrench took lives from 3 to 4, with a `1UP`.
    - The Gasket bounced off the end of the level and was collected. It made a hit do nothing, and it ran out after 9 seconds.
- **Enemies** (`src/systems/enemyRules.ts`, `src/entities/enemies/`, numbers in `ENEMIES` and `ENEMY_BODIES`, art in `src/content/sprites/enemies.ts`):
  - **Level map characters:** `g` Gloop, `b` Shellbug, `f` Flutterbug, `v` Sprout, `^` Spark. A Sprout's marker goes in the empty cell above the left half of a pipe top, and the plant rises out of the middle of that pipe. A Spark's chain is anchored in the middle of its cell.
  - **What a touch does** is one plain function with no Phaser in it, from the enemy, its state, whether Rusty came down on it and whether the Golden Gasket is shining: hurt him, flatten it, throw it over, pull a Shellbug into its shell, take a Flutterbug's wings off, kick a resting shell or stop a sliding one.
  - **Gloop** walks back and forth; one stomp leaves a puddle. **Shellbug** is the same beetle as the **Flutterbug**, which is why they are one class: stomping a Flutterbug takes its wings off and it carries on as a Shellbug, and stomping the Shellbug knocks it into its shell. A resting shell is kicked by touching it, slides until a wall turns it round, and is stopped dead by a stomp. Left alone for 7 seconds the beetle comes back out. **Sprout** rises out of its pipe and sinks back on a cycle, but never while Rusty is within 30 pixels of the pipe, so the pipe he is standing on is safe; it cannot be stomped. **Spark** swings round its anchor on a chain of brass links and cannot be beaten at all; only the Gasket keeps Rusty safe from it.
  - **Stomping:** Rusty has to be on his way down with his feet within 10 pixels of the enemy's top, otherwise he is walking into it and takes the hit. A stomp or a kick throws him back up.
  - **Kicking** sends a shell away from Rusty, except when he is standing right over it, where a pixel either way would decide it: then it goes the way he is facing, as on the original console.
  - **Shell chains** are checked by hand each frame rather than with a physics overlap, because only a sliding shell can catch anything, and a group cannot cleanly be overlapped with itself. A sliding shell bowls over everything it catches except a Spark.
  - **Asleep until the screen reaches them.** An enemy's body is switched off until the right-hand edge of the screen comes within 24 pixels of it, so a Gloop does not walk off a ledge long before Rusty sees it. It is removed for good once it falls out of the level or is left behind the screen, which never scrolls back.
  - **Sprouts and Sparks do not collide with tiles.** The one collider between the enemies and the level skips them with a process callback: a Sprout moves through the pipe it lives in, and a Spark swings through the air.
  - **Beaten enemies** flip over, are thrown upwards and fall out of the level, touching nothing on the way. A stomped Gloop is flattened instead, and lies there for a moment. Everything freezes while Rusty is losing a life.
  - **Steam puffs** burst against enemies and beat them, so `SteamPuffs` gained a way to say what its puffs hit.
  - **Tested** in the browser with a per-frame log, using **J** to put enemies exactly where they were wanted:
    - A stomped Gloop was flattened and Rusty bounced off it at the right speed. Walking into one took big Rusty down to small, and cost small Rusty a life.
    - A stomped Shellbug pulled into its shell, and the beetle came back out about 7 seconds later.
    - Touching the shell kicked it, and it slid the way Rusty was facing and bowled over a Gloop further on. Jumping on a sliding shell stopped it dead (found by hand, not by the test script: the shell outruns Rusty, so it has to come back off a wall).
    - Stomping a Flutterbug took its wings off and left a Shellbug walking.
    - A steam puff threw a Gloop over.
    - The Sprout rose and sank while Rusty kept his distance, stayed down while he stood by the pipe, and caught him when he landed on it.
    - The Spark swung a full circle round its anchor and caught him in mid-air.
    - With the Golden Gasket shining, a Gloop that walked into him was thrown over and he was not hurt.
    - Enemies stayed still until the screen reached them, turned round at pipes, and were cleared away once they were left behind.
- **HUD, score and lives** (`src/scenes/hud/LevelHud.ts`, `src/systems/score.ts`, `src/systems/levelTimer.ts`, numbers in `SCORING` and `LEVEL`):
  - **The counters** run across the top of the screen: score, coins, world, time and lives. The level map is one row taller than the screen so its top row sits half behind them, as on the original console. Each counter stays centred on its column, and only what has changed is redrawn.
  - **What things are worth:** a coin 200, a broken brick 50, a Gear, Steam Valve or Golden Gasket 1000, a kicked shell 400, and the 1-Up Wrench a life. Every hundredth coin is an extra life, and the coin counter rolls back to zero.
  - **A run of enemies** beaten without a pause is worth more each time: 100, 200, 400, 800, 1000, 2000, 4000, 5000, 8000, and after that an extra life. A run carries on while enemies keep falling within a second and a half of each other, which covers both a jump from one to the next and a shell sliding through a row of them. Kicking a shell is worth the same every time, and carries no run: with the ladder behind it, a shell kicked against a wall over and over would hand out lives.
  - **Landing on a pile** stomps all of it. Bouncing off the first enemy stops Rusty falling, so without care the rest of the pile would hurt him instead; anything he came down on in the same frame counts as stomped (found in testing).
  - **The points float up** where they were earned, and a green `1UP` for an extra life.
  - **The clock** counts 400 units down in its own time, a little under half a second each, and knows nothing about Phaser. It stops while Rusty is growing or losing a life. Under 100 it turns red, which is all the warning there is until the music speeds up in step 18. Running out beats him where he stands, with `TIME UP` across the screen.
  - **Score and coins carry** from level to level in `RunState` and are kept when a life is lost. Game Over and the Ending show the final score.
  - **The dev keys** moved to the bottom of the screen, out of the HUD's way.
  - **Tested** in the browser with a per-frame log: three loose coins gave 600 and moved the counter; a `?` block 200; a brick broken by big Rusty 50; a Golden Gasket 1000; landing on a pile of three enemies gave 100, 200 and 400 in one go and the points floated up over them; a kicked shell gave 400 every time; with the clock and the coins-per-life count turned down for the test, the third coin gave a life and rolled the counter over, and running out of time showed `TIME UP` and cost a life; the score carried into the next level; and losing every life led to Game Over showing it.
- **Level end** (`src/entities/LevelEnd.ts`, numbers in `LEVEL_END` and `SCORING`):
  - **Level map characters:** `E` is the top of the pole that ends the level, and `|` is the pole below it. Neither is solid: Rusty runs into the pole rather than being stopped by it. Every level must have exactly one `E`, and the loader says so if it does not, the same way it insists on one spawn.
  - **Catching the wheel:** the valve wheel sits at the top of the pole and turns on the spot. Touching the pole anywhere ends the level, and pays by how high up his feet were: 100 at the foot of it, then 400, 800, 2000 and 5000 in bands up to the very top. The points float up where he caught it.
  - **What follows** is a small sequence rather than a scene of its own: he holds the wheel and winds it down to the foot of the pole, lets go, walks on for a moment, and then every unit left on the clock is counted into the score at 50 points each, a unit at a time. Then the next level starts, or the ending after the last one.
  - **The clock stops** the moment he has the wheel, and the enemies stop with it.
  - **The wheel is drawn before Rusty**, so he is in front of it and looks like he is holding on.
  - **Tested** in the browser, with the pole moved next to the spawn for the test and then put back at the end of the street: walking into the foot of the pole paid 100, a running jump at it paid 2000, he wound down, walked off, the clock counted into the score at 50 a unit, and the next level started with the score carried and a fresh clock.
- **Pipes and coin rooms** (`src/content/levels/testRoom.ts`, numbers in `PIPES`):
  - **Level map characters:** `D` is the left half of a pipe top that can be gone down — it looks like any other pipe. `R` marks the empty cell above the pipe Rusty comes back up. A map may have one of each.
  - **A room is an ordinary level map** with no pole to finish on, so the scene simply loads it instead of the street and restarts itself. Everything that must survive the trip — lives, coins, score, power and what is left on the clock — travels as scene data, so the clock keeps running while he is down there. The rooms are lit differently: black behind them instead of sky.
  - **Going down:** standing on the pipe and holding ↓ sinks him into it. He is drawn behind the tiles while he sinks, so the pipe swallows him, and he rises out of the return pipe the same way at the other end.
  - **Coming back:** the room's own `D` pipe leads up to the marked cell in the street, which is further along than the one he went down, so the room is a shortcut as well as a pocketful of coins.
  - **The level end is now optional** in a loaded map, because rooms have none; a street without one is still refused, by the level scene rather than the loader.
  - **Tested** in the browser with the pipe moved next to the spawn for the test and then put back in the middle of the street: standing on it and holding ↓ took him down, the room came up black with its coins, 19 coins there were worth 3800, and the pipe in its corner brought him back up standing on the pipe at the far side of the street, with the coins, score and lives intact and the clock still running down from where it had got to.
- **World 1: the streets** (`src/content/levels/world1.ts`, chosen by `levels.ts`):
  - **Which map a level plays** is a small lookup from the level's number. Worlds that are not built yet still play the test street, so the game runs end to end while the rest is made.
  - **1-1 teaches the game in the order it is met:** an empty street to walk down, a Gloop to stomp, a block to hit, a row of blocks with the first power-up, a two-tile pit, a pipe to clear, the pipe down to the coin room, a brick that keeps paying coins, a wider pit with a 1-Up hidden a few tiles before it, the pipe the room comes back out of, and stairs up to the pole. 132 tiles from end to end.
  - **1-2 asks for what 1-1 taught:** a Sprout in a tall pipe, a Golden Gasket inside a brick, a shelf to run along for the coins on top, three enemies in a row for a single kicked shell, the widest gap in the world, and a climb past a second Sprout to the pole.
  - **Each has a coin room** under it: 1-1's is a plain pocketful, 1-2's is bigger and hides a 1-Up Wrench.
  - **The maps were assembled out of twelve-row segments** by a script and then checked: every row the same width, one spawn, one pole, a pole that reaches the ground, a return marker over a real pipe, nothing standing on thin air, and no pit wider than four tiles. Two things the check caught: bricks and a hidden block hanging over pits, where a bump in mid-air would have dropped Rusty in, and a Flutterbug placed over a gap.
  - **Tested** by playing both levels to the pole in the browser: a script held run and right, leapt at each pit and jumped on whatever walked at it. 1-1 finished with 361 units left for 18,750 points, and 1-2 with 360 left for 19,600, and each led straight into the next level. 1-1's second pit was four tiles wide and even a full run cleared it only barely, so it is three now; 1-2 keeps its four-tile gap.
- **World 2: the sewers** (`src/content/levels/world2.ts`):
  - **A roof instead of a sky.** The vault starts on the third row, so the two rows above it stay dark behind the counters, and it is broken up by stretches that hang a row lower and by piers that drop out of it. The floor is broken by drains, which are pits like any other.
  - **2-1 is the way down:** a Gloop and a block row on open ground, a shelf to launch the first drain from, a Sprout in a pipe, the pipe down to the coin room, a wider drain crossed from a pipe top, and a last drain with a 1-Up hidden over it before the shaft up to the pole. 140 tiles from end to end.
  - **2-2 is the deep main:** its piers come all the way down to head height, so long stretches have to be run under rather than jumped over; three enemies stand in a line for one kicked shell, the pipe down sits on the lip of a double drain with a three-tile island between its halves, and a second Sprout guards the last stretch before the stairs out. 148 tiles.
  - **Each has a coin room** under it: 2-1's hides a 1-Up Wrench beside the coins, 2-2's is two plain banks of them.
  - **The maps were laid out by a script** from a sparse list of pieces, so no row can come out the wrong width, and then checked: one spawn, one pole with ground under it, a return marker over a real pipe, whole pipes with nothing floating, no enemy standing over a pit, no coin inside a tile, and two clear tiles of head room over every walkable column, so nothing a pier hangs over is too low for big Rusty. Running the same check over world 1 reported the same two things it reports for world 2 (both rooms drop Rusty in from above his floor), which is how the rooms are meant to work.
- **Moving platforms** (`src/entities/MovingPlatforms.ts`): a three-tile steel girder rides its track at a steady 48 px/s and waits 0.8 s at each end, so Rusty can walk on and off rather than having to time a jump. They are one-way: he jumps up through one from below and lands on top.
  - **Not physics bodies.** Each girder is an image moved by hand, and Rusty is carried by hand: when his feet were on or above a girder last frame and are on it or just through its top now, he is moved the way it moved and put back on top. Standing on one counts as ground for jumping, coyote time and poses, and his gravity is off while he stands there, so his feet stay exactly on the girder instead of a fraction of a pixel into it.
  - **Carried before the physics step**, on the scene's `PRE_UPDATE`. Arcade hands each step's movement from the body on to the sprite, so a carry made after the step was counted twice (Rusty rode at twice the girder's speed) or, on a frame with no physics step, lost.
  - Enemies and items do not ride platforms.
  - **In the air he keeps his own speed, not the girder's.** A short hop lands back on a sideways girder; a full-height jump straight up drifts about 38 px against it, so riders steer.
- **World 3: the rooftops** (`src/content/levels/world3.ts`): buildings are filled from their roofs down, the gaps between them are the pits, and the platform tracks sit level with the roofs they join. Dusk sky, slate roofs, chimney brick and stone, pink evening cloud and rooftop planters, as a third palette of the same tiles.
  - **3-1 introduces the rooftops:** a three-tile gap, a chimney to hop, a four-tile gap, a girder across a gap too wide to jump, the chimney pipe down to the attic, a lift up the side of a tall building, and a five-tile gap that needs a run before the stairs. 150 tiles.
  - **3-2 strings the platforms together:** a long girder past a Sprout, a lift from a low roof to the tallest building in town, a girder dropping to a lower roof, and two lifts out of step with each other to hop between before the last climb. 164 tiles.
  - **The playtests moved things:** a chimney three tiles before a gap and a pipe four tiles before a girder's edge each launched a full-speed jump straight into the pit, a Shellbug walked onto the first girder's landing just as it docked, and 3-2's return pipe stood right in front of a lift with one tile to wait on. Each was moved away from its edge, and 3-2's first roof grew four tiles.
  - **Tested** by playing both levels to the pole in the browser, with the enemies cleared so only the layout was on trial: a script held run and right, jumped at gaps and walls, waited at each edge for a girder or lift to line up before stepping on, stepped off a lift when the roof beside it was level, and hopped between 3-2's two lifts. It found one more trap: on 3-1's tall building a chimney stood three tiles before a four-tile gap with a drop after it, so a full-speed jump over the chimney came down in the gap about 25 px short. The chimney moved back five tiles, and a running jump over it now lands on the roof. 3-1 then finished in 24 s and led into 3-2, which finished in 36 s. Every girder and lift carried Rusty through its whole track with his feet exactly on its top and no drift, and both chimney pipes led down to their attics and back up onto the pipe under the return marker. Worlds 1, 2 and the test street still load in their own colours.
- **World 4: the boiler works** (`src/content/levels/world4.ts`): an iron roof as in the sewers, and Sparks swinging from iron posts and from the roof over the pits.
  - **4-1 is the way in:** a Spark on a post to time a jump past, a girder across a nine-tile pit, the pipe down to the coal store, two Sparks on posts of different heights, a Spark over a pit, and the stairs up to the last pole in the game. 146 tiles.
  - **4-2 leads to the Baron:** two Sparks on posts, one over a pit and one over a raised floor, three enemies in a row, a power-up block and the pipe down to the boiler room just before the hall, and one more Spark on the way back from it. 114 tiles.
  - **Laid out by a script** from a list of pieces (floor, pits, pipes, Spark posts, stairs), as world 2 was.
- **The Sludge Baron** (`src/entities/SludgeBaron.ts`, `src/entities/PressureLever.ts`, rules in `src/systems/baronPattern.ts`, numbers in `BOSS`, art in `src/content/sprites/boss.ts`):
  - **Level map characters:** `Z` is the Baron, standing on the bottom of his cell; `L` is the pressure-release lever; `_` is a grate. A map with one of them must have all three, and a map with the lever has no pole. The loader checks both.
  - **What he does:** he sleeps until his middle is on screen, then paces a short stretch of his grates, always faces Rusty, hops often and high, and lobs blobs of sludge at him. When he throws and when he hops each follow a fixed list of uneven pauses taken in turn, so the fight can be learnt but not simply counted out. The rules are plain code with no Phaser in it.
  - **Aiming:** a blob is thrown upwards at a fixed speed, and across at whatever speed lands it where Rusty's feet were when it left the Baron's hand, allowing for the drop from his hand to them. It is aimed where Rusty was, not where he will be, so a moving Rusty is missed and a standing one is hit.
  - **He can beat Rusty:** touching him or a blob hurts like any enemy, taking a power state or a life. Stomping does not work, and the Golden Gasket only keeps Rusty safe from him.
  - **Steam wears him down:** each steam puff that reaches him flashes him red, and the eighth beats him for 5000: he flips over, is thrown up and falls out of the hall. The lever still ends the level afterwards.
  - **Beating him:** Rusty has to get past him, over him or under a hop, to the lever. Touching it stops the clock, pays 5000, drops the grates out from under the Baron with a shake of the screen, and he falls away into his own sludge. Then the clock is counted into the score as at a pole, and the game goes on to the Ending.
  - **Play-testing moved things:** he first woke the moment any of him came on screen and threw from the edge of it, then (made to wait until all of him was in view) not until Rusty was already on the grates; he now wakes when his middle is on screen, as Rusty steps off the landing. His blobs first fell 40 to 55 pixels short of the hall door, so standing there was perfectly safe; they now reach across the visible hall. His sludge was also brightened, because on the dark furnace background it could hardly be seen.
  - **Changed after play-testing by the owner,** who found jumping over him the only answer and too easy: he now hops more than twice as often (every 0.7 to 1.5 seconds, not 1.7 to 3.3) and higher (330 px/s, not 280), so a jump over him has to be timed and usually costs a hit, and steam can now beat him.
- **Sparks after a restart.** Coming back up the pipe in 4-2, Rusty was caught by a Spark that should have been out of reach. The level scene restarts on the way back from a room, and after that every Spark's sprite jumped 37 pixels each way, every frame, while its body stayed put. The Spark used to move its sprite and then sync the body to it, which left the body's last position behind; on frames with a different number of physics steps Arcade added the difference to the sprite. It now puts the sprite and body there together with `body.reset`.
- **Tested** in the browser:
  - **The Baron can beat Rusty:** standing still at the hall door, big Rusty was hit by a blob and went small, and the next blob cost the life, with everything frozen and the world intro after it. Walking into him took big Rusty to small. With the Gasket he walked into him unhurt. Three steam puffs left him standing.
  - **The Baron can be beaten:** a running jump over him reached the lever five times out of five with different waits before the run-up (in three of them he took a hit on the way past); each time the grates dropped, he fell out of the level, 5000 and the clock were added and the Ending came up. With the faster, higher hops the same five runs all still reached the lever, and he caught Rusty on the way past in four of them.
  - **Steam beats him:** steam Rusty firing from the hall door beat him after 13 to 16 presses (some puffs pass under or over him while he hops); he fell out of the hall for 5000, and the lever then ended the level for 5000 more and led to the Ending.
  - **Every Spark can be passed:** for each of the ten, big Rusty ran and jumped past with the flame started at twelve points of its turn. Between 3 and 9 of the 12 got past; the tightest is the tall post near the start of 4-2. Waiting for the flame gets past every one.
  - **The layouts:** with the enemies cleared, the same script that played world 3 played 4-1 to the pole (and into 4-2) and walked 4-2 up to the Baron; both pipes lead to their rooms and back up onto the return pipe; all eight levels load in their own colours.
- **Sound and music** (`src/content/sounds.ts`, `src/content/music.ts`, numbers in `MUSIC`): all written as data and played by the shared audio engine, like Dojo Quest's. No audio files.
  - **Sounds:** jump (lower for big Rusty), stomp, kick, coin, bump, brick break, a power-up appearing and being collected, a hit that takes a size away, 1-Up, steam puff, pipe, the valve wheel, the clock ticking into the score, the hurry warning, story typing and confirm; for the Baron a throw, a steam hit, being beaten, and the lever with the grates crashing; and jingles for losing a life, clearing a level and game over, during which the music stops.
  - **All original.** The first versions of the coin, 1-Up, lost-life, level-clear and game-over tunes came out as the original console's notes, so they were rewritten as new tunes (the coin is a three-note chime, the level clear a run up in D over a moving bass, and so on).
  - **Music:** a loop for each world (bright streets in C, sparse sewers in A minor, a swinging rooftop line in F, a tense boiler-works line over a pumping bass in E minor), a short, fast loop for the Baron's hall that starts when he wakes, and a title and an ending theme. The world intro cards are quiet.
  - **Hurry:** once the clock falls under 100, a warning plays once and the music carries on half as fast again. The faster track is the same loop with a shorter step, made once per track, because the music player keeps a track that is already playing and restarts for a new one.
  - **Where they come from:** the level scene plays most of them. Movement now reports the frame a jump starts, the block system reports a bump that gives nothing, and steam puffs report whether a puff actually left (at most two are out at once). The Baron plays his own.
  - **Mute** is **M** on every screen, bound on the window in the Boot scene, which also wakes the audio on the first key press as browsers require.
  - **Tested** in the browser by recording every note Web Audio was asked to play and checking for each sound's first note: 28 checks, all passing. They cover the title, world, boss and ending music, the warning and the tempo change under 100 (the shortest lead step went from 125 to 83 ms), the jumps and the steam puff from real key presses, the rest by calling the scene code that plays them (coin, stomp, kick, 1-Up, bump, brick, power down, pipe, wheel, level clear and the clock ticks, a lost life with the music stopping, and the Baron's throw, hit and lever), mute (master gain 0, then back to 0.5), and the game-over jingle. The power-up sounds, confirm and typing were not checked this way.
- **Reused from `shared/`:** `actionInput` (keyboard and gamepad), `menu`, `sceneTransitions`, `devStartScene`, `effects`, `typewriter`, the audio engine and music scheduler, and the pause menu, controls panel and controls screen. Anything this game needs that Dojo Quest built privately moves to `shared/` instead of being copied.
- **Menus** (step 19). Every menu is the shared `Menu`, so the arrows or W/S, Enter or Space, and Esc work on the keyboard, and the D-pad or stick, A and B on a gamepad.
  - **Moved into `shared/phaser/` from Dojo Quest:** `controlsPanel.ts` (the table, now given its rows, notes and colours), `pauseScene.ts` and `controlsScene.ts` (each game extends them with its scene keys, colours, sounds and table). Dojo Quest's own pause and controls scenes are now those thin subclasses, and its private panel is gone; its title, controls screen, pause menu, the controls table inside it, resume and quit were checked in the browser afterwards and behave as before.
  - **Title:** the logo over a street with a brass pipe at each side and big Rusty between them, and a menu of NEW GAME and CONTROLS, with CONTINUE WORLD n above them once a world past the first has been reached.
  - **Continue** (`src/systems/continuePoint.ts`): the world intro remembers each world it opens, in the browser's local storage, so Continue on the title survives a reload. It starts the first level of that world, with its story, three lives and no score. Winning forgets it. Storage can fail (a private window, blocked site data), so every read and write is allowed to fail quietly, and the game then just offers no Continue.
  - **Pause:** Esc or Start in a level freezes it and lays the pause menu over it: RESUME, CONTROLS and QUIT TO TITLE; Esc or B also resumes. The clock, physics and tweens stop with the scene, and the music stops while the menu is open and starts its loop again on resume.
  - **Game Over** is now a scene of its own (the old shared end screen had only Game Over left in it): the score, and a menu of CONTINUE FROM WORLD n, which goes back to the start of the world the run ended in with fresh lives and no score, or BACK TO TITLE.
  - **Controls screen:** the shared screen on the game's black, since without a background of its own it showed the sky blue behind the levels and the grey text could barely be read (found in the screenshots). "Hold jump to jump higher" moved from the table into the notes under it, where it no longer crowds the keys column.
  - **Tested** in the browser twice, once with the keyboard and once with a fake standard gamepad the test pressed buttons on (D-pad, A, B and Start): 18 checks each time, all passing. The title with and without a saved world, the controls screen and back, a new game opening 1-1 with its story; pausing a level (the clock stopped), the controls from the pause menu and back, resuming (the clock ran again) and quitting to the title; Continue from the title after a reload starting 3-1 with three lives and no score; Game Over's continue and its way back to the title; and no Continue after the ending.
- **Text:** `addPixelText` only.
- **Scene flow:** Title → World Intro → Level, then back to World Intro for the next level or after a lost life, and on to Game Over or the Ending. What carries between levels (level number, lives, coins, score and power state) is a small `RunState` (`src/systems/runState.ts`) handed from scene to scene as scene data, so no scene keeps global state. The level order is in `src/content/levels/levelOrder.ts`. Game Over and the Ending are scenes of their own, and the pause menu is laid over a frozen level.
- **Story** (`src/content/story.ts`): each world's name and its part of the story, and the ending's lines, in one place. Upper case and short lines, for the pixel font.
  - **World intro cards** (`src/scenes/WorldIntroScene.ts`): the card before every level shows the level, the world's name, and Rusty as he is now (small, big or steam) beside his lives. Before the first level of each world it first types out that world's part of the story; Enter finishes the typing, then moves on to the card. The story comes only when the run has just arrived, from the title or by clearing a level, so it is not told again after a lost life. The scene is told this with a `story` flag in its data, which it takes off before the run goes on to the level.
  - **The ending** (`src/scenes/EndingScene.ts`, art in `src/content/sprites/skyline.ts`, numbers in `ENDING`): Rusty, in whatever form he finished in, walks home along a cobbled street under Brasswick in silhouette, every window dark. Then the street lamps come on, the sky lifts from night to evening blue, and the windows light one by one in a fixed shuffled order; about one in six stays dark, so the lit town does not look like a grid. With the town lit, the end of the story is typed out over the sky, then `THANK YOU, RUSTY!`, the score and `PRESS ENTER` back to the title. Enter at any point skips to the finished picture.
  - **The skyline** is built from a list of buildings (width, height, and a flat, peaked, chimneyed or stacked roof, the tallest being the old pumping station), with a grid of windows fitted into each wall. The windows are drawn dark into the silhouette and listed, so the scene can draw them lit on top.
  - **Rusty's looks** by power state are now exported from `Rusty.ts` (`RUSTY_LOOKS`), so the intro card and the ending show him the same way the level does.
  - **Tested** in the browser by a script that played a whole game from the title with key presses only (clearing each level with the dev key, as every level had already been played through): title, then the story and card for 1-1, 1-2, the story for 2-1, a life lost on purpose in 2-1 and the card again with one fewer life and no story, and so on through 4-2 to the Ending and back to the title, with no errors, in 49 seconds. Skipping the ending with Enter showed the finished town, and Enter again went to the title. Clearing 4-2 brought the score and steam Rusty into the ending, and losing the last life still led to Game Over.
- **Screen input** (`src/systems/screenInput.ts`): every screen reads the keyboard and a gamepad through the shared `ActionInput`, and reads once as it opens, so a button still held from the previous screen does not skip the next one.
- **Dev shortcut:** in `npm run dev`, `?scene=Level&level=2-1` jumps straight to a level (the level is read with the shared `devParam`), and `?scene=WorldIntro&level=3-1` opens on world 3's story.
- **Final check** (step 20): `npm run typecheck`, `npm run build` and `npm run security:audit` (0 vulnerabilities) pass, and the game is `playable` in the console menu.
  - **Every layout played again** by a script in the browser, with the enemies cleared. The world 3 script read the game from outside the page, and a slow test browser made it see an edge up to 50 pixels late, so it now runs inside the page: it decides on every game frame, just before the game reads its input, and presses a fake gamepad. It also learnt to walk off a step down instead of jumping from its edge, and to jump when the floor below runs out within two tiles. All seven levels before the boss reached the pole and led on to the next card, and 4-2 was walked up to the Baron.
  - **Two traps it found, both fixed:** 1-1's hidden 1-Up sat right over the last floor tile before the three-tile pit, so a jump from the edge hit it, lost its height and fell in; it moved three tiles back. In 2-2 a running jump from the pipe on the lip of the double drain, cut short by the low roof, came down about 6 pixels past the two-tile island; the island is three tiles now, and the far half of the drain two.
  - **Also run again:** the Baron beaten by the lever and by steam, and beating a Rusty who stands still; the whole game from the title through every level to the Ending and back (49 seconds); and all 18 menu checks with the keyboard and with a gamepad. No errors anywhere.

```
games/02-pixel-plumber/
├─ README.md
├─ index.html
└─ src/
   ├─ main.ts          Creates the Phaser game
   ├─ config.ts        Tunable numbers and control bindings
   ├─ scenes/          Boot, Title, WorldIntro, Level, Pause, GameOver, Ending, hud/
   ├─ entities/        Player, enemies, blocks, items, projectiles, valve wheel, boss
   ├─ systems/         Player movement, stomping, power-up state, scoring, camera
   └─ content/         Level maps, tiles, palette, sprites, sounds, music, controls
```

## Build steps

Each step is ticked only when it is built **and** tested.

### Phase 1: Foundation

- [x] **1. Game page.** Add `index.html`, `main.ts` and `config.ts` using the shared game shell, and set the cartridge to `in-development` in the console menu.
  *Done when:* the game opens from the console menu, shows an empty scene, and the menu button goes back.
- [x] **2. Scene flow.** Placeholder Boot → Title → World Intro → Level → Game Over / Ending scenes with transitions.
  *Done when:* you can step through every scene with key presses.
- [x] **3. Tiles and level loading.** Tile art for the streets world, and a text-map loader that builds a scrolling tilemap with collision.
  *Done when:* a test level renders crisp and the camera can scroll across it.

### Phase 2: Rusty

- [x] **4. Rusty's sprite and animations.** Small and big Rusty: idle, walk, run, skid, jump, duck, grow/shrink and defeat.
  *Done when:* every animation plays in a sprite gallery scene.
- [x] **5. Movement and jumping.** Acceleration, running, skidding, variable jump height, coyote time and jump buffering, with keyboard and gamepad.
  *Done when:* Rusty runs and jumps across the test level with both inputs, and it feels good.
- [x] **6. Camera and level bounds.** Forward-only camera, level edges, and losing a life by falling into a pit.
  *Done when:* the camera never scrolls back, and falling into a pit costs a life.

### Phase 3: The world

- [x] **7. Blocks and coins.** `?` blocks, bricks (bump or break), multi-coin bricks, hidden blocks and loose coins, with the block bump animation.
  *Done when:* every block type behaves correctly for small and big Rusty.
- [x] **8. Power-ups.** Gear, Steam Valve (with steam puffs), Golden Gasket and 1-Up Wrench, plus the power state (small → big → steam, and back down on a hit).
  *Done when:* every power-up can be collected, and a hit takes Rusty down one state with brief invincibility.
- [x] **9. Enemies.** Gloop, Shellbug (with kickable shell), Sprout, Flutterbug and Spark. Stomping, side hits and shell chains.
  *Done when:* each enemy can hurt Rusty and can be defeated the way it should be.
- [x] **10. HUD, score and lives.** Score, coins, world, timer and lives. Floating score numbers, an extra life at 100 coins, and running out of time.
  *Done when:* all counters update correctly, and losing every life leads to Game Over.

### Phase 4: The levels

- [x] **11. Level end.** The valve wheel, height-based bonus, time-to-points countdown and the walk-off to the next level.
  *Done when:* finishing a level scores correctly and loads the next one.
- [x] **12. Pipes.** Entering pipes into hidden coin rooms and coming back out further along the level.
  *Done when:* a pipe leads to a bonus room and returns Rusty to the right place.
- [x] **13. World 1: streets.** Levels 1-1 and 1-2.
  *Done when:* both levels can be completed and teach the basics in order.
- [x] **14. World 2: sewers.** Levels 2-1 and 2-2, with underground tiles and palette.
  *Done when:* both levels can be completed.
- [x] **15. World 3: rooftops.** Levels 3-1 and 3-2, with moving platforms and wider gaps.
  *Done when:* both levels can be completed, and moving platforms carry Rusty correctly.
- [x] **16. World 4 and the boss.** Levels 4-1 and 4-2 in the boiler works, Sparks, and the Sludge Baron fight.
  *Done when:* the boss can be beaten and can beat Rusty.
- [x] **17. Story and ending.** World intro cards and the ending scene where the town lights back up.
  *Done when:* a full game runs from the title to the ending.

### Phase 5: Polish and release

- [x] **18. Sound and music.** Jump, stomp, coin, bump, break, power-up, pipe and defeat sounds, plus a loop for each world and a faster tempo when time runs low.
  *Done when:* every action has sound, and music loops without gaps.
- [x] **19. Title, pause and game over.** Menus, controls screen and continue from the current world.
  *Done when:* all menus work with keyboard and gamepad.
- [x] **20. Final check.** Full play-through, `npm run build`, `npm run security:audit`, set the game to `playable` in the console menu, and tick game 02 in the root README.
  *Done when:* all of the above pass.
