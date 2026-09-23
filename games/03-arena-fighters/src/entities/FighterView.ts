import type * as Phaser from 'phaser';

import { STAGE } from '../config';
import type { AnyPoseName } from '../content/fighters/poseNames';
import { fighterAnimationKey, type FighterAnimationName } from '../content/sprites/fighterSprites';
import { isVanished } from '../systems/sim/attacks';
import { toPixels, type FighterState } from '../systems/sim/fightState';
import { poseOf } from '../systems/sim/pose';

type Display = { readonly animation: FighterAnimationName } | { readonly frame: AnyPoseName };

/**
 * Draws one fighter from the fight state. It only reads the state: standing still or walking
 * is shown as an animation, and everything else as the pose the fight says the fighter is in.
 */
export class FighterView {
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly sheetKey: string;
  private shownFrame: AnyPoseName | undefined;

  constructor(scene: Phaser.Scene, sheetKey: string) {
    this.sheetKey = sheetKey;
    // The frame's bottom row is the outline under the feet, so it sits on the floor's top row.
    this.sprite = scene.add.sprite(0, 0, sheetKey, 'idle1').setOrigin(0.5, 1);
  }

  /** `celebrating` shows the win pose instead: the round's winner, once the result is in. */
  draw(fighter: FighterState, celebrating: boolean): void {
    this.sprite.setPosition(toPixels(fighter.x), STAGE.floorY + 1 - toPixels(fighter.y));
    this.sprite.setFlipX(fighter.facing === -1);
    // Nothing is drawn of a fighter part-way through a teleport.
    this.sprite.setVisible(!isVanished(fighter));
    const standingStill = fighter.status.kind === 'free' && !fighter.attack && fighter.posture !== 'airborne';
    this.show(celebrating && standingStill ? { animation: 'win' } : displayFor(fighter));
  }

  private show(display: Display): void {
    if ('animation' in display) {
      this.shownFrame = undefined;
      this.sprite.play(fighterAnimationKey(this.sheetKey, display.animation), true);
      return;
    }
    if (display.frame === this.shownFrame) return;
    this.shownFrame = display.frame;
    this.sprite.stop().setFrame(display.frame);
  }
}

function displayFor(fighter: FighterState): Display {
  if (fighter.attack || fighter.posture !== 'standing' || fighter.status.kind !== 'free') return { frame: poseOf(fighter) };
  const direction = Math.sign(fighter.vx);
  if (direction === 0) return { animation: 'idle' };
  // Moving the way the fighter faces is walking forward, whichever side of the screen they are on.
  return { animation: direction === fighter.facing ? 'walkForward' : 'walkBack' };
}
