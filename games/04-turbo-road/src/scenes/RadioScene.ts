import { playMusic } from '@shared/audio/music';
import { drawCenteredPixelText } from '@shared/pixel-font/canvasPixelText';

import { FM_BAND, RADIO_SONGS, type RadioSong } from '../content/radio';
import { COLORS, SCREEN } from '../config';
import { startRun } from '../systems/race/RaceRun';
import type { GameContext } from '../systems/scenes/GameContext';
import type { Scene } from '../systems/scenes/SceneManager';
import { Menu } from '../systems/ui/Menu';
import { clearScreen } from './clearScreen';
import { RaceScene } from './RaceScene';
import { TitleScene } from './TitleScene';

const HEADING_Y = 24;
const HINT_Y = 38;
/** The dial: a strip with a tick every `TICK_MHZ`, and a needle at the station. */
const DIAL = { left: 64, width: 192, y: 56, height: 12 } as const;
const TICK_MHZ = 2;
const TICK_HEIGHT = 3;
const STATION_Y = 74;
const MENU_Y = 96;
const CONTROLS_Y = 150;

/**
 * Before the start: tune the car radio. The dial's needle moves to the highlighted station and
 * its song plays, so the choice is heard; it carries straight on into the race. Esc goes back
 * to the title.
 */
export class RadioScene implements Scene {
  private readonly menu: Menu;
  private song: RadioSong;

  constructor(game: GameContext) {
    this.song = tuneTo(0);
    this.menu = new Menu(
      game.input,
      RADIO_SONGS.map((song) => ({ label: song.title, onSelect: () => game.scenes.go(new RaceScene(game, startRun(song))) })),
      {
        y: MENU_Y,
        onCancel: () => game.scenes.go(new TitleScene(game)),
        onHighlight: (index) => (this.song = tuneTo(index)),
      },
      SCREEN.width,
    );
  }

  update(): void {
    this.menu.update();
  }

  draw(context: CanvasRenderingContext2D): void {
    clearScreen(context);
    drawCenteredPixelText(context, 'TUNE THE RADIO', HEADING_Y, { color: COLORS.title });
    drawCenteredPixelText(context, 'PICK A SONG FOR THE ROAD', HINT_Y, { color: COLORS.muted });
    drawDial(context, this.song.frequency);
    drawCenteredPixelText(context, `FM ${this.song.frequency.toFixed(1)}`, STATION_Y, { color: COLORS.selected });
    this.menu.draw(context);
    drawCenteredPixelText(context, 'UP DOWN: TUNE   START: DRIVE   ESC: BACK', CONTROLS_Y, { color: COLORS.muted });
  }
}

/** Plays a station's song and returns it. */
function tuneTo(index: number): RadioSong {
  const song = RADIO_SONGS[index] ?? RADIO_SONGS[0];
  if (!song) throw new Error('The radio has no songs.');
  playMusic(song.music);
  return song;
}

function drawDial(context: CanvasRenderingContext2D, frequency: number): void {
  const { left, width, y, height } = DIAL;
  context.fillStyle = COLORS.muted;
  context.fillRect(left, y, width, 1);
  context.fillRect(left, y + height - 1, width, 1);
  const xOf = (mhz: number): number => Math.round(left + ((mhz - FM_BAND.low) / (FM_BAND.high - FM_BAND.low)) * (width - 1));
  for (let mhz = FM_BAND.low; mhz <= FM_BAND.high; mhz += TICK_MHZ) {
    context.fillRect(xOf(mhz), y + 1, 1, TICK_HEIGHT);
    context.fillRect(xOf(mhz), y + height - 1 - TICK_HEIGHT, 1, TICK_HEIGHT);
  }
  context.fillStyle = COLORS.warning;
  context.fillRect(xOf(frequency), y - 2, 1, height + 4);
}
