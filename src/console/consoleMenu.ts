import { gameUrl, isLaunchable, type GameEntry } from './gameCatalog';
import type { MenuAction, MenuDirection } from './menuInput';
import { playMenuSound } from './menuSounds';
import { MenuView, type MenuElements } from './menuView';

/** Gives the start jingle time to play before the game page loads. */
const LAUNCH_DELAY_MS = 400;

/** Menu state and rules: which cartridge is selected and what each input does. */
export class ConsoleMenu {
  private readonly games: readonly GameEntry[];
  private readonly view: MenuView;
  private selectedIndex = 0;
  private isLaunching = false;

  constructor(games: readonly GameEntry[], elements: MenuElements) {
    this.games = games;
    this.view = new MenuView(elements, games, {
      onSelect: (index) => this.select(index),
      onLaunch: (index) => this.launch(index),
    });
    this.view.select(this.selectedIndex);

    // Coming back with the browser's Back button can restore this page from memory.
    window.addEventListener('pageshow', () => {
      this.isLaunching = false;
    });
  }

  handleAction(action: MenuAction): void {
    if (action === 'confirm') {
      this.launch(this.selectedIndex);
    } else {
      this.select(this.neighbourOf(action));
    }
  }

  private select(index: number): void {
    if (index === this.selectedIndex || this.isLaunching) return;

    this.selectedIndex = index;
    this.view.select(index);
    playMenuSound('move');
  }

  private launch(index: number): void {
    const game = this.games[index];
    if (!game || this.isLaunching) return;

    if (!isLaunchable(game)) {
      this.view.showDenied(index);
      playMenuSound('denied');
      return;
    }

    this.isLaunching = true;
    playMenuSound('start');
    window.setTimeout(() => window.location.assign(gameUrl(game)), LAUNCH_DELAY_MS);
  }

  /** The cartridge next to the selected one, or the selected one itself at an edge. */
  private neighbourOf(direction: MenuDirection): number {
    const columns = this.view.columnCount();
    const lastIndex = this.games.length - 1;
    const current = this.selectedIndex;

    switch (direction) {
      case 'left':
        return Math.max(current - 1, 0);
      case 'right':
        return Math.min(current + 1, lastIndex);
      case 'up':
        return current - columns >= 0 ? current - columns : current;
      case 'down': {
        const isLastRow = Math.floor(current / columns) === Math.floor(lastIndex / columns);
        return isLastRow ? current : Math.min(current + columns, lastIndex);
      }
    }
  }
}
