import { SCREEN, STAGE } from '../../config';
import { toPixels, type FightState } from './fightState';

/**
 * The left edge of the view, in pixels: centred between the fighters, and never past the
 * arena's ends. It is worked out from the state, so both players online see the same view.
 */
export function cameraLeft(state: FightState): number {
  const [a, b] = state.fighters;
  const middle = toPixels(a.x + b.x) / 2;
  const left = Math.round(middle - SCREEN.width / 2);
  return Math.min(STAGE.width - SCREEN.width, Math.max(0, left));
}
