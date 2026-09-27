import type * as Phaser from 'phaser';

import { ROOM, SHOP, TALK } from '../config';
import type { PersonId } from '../content/people';
import { TILE_LEGEND } from '../content/world/tileLegend';
import { Villager } from '../entities/Villager';
import { Ware } from '../entities/Ware';
import { middleOf } from './ai/gridWalk';
import type { GameState } from './gameState';
import { isOnSale, type WareKind } from './shop';
import type { RoomDefinition } from './worldMap';

/** What Wren has walked into: someone to talk to, a sign to read, or a ware to ask about. */
export type TalkTarget =
  | { readonly kind: 'person'; readonly who: PersonId }
  | { readonly kind: 'sign'; readonly text: string }
  | { readonly kind: 'ware'; readonly ware: WareKind };

type Standing = Villager | Ware;

/**
 * The people and wares on the screen on show. They are solid (a static physics group Wren
 * collides with), and walking into one of them, or into a signpost, is how a talk starts.
 */
export class Talkers {
  readonly bodies: Phaser.Physics.Arcade.StaticGroup;
  private standing: Standing[] = [];
  private room: RoomDefinition | null = null;

  constructor(private readonly scene: Phaser.Scene) {
    this.bodies = scene.physics.add.staticGroup();
  }

  /** Puts a screen's people in place, and the wares still for sale, each in the middle of its cell. */
  populate(room: RoomDefinition, state: GameState): void {
    this.room = room;
    for (const { who, column, row } of room.people ?? []) {
      const { x, y } = middleOf({ column, row });
      this.stand(new Villager(this.scene, x, y, who));
    }
    for (const { ware, column, row } of room.wares ?? []) {
      if (!isOnSale(state, ware)) continue;
      const { x, y } = middleOf({ column, row });
      this.stand(new Ware(this.scene, x, y, ware));
    }
  }

  clear(): void {
    this.bodies.clear(true, true);
    this.standing = [];
    this.room = null;
  }

  /** Takes a ware off show once it is sold for good. */
  removeWare(ware: WareKind): void {
    const sold = this.standing.filter((thing) => thing instanceof Ware && thing.ware === ware);
    sold.forEach((thing) => thing.destroy());
    this.standing = this.standing.filter((thing) => !sold.includes(thing));
  }

  /** Who or what is at room pixel (x, y): someone's body, a ware's, or a signpost tile. */
  targetAt(x: number, y: number): TalkTarget | undefined {
    const thing = this.standing.find((candidate) => {
      const body = candidate.body as Phaser.Physics.Arcade.StaticBody | null;
      return body !== null && x >= body.left && x < body.right && y >= body.top && y < body.bottom;
    });
    if (thing instanceof Villager) return { kind: 'person', who: thing.who };
    if (thing instanceof Ware) return { kind: 'ware', ware: thing.ware };

    const column = Math.floor(x / ROOM.tileSize);
    const row = Math.floor(y / ROOM.tileSize);
    const symbol = this.room?.tiles[row]?.[column];
    if (symbol === undefined || !TILE_LEGEND[symbol]?.sign) return undefined;
    const sign = this.room?.signs?.find((candidate) => candidate.column === column && candidate.row === row);
    return sign ? { kind: 'sign', text: sign.text } : undefined;
  }

  private stand(thing: Standing): void {
    this.bodies.add(thing);
    const body = thing.body as Phaser.Physics.Arcade.StaticBody;
    const { width, height, offsetX, offsetY } = thing instanceof Ware ? SHOP.wareBody : TALK.body;
    body.setSize(width, height, false).setOffset(offsetX, offsetY);
    this.standing.push(thing);
  }
}
