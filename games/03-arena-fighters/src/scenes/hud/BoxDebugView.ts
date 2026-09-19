import type * as Phaser from 'phaser';

import { addPixelText } from '@shared/phaser/pixelText';

import { BODY, COLORS, COMBAT, STAGE } from '../../config';
import { moveLength, phaseAt, segmentAt } from '../../content/fighters/moves';
import type { PlayerIndex } from '../../systems/matchSetup';
import { moveOf, specialOf } from '../../systems/sim/attacks';
import { hitbox, hurtboxes, type Box } from '../../systems/sim/boxes';
import { toPixels, toSubpixels, type FighterState, type FightState } from '../../systems/sim/fightState';
import { projectileBox } from '../../systems/sim/projectiles';
import { pushBox } from '../../systems/sim/pushboxes';

const PLAYERS: readonly PlayerIndex[] = [0, 1];
const BOX_ALPHA = 0.35;
/** The label floats this far above the fighter's feet, in pixels. */
const LABEL_HEIGHT = 72;
/** Player 2's label sits higher, so the two stay readable when the fighters are close. */
const LABEL_STAGGER = 10;
/** Drawn above everything in the arena, including projectiles made after this view. */
const DEBUG_DEPTH = 100;

/**
 * Development view, toggled with H and hidden by default: each fighter's push box (yellow),
 * hurtboxes (blue), throw reach (green, outline only) and, during a move's active frames only,
 * its hitbox (red). Above each fighter: the move's phase and step, or what holds them up.
 */
export class BoxDebugView {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly labels: Record<PlayerIndex, Phaser.GameObjects.BitmapText>;
  private visible = false;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setVisible(false).setDepth(DEBUG_DEPTH);
    const label = (): Phaser.GameObjects.BitmapText =>
      addPixelText(scene, 0, 0, '', { color: COLORS.text }).setVisible(false).setDepth(DEBUG_DEPTH);
    this.labels = { 0: label(), 1: label() };
  }

  toggle(): void {
    this.visible = !this.visible;
    this.graphics.setVisible(this.visible);
    for (const player of PLAYERS) this.labels[player].setVisible(this.visible);
  }

  /** Call once per frame. */
  draw(state: FightState): void {
    if (!this.visible) return;
    this.graphics.clear();
    for (const player of PLAYERS) {
      const fighter = state.fighters[player];
      this.fillBox(pushBox(fighter), COLORS.pushbox);
      hurtboxes(fighter).forEach((box) => this.fillBox(box, COLORS.hurtbox));
      const strike = hitbox(fighter);
      if (strike) this.fillBox(strike, COLORS.hitbox);
      const reach = throwReachPx(fighter);
      if (reach !== null) this.outlineBox(throwReach(fighter, reach), COLORS.throwReach);
      this.drawLabel(this.labels[player], fighter, player);
    }
    state.projectiles.forEach((projectile) => this.fillBox(projectileBox(projectile, state.fighters), COLORS.hitbox));
  }

  private fillBox(box: Box, color: number): void {
    const { left, top, width, height } = onScreen(box);
    this.graphics.fillStyle(color, BOX_ALPHA).fillRect(left, top, width, height);
    this.graphics.lineStyle(1, color).strokeRect(left + 0.5, top + 0.5, width - 1, height - 1);
  }

  private outlineBox(box: Box, color: number): void {
    const { left, top, width, height } = onScreen(box);
    this.graphics.lineStyle(1, color).strokeRect(left + 0.5, top + 0.5, width - 1, height - 1);
  }

  private drawLabel(label: Phaser.GameObjects.BitmapText, fighter: FighterState, player: PlayerIndex): void {
    label.setText(describe(fighter));
    const height = LABEL_HEIGHT + player * LABEL_STAGGER;
    label.setPosition(toPixels(fighter.x) - Math.floor(label.width / 2), STAGE.floorY - toPixels(fighter.y) - height);
  }
}

/** What a fighter is doing, in a few words: a move's phase and step, or what holds them up. */
function describe(fighter: FighterState): string {
  const { status } = fighter;
  switch (status.kind) {
    case 'hitstun':
      return `HITSTUN ${status.steps}`;
    case 'blockstun':
      return `BLOCKSTUN ${status.steps}`;
    case 'knockdown':
      return status.ko ? 'KO' : `DOWN ${status.phase.toUpperCase()}`;
    case 'throwing':
      return `THROW ${status.steps}`;
    case 'thrown':
      return `THROWN ${status.steps}`;
    case 'free': {
      const move = moveOf(fighter);
      if (!move || !fighter.attack) return '';
      return `${phaseAt(move, fighter.attack.step).toUpperCase()} ${fighter.attack.step + 1}/${moveLength(move)}`;
    }
  }
}

/**
 * How far, in pixels, this fighter can grab right now: their command throw's reach on its grab
 * steps, the ordinary throw's while free on the ground, or null when they cannot grab at all.
 */
function throwReachPx(fighter: FighterState): number | null {
  const special = specialOf(fighter);
  if (special?.behaviour.kind === 'commandThrow' && fighter.attack) {
    const grabbing = segmentAt(special.move, fighter.attack.step)?.grab === true;
    return grabbing ? special.behaviour.rangePx[fighter.attack.heavy ? 'heavy' : 'light'] : null;
  }
  return fighter.status.kind === 'free' && fighter.posture !== 'airborne' ? COMBAT.throw.rangePx : null;
}

/** Where the centre of an opponent must be for this fighter's grab to catch them. */
function throwReach(fighter: FighterState, rangePx: number): Box {
  const width = toSubpixels(rangePx);
  return {
    left: fighter.facing === 1 ? fighter.x : fighter.x - width,
    bottom: fighter.y,
    width,
    height: toSubpixels(BODY.standHeight),
  };
}

function onScreen(box: Box): { left: number; top: number; width: number; height: number } {
  return {
    left: toPixels(box.left),
    top: STAGE.floorY - toPixels(box.bottom + box.height),
    width: toPixels(box.width),
    height: toPixels(box.height),
  };
}
