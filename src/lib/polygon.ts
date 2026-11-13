import type { MultiPolygon, Polygon, Position } from 'geojson';

export type Area = Polygon | MultiPolygon;

export function polygonsOf(geometry: Area): Position[][][] {
  return geometry.type === 'Polygon'
    ? [geometry.coordinates]
    : geometry.coordinates;
}

function inRing(x: number, y: number, ring: Position[]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

export function inArea(x: number, y: number, geometry: Area) {
  return polygonsOf(geometry).some(
    ([outer, ...holes]) =>
      inRing(x, y, outer) && !holes.some(hole => inRing(x, y, hole))
  );
}

export function bboxOf(geometry: Area): [number, number, number, number] {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [outer] of polygonsOf(geometry)) {
    for (const [x, y] of outer) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return [minX, minY, maxX, maxY];
}

function ringCentroid(ring: Position[]): {
  x: number;
  y: number;
  area: number;
} {
  let area = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const cross = xj * yi - xi * yj;
    area += cross;
    cx += (xj + xi) * cross;
    cy += (yj + yi) * cross;
  }
  area /= 2;
  if (area === 0) return { x: ring[0][0], y: ring[0][1], area: 0 };
  return { x: cx / (6 * area), y: cy / (6 * area), area: Math.abs(area) };
}

/** A point inside the area, near the middle of its largest polygon. */
export function labelPoint(geometry: Area): [number, number] {
  const largest = polygonsOf(geometry)
    .map(([outer]) => ringCentroid(outer))
    .sort((a, b) => b.area - a.area)[0];
  if (largest && inArea(largest.x, largest.y, geometry)) {
    return [largest.x, largest.y];
  }
  const [minX, minY, maxX, maxY] = bboxOf(geometry);
  const midY = (minY + maxY) / 2;
  for (let step = 1; step < 64; step++) {
    const x = minX + ((maxX - minX) * step) / 64;
    if (inArea(x, midY, geometry)) return [x, midY];
  }
  const first = polygonsOf(geometry)[0][0][0];
  return [first[0], first[1]];
}

/** Square ring of `sizeM` meters centered on a lng/lat. */
export function squareAt([lng, lat]: Position, sizeM: number): Position[] {
  const half = sizeM / 2;
  const dLat = half / 110540;
  const dLng = half / (111320 * Math.cos((lat * Math.PI) / 180));
  return [
    [lng - dLng, lat - dLat],
    [lng + dLng, lat - dLat],
    [lng + dLng, lat + dLat],
    [lng - dLng, lat + dLat],
    [lng - dLng, lat - dLat],
  ];
}
