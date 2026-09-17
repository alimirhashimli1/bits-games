/** How powered up Rusty is. Each state can take one more hit than the one before. */
export type PowerState = 'small' | 'big' | 'steam';

/** The items that come out of blocks. */
export type ItemKind = 'gear' | 'steamValve' | 'goldenGasket' | 'wrench';

/** The items that change Rusty's power state. */
export type PowerUpKind = Extract<ItemKind, 'gear' | 'steamValve'>;

/**
 * What a power-up block gives, decided when it is hit: small Rusty gets a Gear, big Rusty a
 * Steam Valve. So a power-up never skips a state.
 */
export function blockPowerUp(power: PowerState): PowerUpKind {
  return power === 'small' ? 'gear' : 'steamValve';
}

/** Rusty's power after collecting a power-up. Each one raises it by at most one state. */
export function collectPowerUp(power: PowerState, item: PowerUpKind): PowerState {
  if (power === 'small') return 'big';
  return item === 'steamValve' ? 'steam' : power;
}

/** Rusty's power after being hurt, or `undefined` when small Rusty is hit and loses a life. */
export function powerAfterHit(power: PowerState): PowerState | undefined {
  switch (power) {
    case 'steam':
      return 'big';
    case 'big':
      return 'small';
    case 'small':
      return undefined;
  }
}

/** The next state in order, back to small after steam. For the development key that cycles through them. */
export function nextPowerState(power: PowerState): PowerState {
  return power === 'small' ? 'big' : power === 'big' ? 'steam' : 'small';
}
