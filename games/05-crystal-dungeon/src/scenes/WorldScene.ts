import * as Phaser from 'phaser';

import { ActionInput } from '@shared/phaser/actionInput';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import {
  COLORS,
  COMBAT,
  DEBUG_SOLID_ALPHA,
  DEPTHS,
  DEV_GEMS,
  DEV_SPAWN_DISTANCE_TILES,
  LANTERN,
  PLAYER_CONTROLS,
  ROOM,
  SCREEN_CHANGE,
  TALK,
  WORLD_DEV_CONTROLS,
  type PlayerAction,
} from '../config';
import { PEOPLE, SHOPKEEPER, type Person } from '../content/people';
import { AREAS, START_SPOT } from '../content/world/areas';
import { OPENED_SECRET_FRAME } from '../content/world/tileLegend';
import { puffAt } from '../entities/Puff';
import { Wren } from '../entities/Wren';
import type { DialogueRequest } from '../systems/dialogue';
import {
  closedDoorAt,
  closedDoors,
  hasEnemiesLeft,
  OPEN_DOORWAY_FRAME,
  roomOverlays,
  type ClosedDoor,
  type TileOverlay,
} from '../systems/dungeonDoors';
import { FACING_VECTORS, FACINGS, OPPOSITE_FACING, type Facing } from '../systems/facing';
import { ENEMY_KINDS, type EnemyKind } from '../systems/enemyKinds';
import { Fight } from '../systems/fight';
import { addGems, addKeys, cycleItemInHand, giveItem, hasDungeonItem, newGameState, type GameState } from '../systems/gameState';
import { HUD_KEY, miniMapOf, type HudData } from '../systems/hudData';
import { ItemUse } from '../systems/itemUse';
import { ITEM_KINDS } from '../systems/items';
import { heldDirection, type Vector } from '../systems/playerMovement';
import { drawTile, loadRoom, type LoadedRoom } from '../systems/roomLoader';
import { fadeThroughBlack, scrollToNextScreen } from '../systems/screenScroll';
import { buy, isOnSale, wareQuestion, type WareKind } from '../systems/shop';
import { Talkers, type TalkTarget } from '../systems/talkers';
import {
  cellUnder,
  doorsOf,
  edgePushedAgainst,
  neighbourOf,
  roomAt,
  roomId,
  type Cell,
  type Door,
  type RoomDefinition,
  type ScreenPosition,
  type WorldSpot,
} from '../systems/worldMap';
import type { InventorySceneData } from './InventoryScene';
import type { PauseSceneData } from './PauseScene';
import { SCENES } from './sceneKeys';

const ROOM_WIDTH = ROOM.columns * ROOM.tileSize;
const ROOM_HEIGHT = ROOM.rows * ROOM.tileSize;
/** The order J drops enemies in: the harmless-looking dummy first, then every real kind. */
const DEV_SPAWN_ORDER: readonly EnemyKind[] = ['dummy', ...ENEMY_KINDS.filter((kind) => kind !== 'dummy')];

/** Tells talkers apart, so walking from one straight into another starts a new talk. */
function talkKey(target: TalkTarget): string {
  switch (target.kind) {
    case 'person':
      return `person:${target.who}`;
    case 'sign':
      return `sign:${target.text}`;
    case 'ware':
      return `ware:${target.ware}`;
  }
}

/** A screen on show, and what it takes to take it down again. */
interface ShownScreen {
  readonly position: ScreenPosition;
  readonly room: RoomDefinition;
  readonly loaded: LoadedRoom;
  /** Wren against the walls, and the enemies against the walls. */
  readonly colliders: readonly Phaser.Physics.Arcade.Collider[];
}

/**
 * Wherever Wren is walking: the overworld and the dungeons, one screen at a time. Walking off
 * an edge slides to the next screen; a doorway fades into the cave or house behind it.
 *
 * The main camera only covers the room, below the HUD strip, so every room is laid out from
 * (0, 0) in its own coordinates.
 */
