import './styles.css';

import { unlockAudioOnFirstInput } from '@shared/audio/sfx';

import { ConsoleMenu } from './consoleMenu';
import { requireElement } from './dom';
import { GAME_CATALOG } from './gameCatalog';
import { listenForMenuInput } from './menuInput';

// Registered before the menu's own listeners, so the very first key press can already make sound.
unlockAudioOnFirstInput();

const menu = new ConsoleMenu(GAME_CATALOG, {
  library: requireElement('#library'),
  detailsTitle: requireElement('#details-title'),
  detailsMeta: requireElement('#details-meta'),
  detailsDescription: requireElement('#details-description'),
  detailsAction: requireElement('#details-action'),
});

listenForMenuInput((action) => menu.handleAction(action));
