import type * as Phaser from 'phaser';

import { addCenteredPixelText, addPixelText, setCenteredPixelText } from '@shared/phaser/pixelText';

import { COLORS, COMBAT, FIGHT_CLOCK, ROUND, SCREEN } from '../../config';
import { fighterName, type FighterId } from '../../content/roster';
import type { PlayerIndex } from '../../systems/matchSetup';
import type { FightState } from '../../systems/sim/fightState';
import { isFinalRound } from '../../systems/sim/rounds';

const PLAYERS: readonly PlayerIndex[] = [0, 1];
const PLAYER_COLORS: Readonly<Record<PlayerIndex, number>> = { 0: COLORS.player1, 1: COLORS.player2 };

/** The two health bars run from the screen's edges in to the clock between them, in pixels. */
const BAR = { top: 8, height: 8, edge: 8, width: 128 } as const;
const CLOCK_Y = 6;
const NAME_Y = 19;
/** Round-win markers sit under each bar, at its inner end. */
const MARKER = { top: 19, size: 5, gap: 2 } as const;
const COMBO_Y = 31;
const ANNOUNCE_Y = 62;
/** Health the "recent damage" strip loses each frame as it catches up with the bar. */
const TRAIL_DRAIN = 6;
/** A finished combo's count stays on screen this long, in milliseconds. */
const COMBO_SHOW_MS = 1200;

interface Announcement {
  readonly text: string;
  readonly color: number;
}

/**
 * The fight's heads-up display, drawn from the state each frame: health bars that drain from
 * the inner end with a strip showing recent damage, the round clock, names, round wins, the
 * combo count on the side of whoever is landing it, and the big announcements in the middle.
 */
export class FightHud {
  private readonly scene: Phaser.Scene;
  private readonly names: readonly [string, string];
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly clock: Phaser.GameObjects.BitmapText;
  private readonly combo: Record<PlayerIndex, Phaser.GameObjects.BitmapText>;
  private readonly comboShownUntil: Record<PlayerIndex, number> = { 0: 0, 1: 0 };
  private readonly announcement: Phaser.GameObjects.BitmapText;
  private shownAnnouncement = '';
  /** Where each bar's "recent damage" strip has drained to. */
  private readonly trail: [number, number] = [COMBAT.maxHealth, COMBAT.maxHealth];

  constructor(scene: Phaser.Scene, fighters: readonly [FighterId, FighterId]) {
    this.scene = scene;
    this.names = [fighterName(fighters[0]), fighterName(fighters[1])];
    this.graphics = scene.add.graphics().setScrollFactor(0);
    this.clock = addCenteredPixelText(scene, CLOCK_Y, '', { color: COLORS.text, scale: 2 }).setScrollFactor(0);

    const name = (player: PlayerIndex): Phaser.GameObjects.BitmapText =>
      this.placeOnSide(addPixelText(scene, 0, NAME_Y, this.names[player], { color: PLAYER_COLORS[player] }), player);
    [name(0), name(1)].forEach((label) => label.setScrollFactor(0));

    const comboLine = (player: PlayerIndex): Phaser.GameObjects.BitmapText =>
      addPixelText(scene, 0, COMBO_Y, '', { color: PLAYER_COLORS[player] }).setScrollFactor(0);
    this.combo = { 0: comboLine(0), 1: comboLine(1) };
    this.announcement = addCenteredPixelText(scene, ANNOUNCE_Y, '', { color: COLORS.title, scale: 2 }).setScrollFactor(0);
  }

  /** Call once per frame. */
  draw(state: FightState): void {
    this.graphics.clear();
    for (const player of PLAYERS) {
      this.drawHealth(state, player);
      this.drawRoundWins(state, player);
    }
    setCenteredPixelText(this.clock, String(Math.ceil(state.round.timer / FIGHT_CLOCK.stepsPerSecond)).padStart(2, '0'));
    this.drawCombos(state);
    this.drawAnnouncement(state);
  }

