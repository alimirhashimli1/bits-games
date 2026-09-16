import type { HumanoidBody } from '@shared/pixel-art/humanoidRig';

/**
 * Gorran is built to read as a boss at a glance: a horned helmet instead of a headband,
 * thicker limbs than any guard, and a cape.
 *
 * Head symbols: m helmet steel, M gold trim, s skin, k eye. Body symbols follow the shared
 * rig (g/G armour and its shade, s/S skin, b belt), plus c for the cape.
 */
export const GORRAN_BODY: HumanoidBody = {
  frameWidth: 48,
  frameHeight: 48,
  head: [
    '..M.......M..',
    '..M.......M..',
    '..MM.....MM..',
    '...MmmmmmM...',
    '..mmmmmmmmm..',
    '..mmmmssssm..',
    '..mmmsskss...',
    '..mmmssssss..',
    '...mmssssm...',
    '....mmmmm....',
  ],
  thickness: { torso: 8, upperArm: 4, forearm: 3, fist: 4, leg: 5 },
  symbols: { cloth: 'g', clothShade: 'G', skin: 's', skinShade: 'S', belt: 'b' },
  cape: { symbol: 'c', length: 9, spread: 13 },
};
