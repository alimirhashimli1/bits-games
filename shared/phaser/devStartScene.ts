/**
 * Development shortcut: adding `?scene=Fight` to the address bar jumps straight to
 * that scene. Only known scene keys are accepted, and production builds ignore it.
 */
export function devStartScene<Key extends string>(allowedKeys: readonly Key[]): Key | undefined {
  if (!import.meta.env.DEV) return undefined;

  const requested = new URLSearchParams(window.location.search).get('scene');
  return allowedKeys.find((key) => key === requested);
}

/** Development shortcut: reads a whole number from the address bar, e.g. `?area=2`. Ignored in production. */
export function devNumberParam(name: string): number | undefined {
  if (!import.meta.env.DEV) return undefined;

  const value = Number.parseInt(new URLSearchParams(window.location.search).get(name) ?? '', 10);
  return Number.isNaN(value) ? undefined : value;
}
