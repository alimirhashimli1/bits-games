import type { ActionBindings } from '../systems/input/ActionInput';

/** Every action in the game. Menus use the first six, the race uses the rest as well, and mute works anywhere. */
export type GameAction =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'confirm'
  | 'cancel'
  | 'accelerate'
  | 'brake'
  | 'gear'
  | 'pause'
  | 'mute';

const D_PAD_UP = 12;
const D_PAD_DOWN = 13;
const D_PAD_LEFT = 14;
const D_PAD_RIGHT = 15;
const BUTTON_A = 0;
const BUTTON_B = 1;
const BUTTON_X = 2;
const BUTTON_Y = 3;
const RIGHT_SHOULDER = 5;
const BUTTON_START = 9;
const STICK_X = 0;
const STICK_Y = 1;

/** Keyboard keys and gamepad buttons for each action, as listed in the README. */
export const CONTROLS: ActionBindings<GameAction> = {
  up: { keys: ['ArrowUp', 'KeyW'], buttons: [D_PAD_UP], stick: { axis: STICK_Y, direction: -1 } },
  down: { keys: ['ArrowDown', 'KeyS'], buttons: [D_PAD_DOWN], stick: { axis: STICK_Y, direction: 1 } },
  left: { keys: ['ArrowLeft', 'KeyA'], buttons: [D_PAD_LEFT], stick: { axis: STICK_X, direction: -1 } },
  right: { keys: ['ArrowRight', 'KeyD'], buttons: [D_PAD_RIGHT], stick: { axis: STICK_X, direction: 1 } },
  confirm: { keys: ['Enter', 'Space'], buttons: [BUTTON_A, BUTTON_START] },
  cancel: { keys: ['Escape'], buttons: [BUTTON_B] },
  accelerate: { keys: ['ArrowUp', 'KeyW', 'KeyX'], buttons: [BUTTON_A] },
  brake: { keys: ['ArrowDown', 'KeyS', 'KeyZ'], buttons: [BUTTON_B, BUTTON_X] },
  gear: { keys: ['Space', 'KeyC'], buttons: [BUTTON_Y, RIGHT_SHOULDER] },
  pause: { keys: ['Escape'], buttons: [BUTTON_START] },
  mute: { keys: ['KeyM'] },
};
