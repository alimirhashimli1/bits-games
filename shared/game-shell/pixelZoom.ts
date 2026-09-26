/**
 * The largest zoom that fits the window and makes every game pixel a whole number
 * of *physical* screen pixels.
 *
 * With Windows display scaling at 125%, one CSS pixel is 1.25 screen pixels, so a
 * CSS zoom of 5 would draw each game pixel 6.25 screen pixels wide and look blurry.
 * Instead we choose 6 screen pixels and convert back: a CSS zoom of 4.8.
 */
export function pixelPerfectZoom(width: number, height: number): number {
  const pixelRatio = window.devicePixelRatio;
  const screenWidth = window.innerWidth * pixelRatio;
  const screenHeight = window.innerHeight * pixelRatio;
  const screenPixelsPerGamePixel = Math.max(1, Math.floor(Math.min(screenWidth / width, screenHeight / height)));
  return screenPixelsPerGamePixel / pixelRatio;
}

/** Calls `callback` whenever the zoom may need to change: on resize, or when the window moves to another monitor. */
export function onZoomChange(callback: () => void): void {
  window.addEventListener('resize', callback);
  onPixelRatioChange(callback);
}

/** Calls `callback` when the pixel ratio changes, e.g. when the window moves to another monitor. */
function onPixelRatioChange(callback: () => void): void {
  const query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
  query.addEventListener(
    'change',
    () => {
      callback();
      onPixelRatioChange(callback);
    },
    { once: true },
  );
}
