import * as Phaser from 'phaser';

import { playSound } from '@shared/audio/audioEngine';
import { playMusic } from '@shared/audio/music';
import { addCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { COLORS, TIMINGS } from '../config';
import { builtArena } from '../content/arenas';
import { VERSUS_MUSIC } from '../content/music';
import { fighterName } from '../content/roster';
import { SOUNDS } from '../content/sounds';
import { DEFAULT_MATCH, type MatchSetup } from '../systems/matchSetup';
import { SCENES } from './sceneKeys';
import { ScreenInput } from './screenInput';

const PLAYER1_Y = 56;
const VS_Y = 82;
const PLAYER2_Y = 108;
const ARENA_Y = 140;

/** The two fighters face each other, then the fight starts on its own or on confirm. */
export class VersusScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private screenInput!: ScreenInput;
  private setup!: MatchSetup;

  constructor() {
    super(SCENES.versus);
  }

  create(setup: MatchSetup = DEFAULT_MATCH): void {
    fadeIn(this);
    this.screenInput = new ScreenInput(this);
    this.setup = setup;
    playMusic(VERSUS_MUSIC);
    playSound(SOUNDS.versusClash);

    const [player1, player2] = setup.fighters;
    addCenteredPixelText(this, PLAYER1_Y, fighterName(player1), { color: COLORS.player1, scale: 2 });
    addCenteredPixelText(this, VS_Y, 'VS', { color: COLORS.title, scale: 2 });
    addCenteredPixelText(this, PLAYER2_Y, fighterName(player2), { color: COLORS.player2, scale: 2 });
    addCenteredPixelText(this, ARENA_Y, builtArena(setup.arena).name, { color: COLORS.muted });

    this.time.delayedCall(TIMINGS.versusScreenMs, () => this.startFight());
  }

  override update(): void {
    this.screenInput.update();
    if (this.screenInput.justPressed('confirm')) this.startFight();
  }

  private startFight(): void {
    fadeToScene(this, SCENES.fight, this.setup);
  }
}
