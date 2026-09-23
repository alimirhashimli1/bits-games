import * as Phaser from 'phaser';

import { playSound } from '@shared/audio/audioEngine';
import { playMusic } from '@shared/audio/music';
import { Menu } from '@shared/phaser/menu';
import { addCenteredPixelText, setCenteredPixelText } from '@shared/phaser/pixelText';
import { fadeIn, fadeToScene } from '@shared/phaser/sceneTransitions';

import { ARCADE_CONTINUE, COLORS } from '../config';
import { CONTINUE_MUSIC } from '../content/music';
import { fighterName } from '../content/roster';
import { SOUNDS } from '../content/sounds';
import { arcadeMatch, continuedRun, currentOpponent } from '../systems/arcade';
import { DEFAULT_MATCH, type MatchSetup } from '../systems/matchSetup';
import { SCENES } from './sceneKeys';

const HEADING_Y = 34;
const COUNT_Y = 60;
const BEATEN_BY_Y = 92;
const MENU_Y = 110;

/**
 * The arcade continue: the player has lost a rung, and the count runs down while they decide.
 * Taking it fights the same opponent again, from the top of the match; letting it run out, or
 * choosing to stop, ends the run at the title. The ladder is not reshuffled either way, so the
 * fighter who beat them is still the one waiting.
 */
export class ContinueScene extends Phaser.Scene {
  // Assigned in create(), which Phaser always runs before update().
  private menu!: Menu;
  private countLabel!: Phaser.GameObjects.BitmapText;
  private setup!: MatchSetup;
  private remaining = ARCADE_CONTINUE.seconds;
  private leaving = false;

  constructor() {
    super(SCENES.continue);
  }

  create(setup: MatchSetup = DEFAULT_MATCH): void {
    fadeIn(this);
    playMusic(CONTINUE_MUSIC);
    this.setup = setup;
    this.remaining = ARCADE_CONTINUE.seconds;
    this.leaving = false;

    addCenteredPixelText(this, HEADING_Y, 'CONTINUE?', { color: COLORS.title, scale: 2 });
    this.countLabel = addCenteredPixelText(this, COUNT_Y, String(this.remaining), { color: COLORS.player1, scale: 2 });
    const run = setup.arcade;
    if (run) {
      addCenteredPixelText(this, BEATEN_BY_Y, `BEATEN BY ${fighterName(currentOpponent(run))}`, { color: COLORS.muted });
    }

    this.menu = new Menu(
      this,
      [
        { label: 'CONTINUE', onSelect: () => this.take() },
        { label: 'GIVE UP', onSelect: () => this.giveUp() },
      ],
      {
        y: MENU_Y,
        color: COLORS.muted,
        selectedColor: COLORS.title,
        onMove: () => playSound(SOUNDS.menuMove),
        onConfirm: () => playSound(SOUNDS.confirm),
      },
    );

    // One tick a second, counting down while they decide.
    this.time.addEvent({ delay: 1000, repeat: this.remaining - 1, callback: () => this.tick() });
  }

  override update(): void {
    this.menu.update();
  }

  private tick(): void {
    if (this.leaving) return;
    this.remaining -= 1;
    setCenteredPixelText(this.countLabel, String(Math.max(0, this.remaining)));
    playSound(SOUNDS.continueTick);
    if (this.remaining <= 0) this.giveUp();
  }

  /** The same stage again, with one more continue against the run's name. */
  private take(): void {
    const run = this.setup.arcade;
    if (this.leaving || !run) {
      this.giveUp();
      return;
    }
    this.leaving = true;
    fadeToScene(this, SCENES.versus, arcadeMatch(continuedRun(run), this.setup.rules));
  }

  private giveUp(): void {
    if (this.leaving) return;
    this.leaving = true;
    fadeToScene(this, SCENES.title);
  }
}