  private drawHealth(state: FightState, player: PlayerIndex): void {
    const { health } = state.fighters[player];
    // The strip catches up with the bar, and a new round refills both at once.
    this.trail[player] = health > this.trail[player] ? health : Math.max(health, this.trail[player] - TRAIL_DRAIN);

    const left = player === 0 ? BAR.edge : SCREEN.width - BAR.edge - BAR.width;
    this.graphics.fillStyle(COLORS.hudFrame).fillRect(left - 1, BAR.top - 1, BAR.width + 2, BAR.height + 2);
    this.graphics.fillStyle(COLORS.healthLost).fillRect(left, BAR.top, BAR.width, BAR.height);
    this.fillBar(left, player, this.trail[player], COLORS.healthTrail);
    this.fillBar(left, player, health, COLORS.healthLeft);
  }

  /** Health is lost from the inner end of each bar, the end next to the clock. */
  private fillBar(left: number, player: PlayerIndex, health: number, color: number): void {
    const width = Math.round((BAR.width * health) / COMBAT.maxHealth);
    const x = player === 0 ? left : left + BAR.width - width;
    this.graphics.fillStyle(color).fillRect(x, BAR.top, width, BAR.height);
  }

  /** One marker per win needed, lit for each round won, running outwards from under the clock. */
  private drawRoundWins(state: FightState, player: PlayerIndex): void {
    for (let index = 0; index < state.rules.roundsToWin; index++) {
      const offset = index * (MARKER.size + MARKER.gap);
      const x = player === 0 ? BAR.edge + BAR.width - MARKER.size - offset : SCREEN.width - BAR.edge - BAR.width + offset;
      const color = index < state.wins[player] ? COLORS.roundWon : COLORS.roundNotWon;
      this.graphics.fillStyle(color).fillRect(x, MARKER.top, MARKER.size, MARKER.size);
    }
  }

  private drawCombos(state: FightState): void {
    const now = this.scene.time.now;
    for (const player of PLAYERS) {
      // A combo belongs to the attacker, so it shows on the side of the one landing it.
      const hits = state.fighters[player === 0 ? 1 : 0].comboHits;
      if (hits >= 2) {
        this.combo[player].setText(`${hits} HITS`);
        this.placeOnSide(this.combo[player], player);
        this.comboShownUntil[player] = now + COMBO_SHOW_MS;
      }
      this.combo[player].setVisible(now < this.comboShownUntil[player]);
    }
  }

  private drawAnnouncement(state: FightState): void {
    const next = this.announcementFor(state);
    const text = next?.text ?? '';
    if (text === this.shownAnnouncement) return;
    this.shownAnnouncement = text;
    this.announcement.setVisible(next !== null);
    if (!next) return;
    this.announcement.setTint(next.color);
    setCenteredPixelText(this.announcement, next.text);
  }

  /** What the middle of the screen says at this point of the round, if anything. */
  private announcementFor(state: FightState): Announcement | null {
    const { round } = state;
    const title = (text: string): Announcement => ({ text, color: COLORS.title });
    const winnerText = (winner: PlayerIndex | 'draw' | null, draw: string): Announcement =>
      winner === null || winner === 'draw'
        ? title(draw)
        : { text: `${this.names[winner]} WINS`, color: PLAYER_COLORS[winner] };

    switch (round.phase) {
      case 'intro':
        return title(isFinalRound(state) ? 'FINAL ROUND' : `ROUND ${round.number}`);
      case 'fight':
        return round.phaseSteps < ROUND.fightTextSteps ? title('FIGHT!') : null;
      case 'ko':
        return title(round.winner === 'draw' ? 'DOUBLE K.O.' : 'K.O.');
      case 'timeUp':
        return title('TIME');
      case 'result':
        return winnerText(round.winner, 'DRAW');
      case 'matchOver':
        return winnerText(state.matchWinner, 'DRAW GAME');
    }
  }

  /** Player 1's text sits on the left, player 2's is right-aligned on the right, both under their bar. */
  private placeOnSide(label: Phaser.GameObjects.BitmapText, player: PlayerIndex): Phaser.GameObjects.BitmapText {
    return label.setX(player === 0 ? BAR.edge : SCREEN.width - BAR.edge - label.width);
  }
}
