import { createElement } from './dom';
import { isLaunchable, type GameEntry, type GameStatus } from './gameCatalog';

export interface MenuElements {
  readonly library: HTMLElement;
  readonly detailsTitle: HTMLElement;
  readonly detailsMeta: HTMLElement;
  readonly detailsDescription: HTMLElement;
  readonly detailsAction: HTMLElement;
}

export interface MenuViewEvents {
  onSelect(index: number): void;
  onLaunch(index: number): void;
}

const SELECTED_CLASS = 'is-selected';
const LOCKED_CLASS = 'is-locked';
const DENIED_CLASS = 'is-denied';
const READY_CLASS = 'is-ready';

const STATUS_BADGES: Readonly<Record<GameStatus, string | null>> = {
  playable: null,
  'in-development': 'WIP',
  'coming-soon': 'SOON',
};

const STATUS_ACTIONS: Readonly<Record<GameStatus, string>> = {
  playable: 'PRESS START',
  'in-development': 'PRESS START · WORK IN PROGRESS',
  'coming-soon': 'COMING SOON',
};

/** Draws the cartridge library and the details panel. Holds no menu state. */
export class MenuView {
  private readonly elements: MenuElements;
  private readonly games: readonly GameEntry[];
  private readonly cartridges: HTMLButtonElement[];

  constructor(elements: MenuElements, games: readonly GameEntry[], events: MenuViewEvents) {
    this.elements = elements;
    this.games = games;
    this.cartridges = games.map((game, index) => createCartridge(game, index, events));

    elements.library.replaceChildren(
      ...this.cartridges.map((cartridge) => {
        const item = createElement('li', 'library__item');
        item.append(cartridge);
        return item;
      }),
    );
  }

  select(index: number): void {
    const game = this.games[index];
    const cartridge = this.cartridges[index];
    if (!game || !cartridge) return;

    this.cartridges.forEach((other) => other.classList.toggle(SELECTED_CLASS, other === cartridge));
    cartridge.focus();
    this.renderDetails(game, index);
  }

  showDenied(index: number): void {
    const cartridge = this.cartridges[index];
    if (!cartridge) return;

    cartridge.classList.remove(DENIED_CLASS);
    void cartridge.offsetWidth; // Forces a reflow so the shake animation restarts.
    cartridge.classList.add(DENIED_CLASS);
  }

  /** How many cartridges fit in one row right now (depends on screen width). */
  columnCount(): number {
    return getComputedStyle(this.elements.library).gridTemplateColumns.split(' ').length;
  }

  private renderDetails(game: GameEntry, index: number): void {
    const { detailsTitle, detailsMeta, detailsDescription, detailsAction } = this.elements;

    detailsTitle.textContent = game.title;
    detailsMeta.textContent = `CARTRIDGE ${formatCartridgeNumber(index)} · ${game.genre.toUpperCase()}`;
    detailsDescription.textContent = game.description;
    detailsAction.textContent = STATUS_ACTIONS[game.status];
    detailsAction.classList.toggle(READY_CLASS, isLaunchable(game));
  }
}

function createCartridge(game: GameEntry, index: number, events: MenuViewEvents): HTMLButtonElement {
  const cartridge = createElement('button', 'cartridge');
  cartridge.type = 'button';
  cartridge.style.setProperty('--label-color', game.labelColor);
  cartridge.setAttribute('aria-label', `${game.title}, ${game.genre}`);

  const label = createElement('span', 'cartridge__label');
  label.append(
    createElement('span', 'cartridge__number', formatCartridgeNumber(index)),
    createElement('span', 'cartridge__title', game.title),
    createElement('span', 'cartridge__genre', game.genre),
  );
  cartridge.append(label);

  const badge = STATUS_BADGES[game.status];
  if (badge) {
    cartridge.append(createElement('span', `cartridge__badge cartridge__badge--${game.status}`, badge));
  }
  cartridge.classList.toggle(LOCKED_CLASS, !isLaunchable(game));

  cartridge.addEventListener('pointerenter', () => events.onSelect(index));
  cartridge.addEventListener('focus', () => events.onSelect(index));
  cartridge.addEventListener('click', () => events.onLaunch(index));
  return cartridge;
}

function formatCartridgeNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}
