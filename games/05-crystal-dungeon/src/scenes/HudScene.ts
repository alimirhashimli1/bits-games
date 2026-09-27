import * as Phaser from 'phaser';

import { addPixelText } from '@shared/phaser/pixelText';

import { COLORS, HEALTH, HUD, ROOM, SCREEN } from '../config';
import { HEART_SHEET } from '../content/sprites/combat';
import { HUD_ICON_SHEET, ITEM_SHEET } from '../content/sprites/items';
import { HUD_KEY, isHudData, type HudData, type MiniMap } from '../systems/hudData';
import { SCENES } from './sceneKeys';

/** How many digits each counter shows, padded with zeros so the row never shifts. */
const GEM_DIGITS = 3;
const KEY_DIGITS = 1;
const BOMB_DIGITS = 2;
/** The pixel font's glyphs are 7 pixels tall; this centres them on the 8-pixel icons. */
const TEXT_DROP = 1;

/**
 * The strip across the top of the screen, laid over the World scene and running beside it:
 * the mini-map, the gem, key and bomb counters, the item in hand, and the hearts. It redraws
 * all of it whenever the World publishes new numbers.
 */
export class HudScene extends Phaser.Scene {
  private drawn: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super(SCENES.hud);
  }

  create(): void {
    this.drawn = [];
    this.add.rectangle(0, 0, SCREEN.width, ROOM.hudHeight, COLORS.screen).setOrigin(0, 0);

    const onChange = (_parent: unknown, value: unknown): void => {
      if (isHudData(value)) this.draw(value);
    };
    const eventName = `changedata-${HUD_KEY}`;
    this.registry.events.on(eventName, onChange);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.registry.events.off(eventName, onChange));

    const data: unknown = this.registry.get(HUD_KEY);
    if (isHudData(data)) this.draw(data);
  }

  private draw(data: HudData): void {
    this.drawn.forEach((object) => object.destroy());
    this.drawn = [];
    this.drawMiniMap(data.miniMap);
    this.drawCounters(data);
    this.drawItemInHand(data);
    this.drawHearts(data);
  }

  /**
   * A dark box with a small block per screen shown, Wren's one lit, and the boss room in red once
   * she has the compass (even before the map shows it). The blocks share the box's size out evenly.
   */
  private drawMiniMap({ columns, rows, screens, here, boss }: MiniMap): void {
    const { x, y, width, height, gap } = HUD.miniMap;
    const graphics = this.add.graphics();
    this.drawn.push(graphics);
    graphics.fillStyle(HUD.colors.miniMapBack).fillRect(x, y, width, height);

    const cellWidth = Math.floor((width - gap) / columns);
    const cellHeight = Math.floor((height - gap) / rows);
    const left = x + Math.floor((width - cellWidth * columns + gap) / 2);
    const top = y + Math.floor((height - cellHeight * rows + gap) / 2);
    const block = (column: number, row: number, color: number): void => {
      graphics.fillStyle(color).fillRect(left + column * cellWidth, top + row * cellHeight, cellWidth - gap, cellHeight - gap);
    };
    screens.forEach((line, row) => {
      line.forEach((shown, column) => {
        if (shown) block(column, row, HUD.colors.miniMapScreen);
      });
    });
    if (boss) block(boss.column, boss.row, HUD.colors.miniMapBoss);
    block(here.column, here.row, HUD.colors.miniMapHere);
  }

  /** Gems, keys and bombs, each an icon and a number. */
  private drawCounters({ gems, keys, bombs }: HudData): void {
    const { x, y, iconSize, iconGap, spacing } = HUD.counters;
    let left = x;
    const counters: readonly (readonly [string, number, number])[] = [
      ['gem', gems, GEM_DIGITS],
      ['key', keys, KEY_DIGITS],
      ['bomb', bombs, BOMB_DIGITS],
    ];
    for (const [icon, value, digits] of counters) {
      this.drawn.push(this.add.image(left, y, HUD_ICON_SHEET.key, icon).setOrigin(0, 0));
      const text = addPixelText(this, left + iconSize + iconGap, y + TEXT_DROP, String(value).padStart(digits, '0'), {
        color: HUD.colors.counter,
      });
      this.drawn.push(text);
      left = text.x + text.width + spacing;
    }
  }

  /** A frame, with the item in hand inside it (empty until she has one). */
  private drawItemInHand({ itemInHand }: HudData): void {
    const { x, y, size } = HUD.itemBox;
    const frame = this.add.graphics().lineStyle(1, HUD.colors.itemFrame).strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
    this.drawn.push(frame);
    if (itemInHand) this.drawn.push(this.add.image(x + size / 2, y + size / 2, ITEM_SHEET.key, itemInHand));
  }

  /** One heart per two units of health, filled from the left: full, then a half, then empty. */
  private drawHearts({ health, maxHealth }: HudData): void {
    const { size, spacing, rightMargin } = HUD.hearts;
    const count = Math.ceil(maxHealth / HEALTH.unitsPerHeart);
    const left = SCREEN.width - rightMargin - (count - 1) * spacing - size;
    const top = (ROOM.hudHeight - size) / 2;

    for (let index = 0; index < count; index++) {
      const filled = health - index * HEALTH.unitsPerHeart;
      const frame = filled >= HEALTH.unitsPerHeart ? 'full' : filled > 0 ? 'half' : 'empty';
      this.drawn.push(this.add.image(left + index * spacing, top, HEART_SHEET.key, frame).setOrigin(0, 0));
    }
  }
}