export class WorldScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private controls!: ActionInput<PlayerAction>;
  private devControls!: ActionInput<keyof typeof WORLD_DEV_CONTROLS>;
  private wren!: Wren;
  private state!: GameState;
  private fight!: Fight;
  private talkers!: Talkers;
  private itemUse!: ItemUse;
  /** Over a dark room until the Lantern lights it. */
  private darkness: Phaser.GameObjects.Rectangle | null = null;
  /** The screen on show. Every visit starts it afresh in create(), as Phaser reuses the scene object. */
  private shown!: ShownScreen;
  /** Where Wren comes back out when she leaves the cave or house she is in. */
  private returnSpot: WorldSpot | null = null;
  /** True while the screen slides or fades: Wren cannot be steered. */
  private changingScreen = false;
  private collisionDebug: Phaser.GameObjects.Graphics | null = null;
  /** Which kind J drops next. */
  private devSpawnIndex = 0;
  /** Walking into someone again does nothing until then, so a key still held after a talk does not restart it. */
  private talkReadyAt = 0;
  /**
   * Who or what she was walking into last frame, if anything. A talk starts when she walks into
   * someone new, or presses the direction afresh while against the same one.
   */
  private lastTalkTarget: string | undefined;

  constructor() {
    super({
      key: SCENES.world,
      // Top-down, so nothing falls. Body outlines are drawn in development, hidden until H is pressed.
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: import.meta.env.DEV } },
    });
  }

  create(): void {
    this.cameras.main.setViewport(0, ROOM.hudHeight, ROOM_WIDTH, ROOM_HEIGHT);
    fadeIn(this);
    this.physics.world.setBounds(0, 0, ROOM_WIDTH, ROOM_HEIGHT);
    this.physics.world.debugGraphic?.setVisible(false).setDepth(DEPTHS.debug);
    this.collisionDebug = null;
    this.returnSpot = null;
    this.changingScreen = false;

    this.state = newGameState();
    this.wren = new Wren(this, START_SPOT.cell);
    this.fight = new Fight(this, this.wren, this.state, {
      onStateChanged: () => this.publishHud(),
      onWrenDefeated: () => this.loseTheGame(),
      isSolidAt: (x, y) => this.isSolidAt(x, y),
      random: Math.random,
    });
    this.itemUse = new ItemUse(this, this.wren, this.fight, this.state, {
      isSolidAt: (x, y) => this.isSolidAt(x, y),
      onBlast: (x, y, radius) => this.blastWalls(x, y, radius),
      onLight: () => this.lightRoom(),
      onStateChanged: () => this.publishHud(),
    });
    this.darkness = null;
    this.talkers = new Talkers(this);
    // People and wares are solid to Wren and to enemies, on every screen.
    this.physics.add.collider(this.wren, this.talkers.bodies);
    this.physics.add.collider(this.fight.enemies, this.talkers.bodies);
    this.talkReadyAt = 0;
    this.lastTalkTarget = undefined;
    const firstRoom = this.roomFor(START_SPOT);
    this.shown = this.startShowing(START_SPOT, firstRoom, loadRoom(this, firstRoom, this.overlaysFor(START_SPOT, firstRoom)));
    this.fillScreen(firstRoom);
    this.devSpawnIndex = 0;
    this.publishHud();

    this.controls = new ActionInput(this, PLAYER_CONTROLS);
    this.devControls = new ActionInput(this, WORLD_DEV_CONTROLS);

    // The HUD runs beside the world, and goes with it.
    this.scene.launch(SCENES.hud);

    // Keys let go of while the world was frozen never reached it, so they would stay held.
    this.events.on(Phaser.Scenes.Events.RESUME, this.onResume, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(Phaser.Scenes.Events.RESUME, this.onResume, this);
      this.scene.stop(SCENES.hud);
    });
  }

  override update(time: number, delta: number): void {
    this.controls.update();
    this.devControls.update();
    if (this.changingScreen || this.wren.isDefeated) return;

    if (this.controls.justPressed('pause')) this.openPause();
    else if (this.controls.justPressed('inventory')) this.openInventory();
    else this.handleDevKeys(time);

    this.wren.tick(time);
    if (this.wren.canAct) {
      if (this.controls.justPressed('sword')) {
        this.wren.swing(() => this.fight.throwSparkIfFull());
      } else if (!this.tryUseItem(time)) {
        const direction = heldDirection({
          up: this.controls.isDown('up'),
          down: this.controls.isDown('down'),
          left: this.controls.isDown('left'),
          right: this.controls.isDown('right'),
        });
        const justPressed = FACINGS.filter((facing) => this.controls.justPressed(facing));
        this.wren.walk(direction, justPressed, (x, y) => this.isSolidAt(x, y));
        if (!this.talkIfWalkingInto(direction, time) && !this.openDoorIfWalkingInto(direction)) this.leaveIfLeaving(direction);
      }
    }
    // Leaving the screen may have started a change, which clears the fighting.
    if (!this.changingScreen) {
      this.fight.update(time, delta);
      this.itemUse.update(time, delta);
      this.clearRoomIfDone();
    }
  }

  /** Development keys (keyboard only), for testing things the game cannot reach yet. */
  private handleDevKeys(now: number): void {
    const dev = this.devControls;
    if (dev.justPressed('gameOver')) fadeToScene(this, SCENES.gameOver);
    else if (dev.justPressed('ending')) fadeToScene(this, SCENES.ending);
    else if (dev.justPressed('debugCollision')) this.toggleCollisionDebug();
    else if (dev.justPressed('spawnEnemy')) this.spawnEnemyInFront();
    else if (dev.justPressed('hurtWren')) this.fight.hurtWren(1, OPPOSITE_FACING[this.wren.facing], now);
    else if (dev.justPressed('giveItems')) this.changeState(() => ITEM_KINDS.forEach((item) => giveItem(this.state, item)));
    else if (dev.justPressed('giveKey')) this.changeState(() => addKeys(this.state, 1));
    else if (dev.justPressed('giveGems')) this.changeState(() => addGems(this.state, DEV_GEMS));
    else if (dev.justPressed('cycleItem')) this.changeState(() => cycleItemInHand(this.state));
  }

  /**
   * On a press of the item button, uses the item in hand if she has one and it can be used now:
   * she holds it out for a moment, rooted to the spot. Returns whether she used it.
   */
  private tryUseItem(now: number): boolean {
    const item = this.state.itemInHand;
    if (!this.controls.justPressed('useItem') || !item || !this.itemUse.canUse(item)) return false;
    this.wren.useItem(now, () => this.itemUse.use(item, now));
    return true;
  }

  /** A bomb went off: every cracked cliff or cracked dungeon wall whose cell's middle is within the blast opens. */
  private blastWalls(x: number, y: number, radius: number): void {
    for (let row = 0; row < ROOM.rows; row++) {
      for (let column = 0; column < ROOM.columns; column++) {
        const middleX = (column + 0.5) * ROOM.tileSize;
        const middleY = (row + 0.5) * ROOM.tileSize;
        if (Phaser.Math.Distance.Between(x, y, middleX, middleY) <= radius) this.openSecretAt(column, row);
      }
    }
  }

  /** The Lantern's flame lifts a dark room's darkness, for the rest of the visit. */
  private lightRoom(): void {
    const darkness = this.darkness;
    if (!darkness) return;
    this.darkness = null;
    this.tweens.add({ targets: darkness, alpha: 0, duration: LANTERN.lightUpMs, onComplete: () => darkness.destroy() });
  }

  /**
   * Opens a secret wall or cracked dungeon wall at a cell of the screen on show, if there is a
   * closed one there. A secret wall becomes a cave mouth, a door from now on; a cracked wall
   * becomes an open doorway. Either stays open. Returns whether one opened.
   */
  openSecretAt(column: number, row: number): boolean {
    const cracked = closedDoorAt(this.closedDoorsHere(), { column, row });
    if (cracked?.kind === 'cracked') {
      this.state.opened.push(cracked.id);
      this.openDoorway(cracked);
      return true;
    }
    const secret = this.shown.room.secrets?.find((candidate) => candidate.column === column && candidate.row === row);
    if (!secret || this.state.opened.includes(secret.id)) return false;
    this.state.opened.push(secret.id);
    drawTile(this.shown.loaded, { column, row, frame: OPENED_SECRET_FRAME });
    puffAt(this, (column + 0.5) * ROOM.tileSize, (row + 0.5) * ROOM.tileSize);
    return true;
  }

  /** Whether the screen on show is a dungeon room. */
  private get inDungeon(): boolean {
    return AREAS[this.shown.position.area]?.kind === 'dungeon';
  }

  private get isOverworld(): boolean {
    return AREAS[this.shown.position.area]?.kind === 'overworld';
  }

  /** What is drawn over a room's map as it is shown: opened secrets, and doors closed right now. */
  private overlaysFor(position: ScreenPosition, room: RoomDefinition): TileOverlay[] {
    const dungeon = AREAS[position.area]?.kind === 'dungeon';
    return roomOverlays(this.state, position, room, dungeon && hasEnemiesLeft(this.state, position, room));
  }

  /** The side doors of the room on show that are closed now. */
  private closedDoorsHere(): ClosedDoor[] {
    const { position, room } = this.shown;
    return closedDoors(this.state, position, room, this.inDungeon && hasEnemiesLeft(this.state, position, room));
  }

  /** Takes a closed door out of its doorway, in a puff. */
  private openDoorway(door: ClosedDoor): void {
    door.cells.forEach((cell) => drawTile(this.shown.loaded, { ...cell, frame: OPEN_DOORWAY_FRAME }));
    const [first, second] = door.cells;
    if (!first || !second) return;
    puffAt(this, ((first.column + second.column) / 2 + 0.5) * ROOM.tileSize, ((first.row + second.row) / 2 + 0.5) * ROOM.tileSize);
  }

  /**
   * Walking into a locked door with a small key spends the key and opens it; walking into the
   * boss door with this dungeon's boss key opens it (the boss key is kept). Returns true if a door opened.
   */
  private openDoorIfWalkingInto(direction: Vector): boolean {
    const facing = FACING_VECTORS[this.wren.facing];
    if (facing.x * direction.x + facing.y * direction.y <= 0) return false;
    const door = closedDoorAt(this.closedDoorsHere(), this.cellAhead());
    const area = this.shown.position.area;
    if (door?.kind === 'locked' && this.state.keys > 0) this.state.keys -= 1;
    else if (door?.kind !== 'boss' || !hasDungeonItem(this.state, area, 'bossKey')) return false;
    this.state.unlocked.push(door.id);
    this.openDoorway(door);
    this.publishHud();
    return true;
  }

  /**
   * A dungeon room whose enemies are all defeated is cleared for good: its shut doors open, and
   * its enemies do not come back.
   */
  private clearRoomIfDone(): void {
    const { position, room } = this.shown;
    if (!this.inDungeon || !hasEnemiesLeft(this.state, position, room) || this.fight.enemiesLeft > 0) return;
    const shut = this.closedDoorsHere().filter((door) => door.kind === 'shut');
    this.state.cleared.push(roomId(position));
    shut.forEach((door) => this.openDoorway(door));
  }

  private changeState(change: () => void): void {
    change();
    this.publishHud();
  }

  /** Drops the next kind of enemy a couple of tiles in front of Wren, kept inside the room. */
  private spawnEnemyInFront(): void {
    const { x, y } = FACING_VECTORS[this.wren.facing];
    const reach = DEV_SPAWN_DISTANCE_TILES * ROOM.tileSize;
    const clamp = (value: number, max: number): number => Phaser.Math.Clamp(value, ROOM.tileSize / 2, max - ROOM.tileSize / 2);
    const kind = DEV_SPAWN_ORDER[this.devSpawnIndex % DEV_SPAWN_ORDER.length] ?? 'dummy';
    this.devSpawnIndex += 1;
    this.fight.addEnemy(kind, clamp(this.wren.x + x * reach, ROOM_WIDTH), clamp(this.wren.y + y * reach, ROOM_HEIGHT));
  }

  /** Her last half heart is gone: she spins and falls, and after a pause it is Game Over. */
  private loseTheGame(): void {
    this.wren.defeat(() => {
      this.time.delayedCall(COMBAT.defeatPauseMs, () => fadeToScene(this, SCENES.gameOver));
    });
  }

  /**
   * Hands the HUD everything it shows. Inside a cave or house, the mini-map shows the overworld
   * with the screen she came in from marked. In a dungeon it shows the rooms she has been in, or
   * every room once she has its map, and the boss room once she has its compass.
   */
  private publishHud(): void {
    const { health, maxHealth, gems, keys, bombs, itemInHand } = this.state;
    const outside = AREAS[this.shown.position.area]?.kind === 'interior' ? this.returnSpot : null;
    const position = outside ?? this.shown.position;
    const area = AREAS[position.area];
    if (!area) throw new Error(`There is no area called "${position.area}".`);
    const hasMap = hasDungeonItem(this.state, position.area, 'map');
    const hasCompass = hasDungeonItem(this.state, position.area, 'compass');
    const miniMap =
      area.kind === 'dungeon'
        ? miniMapOf(area, position, {
            isShown: (column, row) => hasMap || this.state.visited.includes(roomId({ area: position.area, column, row })),
            boss: hasCompass ? area.boss : undefined,
          })
        : miniMapOf(area, position);
    const value: HudData = { health, maxHealth, gems, keys, bombs, itemInHand, miniMap };
    this.registry.set(HUD_KEY, value);
  }

  /**
   * A screen's enemies, placed pickups, people and wares, as it comes into view. A cleared
   * dungeon room stays empty of enemies, and a dungeon room counts as visited for the mini-map.
   */
  private fillScreen(room: RoomDefinition): void {
    const { position } = this.shown;
    const withEnemies = !this.inDungeon || hasEnemiesLeft(this.state, position, room);
    this.fight.populate(room, this.game.loop.time, withEnemies);
    this.talkers.populate(room, this.state);
    if (room.dark) {
      this.darkness = this.add
        .rectangle(0, 0, ROOM_WIDTH, ROOM_HEIGHT, COLORS.darkness, LANTERN.darkAlpha)
        .setOrigin(0, 0)
        .setDepth(DEPTHS.darkness);
    }
    if (this.inDungeon && !this.state.visited.includes(roomId(position))) this.state.visited.push(roomId(position));
  }

  private emptyScreen(): void {
    this.fight.clear();
    this.talkers.clear();
    this.itemUse.clear();
    this.darkness?.destroy();
    this.darkness = null;
  }

  /**
   * Starts a talk when she walks into someone, a sign or a ware: on first contact, or on a fresh
   * press of the direction while she stands against them. Returns true if a talk started.
   */
  private talkIfWalkingInto(direction: Vector, now: number): boolean {
    const facing = FACING_VECTORS[this.wren.facing];
    const pushing = facing.x * direction.x + facing.y * direction.y > 0;
    const target = pushing ? this.talkTargetAhead() : undefined;
    // Just after a talk, nothing starts one, and who she was against is kept: holding the key
    // through the end of a talk must not start it again.
    if (now < this.talkReadyAt) return false;
    const key = target ? talkKey(target) : undefined;
    const fresh = key !== undefined && (key !== this.lastTalkTarget || this.controls.justPressed(this.wren.facing));
    this.lastTalkTarget = key;
    if (!target || !fresh) return false;
    this.talkTo(target);
    return true;
  }

  /** Who or what is just ahead of her feet, the way she faces. */
  private talkTargetAhead(): TalkTarget | undefined {
    const { x, y } = this.pointAhead();
    return this.talkers.targetAt(x, y);
  }

  /** The room pixel just ahead of her feet, the way she faces: what is there, she is walking into. */
  private pointAhead(): Vector {
    const body = this.wren.body;
    const { x, y } = FACING_VECTORS[this.wren.facing];
    const middleX = (body.left + body.right) / 2;
    const middleY = (body.top + body.bottom) / 2;
    return {
      x: x > 0 ? body.right + TALK.reach - 1 : x < 0 ? body.left - TALK.reach : middleX,
      y: y > 0 ? body.bottom + TALK.reach - 1 : y < 0 ? body.top - TALK.reach : middleY,
    };
  }

  private cellAhead(): Cell {
    const { x, y } = this.pointAhead();
    return { column: Math.floor(x / ROOM.tileSize), row: Math.floor(y / ROOM.tileSize) };
  }

  /** Freezes the world and opens the dialogue box, over whichever half of the room she is not in. */
  private talkTo(target: TalkTarget): void {
    this.wren.halt();
    const position = this.wren.y < ROOM_HEIGHT / 2 ? 'bottom' : 'top';
    let request: DialogueRequest;
    switch (target.kind) {
      case 'person':
        request = this.personTalk(PEOPLE[target.who], position);
        break;
      case 'sign':
        request = { paragraphs: [target.text], position };
        break;
      case 'ware':
        request = {
          speaker: PEOPLE[SHOPKEEPER].name,
          paragraphs: [wareQuestion(target.ware)],
          choice: { onAnswer: (yes) => (yes ? [this.sell(target.ware)] : []) },
          position,
        };
        break;
    }
    this.scene.pause();
    this.scene.launch(SCENES.dialogue, request);
  }

  /** What someone says. Someone with a gift hands it over at the end of the first talk, and says something else after. */
  private personTalk(person: Person, position: DialogueRequest['position']): DialogueRequest {
    const gift = person.gift;
    if (!gift) return { speaker: person.name, paragraphs: person.talk, position };
    if (this.state.items.includes(gift.item)) return { speaker: person.name, paragraphs: gift.after, position };
    return {
      speaker: person.name,
      paragraphs: person.talk,
      position,
      onClose: () => this.changeState(() => giveItem(this.state, gift.item)),
    };
  }

  /** Tries to sell her a ware, and returns what the shopkeeper says about it. */
  private sell(ware: WareKind): string {
    const sale = buy(this.state, ware);
    if (sale.bought) {
      this.publishHud();
      if (!isOnSale(this.state, ware)) this.talkers.removeWare(ware);
    }
    return sale.reply;
  }

  /** Goes through a doorway Wren stands in, or off the edge she is pushing against. */
  private leaveIfLeaving(direction: Vector): void {
    const { column, row } = cellUnder(this.wren.body, ROOM.tileSize);
    const door = doorsOf(this.shown.room, this.state.opened).find((candidate) => candidate.column === column && candidate.row === row);
    if (door) {
      this.goThroughDoor(door);
      return;
    }

    const edge = edgePushedAgainst(this.wren.body, direction, ROOM_WIDTH, ROOM_HEIGHT, SCREEN_CHANGE.edgeTolerance);
    if (!edge) return;
    const next = neighbourOf(AREAS, this.shown.position, edge);
    if (next) this.scrollTo(next, edge);
    // Out of the bottom of a cave, a house or a dungeon's entrance room: back out of the door that led in.
    else if (edge === 'down' && this.returnSpot && !this.isOverworld) this.goBackOut(this.returnSpot);
  }

  private scrollTo(next: ScreenPosition, edge: Facing): void {
    const nextRoom = this.roomFor(next);
    const nextLoaded = loadRoom(this, nextRoom, this.overlaysFor(next, nextRoom));
    const { x, y } = FACING_VECTORS[edge];
    nextLoaded.layer.setPosition(x * ROOM_WIDTH, y * ROOM_HEIGHT);
    this.hideCollisionDebug();
    this.emptyScreen();

    this.changingScreen = true;
    const extraCarry = AREAS[next.area]?.kind === 'dungeon' ? SCREEN_CHANGE.wallCarry : 0;
    scrollToNextScreen(this, this.wren, nextLoaded.layer, edge, extraCarry, () => {
      this.replaceRoom(next, nextRoom, nextLoaded);
      // As on the original console, a screen's enemies appear once it has slid into place.
      this.fillScreen(nextRoom);
      this.changingScreen = false;
      this.publishHud();
    });
  }

  /** Fades into the cave or house behind a doorway. Leaving it comes back out below the door. */
  private goThroughDoor(door: Door): void {
    const outside: WorldSpot = { ...this.shown.position, cell: { column: door.column, row: door.row + 1 } };
    this.fadeTo(door.to, 'up', () => (this.returnSpot = outside));
  }

  private goBackOut(spot: WorldSpot): void {
    this.fadeTo(spot, 'down', () => (this.returnSpot = null));
  }

  private fadeTo(spot: WorldSpot, facing: Facing, whileDark: () => void): void {
    this.changingScreen = true;
    this.wren.halt();
    this.emptyScreen();
    fadeThroughBlack(
      this,
      () => {
        this.hideCollisionDebug();
        this.showRoom(spot);
        this.fillScreen(this.shown.room);
        this.wren.placeInCell(spot.cell);
        this.wren.face(facing);
        whileDark();
        this.publishHud();
      },
      () => (this.changingScreen = false),
    );
  }

  /** Draws a screen at (0, 0) in place of the current one. */
  private showRoom(position: ScreenPosition): void {
    const room = this.roomFor(position);
    this.replaceRoom(position, room, loadRoom(this, room, this.overlaysFor(position, room)));
  }

  private replaceRoom(position: ScreenPosition, room: RoomDefinition, loaded: LoadedRoom): void {
    this.shown.colliders.forEach((collider) => collider.destroy());
    this.shown.loaded.tilemap.destroy();
    this.shown = this.startShowing(position, room, loaded);
  }

  private startShowing(position: ScreenPosition, room: RoomDefinition, loaded: LoadedRoom): ShownScreen {
    loaded.layer.setDepth(DEPTHS.room);
    const colliders = [this.physics.add.collider(this.wren, loaded.layer), this.physics.add.collider(this.fight.enemies, loaded.layer)];
    return { position, room, loaded, colliders };
  }

  private roomFor(position: ScreenPosition): RoomDefinition {
    const room = roomAt(AREAS, position);
    if (!room) throw new Error(`There is no screen at ${position.area} ${position.column},${position.row}.`);
    return room;
  }

  /** Whether the room pixel at (x, y) is on a solid tile. Outside the room counts as open. */
  private isSolidAt(x: number, y: number): boolean {
    return this.shown.loaded.layer.getTileAtWorldXY(x, y)?.collides ?? false;
  }

  /** Freezes the world and lays the pause menu over it. */
  private openPause(): void {
    const data: PauseSceneData = { pausedScene: SCENES.world };
    this.scene.pause();
    this.scene.launch(SCENES.pause, data);
  }

  /** Freezes the world and lays the inventory over it, where she chooses the item in hand. */
  private openInventory(): void {
    const { items, itemInHand, bombs, maxBombs } = this.state;
    const data: InventorySceneData = {
      items,
      itemInHand,
      bombs,
      maxBombs,
      onChoose: (item) => this.changeState(() => (this.state.itemInHand = item)),
    };
    this.scene.pause();
    this.scene.launch(SCENES.inventory, data);
  }

  /**
   * Back from the pause menu, the inventory or a talk. Keys let go of meanwhile never reached
   * the world, so all keys are let go; and a key still held must not start the talk again.
   */
  private onResume(): void {
    this.input.keyboard?.resetKeys();
    // The scene clock still shows the moment the world froze until its next frame; the game loop's time is current.
    this.talkReadyAt = this.game.loop.time + TALK.cooldownMs;
  }

  /** Development view: a translucent box over every solid tile, and the physics bodies. */
  private toggleCollisionDebug(): void {
    if (this.collisionDebug) {
      this.hideCollisionDebug();
      return;
    }
    this.physics.world.debugGraphic?.setVisible(true);
    const graphics = this.add.graphics().setDepth(DEPTHS.debug).fillStyle(COLORS.debugSolid, DEBUG_SOLID_ALPHA);
    this.shown.loaded.layer.forEachTile((tile) => {
      if (tile.collides) graphics.fillRect(tile.pixelX, tile.pixelY, tile.width, tile.height);
    });
    this.collisionDebug = graphics;
  }

  /** The solid-tile boxes belong to one room, so they go when the room changes. */
  private hideCollisionDebug(): void {
    this.physics.world.debugGraphic?.setVisible(false);
    this.collisionDebug?.destroy();
    this.collisionDebug = null;
  }
}
