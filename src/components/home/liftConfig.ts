/** Heights in meters for the hovered barangay's floating slab. */
export const LIFT_M = 520;
export const SLAB_M = 70;
export const BAR_M = 240;

export const REVEAL_MS = 1100;
export const HIDE_MS = 420;

/** Screen height in px of `meters` standing upright at the map center. */
export function metersToPixels(
  meters: number,
  zoom: number,
  latitude: number,
  pitchDeg: number
) {
  const metersPerPixel =
    (40075016.686 * Math.cos((latitude * Math.PI) / 180)) /
    (512 * Math.pow(2, zoom));
  return (meters / metersPerPixel) * Math.sin((pitchDeg * Math.PI) / 180);
}
