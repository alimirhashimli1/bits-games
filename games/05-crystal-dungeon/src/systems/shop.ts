import { CARRY, SHOP } from '../config';
import { canCarryBombs, hasFullHealth, type GameState } from './gameState';

/** What the Emberfen shop can sell. */
export const WARE_KINDS = ['brightshield', 'bombRefill', 'potion'] as const;

export type WareKind = (typeof WARE_KINDS)[number];

/** What the shopkeeper calls each ware when asking "Buy it?". */
export const WARE_NAMES: Readonly<Record<WareKind, string>> = {
  brightshield: 'The Brightshield',
  bombRefill: 'A bag of bombs',
  potion: 'A heart potion',
};

/** What the shopkeeper asks when Wren walks up to a ware. It shares its page with the YES / NO rows. */
export function wareQuestion(ware: WareKind): string {
  return `${WARE_NAMES[ware]}, ${SHOP.prices[ware]} gems. Buy it?`;
}

export interface Sale {
  readonly bought: boolean;
  /** What the shopkeeper says afterwards. */
  readonly reply: string;
}

/** Whether a ware is on show: the Brightshield is sold once, then its spot stays empty. */
export function isOnSale(state: GameState, ware: WareKind): boolean {
  return ware !== 'brightshield' || !state.hasBrightshield;
}

/**
 * Buys a ware if Wren can afford it and has a use for it. Otherwise nothing changes, and the
 * reply says why: no gems are ever taken for nothing.
 */
export function buy(state: GameState, ware: WareKind): Sale {
  const price = SHOP.prices[ware];
  if (!isOnSale(state, ware)) return { bought: false, reply: 'That one is sold, I am afraid.' };
  if (ware === 'bombRefill' && !canCarryBombs(state)) {
    return { bought: false, reply: 'Bombs, loose in your pockets? Come back when you have a bomb bag.' };
  }
  if (ware === 'bombRefill' && state.bombs >= state.maxBombs) return { bought: false, reply: 'Your bomb bag is full already.' };
  if (ware === 'potion' && hasFullHealth(state)) return { bought: false, reply: 'You look hale and hearty. Save your gems!' };
  if (state.gems < price) {
    return { bought: false, reply: `That is ${price} gems, and you have ${state.gems}. Come back with ${price - state.gems} more.` };
  }

  state.gems -= price;
  switch (ware) {
    case 'brightshield':
      state.hasBrightshield = true;
      return { bought: true, reply: 'The Brightshield is yours. It will stop more than pebbles.' };
    case 'bombRefill':
      state.bombs = Math.min(state.maxBombs, state.bombs + CARRY.bombBagSize);
      return { bought: true, reply: 'There, a full bag. Mind the fuses!' };
    case 'potion':
      state.health = state.maxHealth;
      return { bought: true, reply: 'Drink up! Every heart, good as new.' };
  }
}
