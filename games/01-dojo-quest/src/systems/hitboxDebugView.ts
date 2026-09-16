import type * as Phaser from 'phaser';

import { addCenteredPixelText } from '@shared/phaser/pixelText';

import { COLORS } from '../config';
import type { Fighter } from '../entities/Fighter';
import type { Hazard } from '../entities/hazards/Hazard';

const LABEL_Y = 18;
/** Fixed label width in characters, so the centred label never shifts sideways. */
const LABEL_LENGTH = 22;
const HITBOX_ALPHA = 0.75;
/** Drawn above the fighters. */
const DEPTH = 100;

/**
 * Development overlay: outlines each fighter's hurtbox, fills attack hitboxes in red
 * while they can hit, and names the first fighter's move and phase (e.g. "PUNCH HIGH: ACTIVE").
 */
export class HitboxDebugView {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.BitmapText;

  constructor(scene: Phaser.Scene, visible: boolean) {
    this.graphics = scene.add.graphics().setDepth(DEPTH);
    this.label = addCenteredPixelText(scene, LABEL_Y, ''.padEnd(LABEL_LENGTH), { color: COLORS.danger }).setDepth(DEPTH);
    this.setVisible(visible);
  }

  toggle(): void {
    this.setVisible(!this.graphics.visible);
  }

  draw(fighters: readonly Fighter[], hazards: readonly Hazard[] = []): void {
    this.graphics.clear();
    this.label.setText((fighters[0] ? describeAction(fighters[0]) : '').padEnd(LABEL_LENGTH));

    for (const hazard of hazards) {
      const zone = hazard.dangerZone();
      if (zone) this.graphics.fillStyle(COLORS.danger, HITBOX_ALPHA).fillRectShape(zone);
    }

    for (const fighter of fighters) {
      const hurtbox = fighter.hurtbox();
      if (hurtbox) {
        // Half-pixel offsets keep 1-pixel outlines sharp.
        this.graphics.lineStyle(1, COLORS.muted).strokeRect(hurtbox.x + 0.5, hurtbox.y + 0.5, hurtbox.width - 1, hurtbox.height - 1);
      }
      const hitbox = fighter.activeHitbox();
      if (hitbox) this.graphics.fillStyle(COLORS.danger, HITBOX_ALPHA).fillRectShape(hitbox);
    }
  }

  private setVisible(visible: boolean): void {
    this.graphics.setVisible(visible);
    this.label.setVisible(visible);
  }
}

function describeAction(fighter: Fighter): string {
  const attack = fighter.currentAttack;
  if (attack) return `${attack.move.kind} ${attack.move.height}: ${attack.phase}`.toUpperCase();
  if (fighter.blockHeight) return `BLOCK ${fighter.blockHeight}`.toUpperCase();
  return '';
}
