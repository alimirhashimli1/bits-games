/**
 * - `playable`: finished, every step in the game's README is ticked.
 * - `in-development`: being built. It can be launched for testing.
 * - `coming-soon`: not started. It cannot be launched.
 */
export type GameStatus = 'playable' | 'in-development' | 'coming-soon';

/** Everything the console menu needs to know about one game cartridge. */
export interface GameEntry {
  /** Folder name inside `games/`. */
  readonly id: string;
  readonly title: string;
  readonly genre: string;
  readonly description: string;
  /** Colour of the cartridge sticker. */
  readonly labelColor: string;
  readonly status: GameStatus;
}

export const GAME_CATALOG: readonly GameEntry[] = [
  {
    id: '01-dojo-quest',
    title: 'Dojo Quest',
    genre: 'Story Fighter',
    description:
      "Climb Warlord Gorran's mountain fortress, defeat his guards one duel at a time and rescue your sister Mei.",
    labelColor: '#e4572e',
    status: 'in-development',
  },
  {
    id: '02-pixel-plumber',
    title: 'Pixel Plumber',
    genre: 'Platformer',
    description: 'Run, jump and stomp through side-scrolling worlds full of coins, secret blocks and power-ups.',
    labelColor: '#3fa7d6',
    status: 'coming-soon',
  },
  {
    id: '03-arena-fighters',
    title: 'Arena Fighters',
    genre: 'Versus Fighter',
    description:
      'Pick a fighter and battle the CPU, a friend on the same keyboard, or anyone online by sending them a link.',
    labelColor: '#9b5de5',
    status: 'coming-soon',
  },
  {
    id: '04-turbo-road',
    title: 'Turbo Road',
    genre: 'Road Racer',
    description: 'Race down winding highways against rival drivers and reach every checkpoint before time runs out.',
    labelColor: '#f4a100',
    status: 'coming-soon',
  },
  {
    id: '05-crystal-dungeon',
    title: 'Crystal Dungeon',
    genre: 'Adventure',
    description: 'Explore a top-down world, find keys and treasure, clear dungeon rooms and defeat the crystal guardian.',
    labelColor: '#2ec4b6',
    status: 'coming-soon',
  },
];

export function isLaunchable(game: GameEntry): boolean {
  return game.status !== 'coming-soon';
}

export function gameUrl(game: GameEntry): string {
  return `${import.meta.env.BASE_URL}games/${game.id}/`;
}
