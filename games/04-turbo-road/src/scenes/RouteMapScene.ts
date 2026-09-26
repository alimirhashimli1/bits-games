import { drawCenteredPixelText, drawPixelText, measurePixelText } from '@shared/pixel-font/canvasPixelText';

import { GOALS, STAGES } from '../content/stages/route';
import type { GoalId, StageId } from '../content/stages/stage';
import { COLORS, ROUTE_MAP } from '../config';
import type { RaceRun } from '../systems/race/RaceRun';
import type { GameContext } from '../systems/scenes/GameContext';
import type { Scene } from '../systems/scenes/SceneManager';
import { clearScreen } from './clearScreen';
import { RaceScene } from './RaceScene';

type Place = StageId | GoalId;

/** Where each stage and goal sits on the map: the pyramid, leg 1 at the top, the goals at the bottom. */
const POSITIONS: Readonly<Record<Place, { readonly x: number; readonly y: number }>> = {
  sunsetCoast: { x: 160, y: 30 },
  palmCanyon: { x: 92, y: 60 },
  harbourLights: { x: 228, y: 60 },
  redrockDesert: { x: 52, y: 90 },
  pinewoodPass: { x: 160, y: 90 },
  neonBoulevard: { x: 268, y: 90 },
  starObservatory: { x: 52, y: 122 },
  summitLodge: { x: 160, y: 122 },
  skylinePier: { x: 268, y: 122 },
};

const TITLE_Y = 8;
const MARKER_SIZE = 5;
/** A place's name sits just under its marker; roads leave from under the name. */
const LABEL_GAP = 4;
const ROAD_START_GAP = 14;
const NEXT_Y = 150;
const PROMPT_Y = 164;

/**
 * Between stages: the whole route as a pyramid, the road taken so far lit up, and the next
 * stage blinking. The clock is stopped. START, or a few seconds, carries on into the next stage.
 */
export class RouteMapScene implements Scene {
  private steps = 0;

  constructor(
    private readonly game: GameContext,
    private readonly run: RaceRun,
  ) {}

  update(): void {
    this.steps++;
    if (this.steps >= ROUTE_MAP.showSteps || this.game.input.justPressed('confirm')) {
      this.game.scenes.go(new RaceScene(this.game, this.run));
    }
  }

  draw(context: CanvasRenderingContext2D): void {
    clearScreen(context);
    drawCenteredPixelText(context, 'THE SUNWARD RUN', TITLE_Y, { color: COLORS.title });

    const taken = [...this.run.route, this.run.stage];
    for (const stage of Object.values(STAGES)) {
      const exits = stage.exit.kind === 'fork' ? [stage.exit.left, stage.exit.right] : [stage.exit.goal];
      for (const exit of exits) {
        const driven = taken.indexOf(stage.id) >= 0 && taken[taken.indexOf(stage.id) + 1] === exit;
        drawRoadBetween(context, stage.id, exit, driven ? COLORS.title : COLORS.muted);
      }
    }

    const blinkOn = Math.floor(this.steps / ROUTE_MAP.blinkSteps) % 2 === 0;
    for (const stage of Object.values(STAGES)) {
      const isNext = stage.id === this.run.stage;
      if (isNext && !blinkOn) continue;
      const color = isNext ? COLORS.selected : this.run.route.includes(stage.id) ? COLORS.text : COLORS.muted;
      drawPlace(context, stage.id, stage.name, color);
    }
    for (const goal of Object.values(GOALS)) drawPlace(context, goal.id, goal.name, COLORS.muted);

    drawCenteredPixelText(context, `NEXT: ${STAGES[this.run.stage].name}`, NEXT_Y, { color: COLORS.text });
    drawCenteredPixelText(context, 'PRESS START', PROMPT_Y, { color: COLORS.muted });
  }
}

function drawPlace(context: CanvasRenderingContext2D, place: Place, name: string, color: string): void {
  const { x, y } = POSITIONS[place];
  const half = Math.floor(MARKER_SIZE / 2);
  context.fillStyle = color;
  context.fillRect(x - half, y - half, MARKER_SIZE, MARKER_SIZE);
  drawPixelText(context, name, Math.round(x - measurePixelText(name) / 2), y + LABEL_GAP, { color });
}

/** A one-pixel line from under one place's name down to the next place's marker. */
function drawRoadBetween(context: CanvasRenderingContext2D, from: Place, to: Place, color: string): void {
  const start = POSITIONS[from];
  const end = POSITIONS[to];
  const startY = start.y + ROAD_START_GAP;
  const endY = end.y - MARKER_SIZE;
  const length = Math.max(Math.abs(end.x - start.x), Math.abs(endY - startY));
  context.fillStyle = color;
  for (let step = 0; step <= length; step++) {
    const along = length === 0 ? 0 : step / length;
    context.fillRect(Math.round(start.x + (end.x - start.x) * along), Math.round(startY + (endY - startY) * along), 1, 1);
  }
}
