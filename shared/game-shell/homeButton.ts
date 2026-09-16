/** Every game page lives at `games/<id>/`, so the console menu is two folders up. */
const CONSOLE_MENU_URL = new URL('../../', window.location.href).href;
const HOME_KEY = 'Backspace';

/** Adds the "back to menu" button to the page and the Backspace shortcut. */
export function mountHomeButton(): void {
  const link = document.createElement('a');
  link.className = 'home-button';
  link.href = CONSOLE_MENU_URL;
  link.textContent = '< MENU';
  link.title = 'Back to the console menu (Backspace)';
  document.body.append(link);

  window.addEventListener('keydown', (event) => {
    if (event.code === HOME_KEY) window.location.assign(CONSOLE_MENU_URL);
  });
}
