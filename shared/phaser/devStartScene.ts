/**
 * Development shortcut: adding `?scene=Fight` to the address bar jumps straight to
 * that scene. Only known scene keys are accepted, and production builds ignore it.
 */
export function devStartScene<Key extends string>(allowedKeys: readonly Key[]): Key | undefined {
  const requested = devParam('scene');
  return allowedKeys.find((key) => key === requested);
}

/** Development shortcut: reads a value from the address bar, e.g. `?level=2-1`. Ignored in production. */
export function devParam(name: string): string | undefined {
  if (!import.meta.env.DEV) return undefined;

  return new URLSearchParams(window.location.search).get(name) ?? undefined;
}

/** Development shortcut: reads a whole number from the address bar, e.g. `?area=2`. Ignored in production. */
export function devNumberParam(name: string): number | undefined {
  const value = Number.parseInt(devParam(name) ?? '', 10);
  return Number.isNaN(value) ? undefined : value;
}
