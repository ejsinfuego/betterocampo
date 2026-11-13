import { useEffect, useRef } from 'react';
import type { ExpressionSpecification, GeoJSONSource } from 'maplibre-gl';
import type { Feature, FeatureCollection, Polygon, Position } from 'geojson';
import { useMap } from '../ui/map';
import { PEOPLE_PER_DOT } from '../../data/ocampoBarangays';
import { bboxOf, inArea, squareAt, type Area } from '../../lib/polygon';
import { BAR_M, HIDE_MS, LIFT_M, REVEAL_MS, SLAB_M } from './liftConfig';

const SLAB_SOURCE = 'barangay-lift-slab';
const BARS_SOURCE = 'barangay-lift-bars';
const SHADOW_LAYER = 'barangay-lift-shadow';
const OUTLINE_LAYER = 'barangay-lift-outline';
const SLAB_LAYER = 'barangay-lift-slab';
const BARS_LAYER = 'barangay-lift-bars';

/** Share of the reveal spent staggering bars outward from the cursor. */
const SPREAD = 0.65;
const GROW = 1 - SPREAD;
const BOB_M = 45;

export type LiftTarget = {
  psgc: string;
  population: number;
  areaSqKm: number;
  geometry: Area;
  origin: [number, number];
};

type BarProps = { delay: number };

const EMPTY: FeatureCollection = { type: 'FeatureCollection', features: [] };

function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const pointCache = new Map<string, Position[]>();

function scatter(target: LiftTarget): Position[] {
  const cached = pointCache.get(target.psgc);
  if (cached) return cached;
  const [minX, minY, maxX, maxY] = bboxOf(target.geometry);
  const random = seededRandom(target.psgc);
  const wanted = Math.max(1, Math.round(target.population / PEOPLE_PER_DOT));
  const points: Position[] = [];
  for (let tries = 0; points.length < wanted && tries < wanted * 200; tries++) {
    const x = minX + random() * (maxX - minX);
    const y = minY + random() * (maxY - minY);
    if (inArea(x, y, target.geometry)) points.push([x, y]);
  }
  pointCache.set(target.psgc, points);
  return points;
}

function buildBars(target: LiftTarget): FeatureCollection<Polygon, BarProps> {
  const points = scatter(target);
  const spacing = Math.sqrt((target.areaSqKm * 1e6) / points.length);
  const size = Math.max(8, Math.min(45, spacing * 0.42));
  const [ox, oy] = target.origin;
  const distances = points.map(([x, y]) => Math.hypot(x - ox, y - oy));
  const farthest = Math.max(...distances, 1e-9);
  const jitter = seededRandom(`${target.psgc}-jitter`);
  return {
    type: 'FeatureCollection',
    features: points.map((point, index) => ({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [squareAt(point, size)] },
      properties: {
        delay: Math.min(
          SPREAD,
          (distances[index] / farthest) * SPREAD * 0.85 + jitter() * 0.1
        ),
      },
    })),
  };
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutBack(t: number) {
  const c = 1.4;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Lifts the hovered barangay off the map as a 3D slab, leaves a shadow on its
 * ground footprint, and grows one bar per PEOPLE_PER_DOT residents on top.
 */
export default function BarangayLift({
  target,
}: {
  target: LiftTarget | null;
}) {
  const { map, isLoaded } = useMap();
  const progressRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!map || !isLoaded) return;

    map.addSource(SLAB_SOURCE, { type: 'geojson', data: EMPTY });
    map.addSource(BARS_SOURCE, { type: 'geojson', data: EMPTY });
    map.addLayer({
      id: SHADOW_LAYER,
      type: 'fill',
      source: SLAB_SOURCE,
      paint: { 'fill-color': '#0b1f4d', 'fill-opacity': 0 },
    });
    map.addLayer({
      id: OUTLINE_LAYER,
      type: 'line',
      source: SLAB_SOURCE,
      paint: {
        'line-color': '#0b1f4d',
        'line-width': 1.5,
        'line-dasharray': [2, 2],
        'line-opacity': 0,
      },
    });
    map.addLayer({
      id: SLAB_LAYER,
      type: 'fill-extrusion',
      source: SLAB_SOURCE,
      paint: {
        'fill-extrusion-color': '#2563eb',
        'fill-extrusion-base': 0,
        'fill-extrusion-height': 0,
        'fill-extrusion-opacity': 0,
        'fill-extrusion-vertical-gradient': true,
      },
    });
    map.addLayer({
      id: BARS_LAYER,
      type: 'fill-extrusion',
      source: BARS_SOURCE,
      paint: {
        'fill-extrusion-color': '#f8fafc',
        'fill-extrusion-base': 0,
        'fill-extrusion-height': 0,
        'fill-extrusion-opacity': 0,
      },
    });

    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
      try {
        for (const layer of [
          BARS_LAYER,
          SLAB_LAYER,
          OUTLINE_LAYER,
          SHADOW_LAYER,
        ]) {
          if (map.getLayer(layer)) map.removeLayer(layer);
        }
        for (const source of [BARS_SOURCE, SLAB_SOURCE]) {
          if (map.getSource(source)) map.removeSource(source);
        }
      } catch {
        // style may be mid-reload
      }
    };
  }, [map, isLoaded]);

  useEffect(() => {
    if (!map || !isLoaded || !map.getLayer(SLAB_LAYER)) return;

    const slabSource = map.getSource(SLAB_SOURCE) as GeoJSONSource;
    const barsSource = map.getSource(BARS_SOURCE) as GeoJSONSource;

    const paint = (progress: number, time: number) => {
      const rise = Math.max(0, Math.min(1, progress / GROW));
      const bob = time > 0 ? Math.sin(time / 650) * BOB_M : 0;
      const base = LIFT_M * easeOutBack(rise) + bob;
      const top = base + SLAB_M;

      map.setPaintProperty(SLAB_LAYER, 'fill-extrusion-base', base);
      map.setPaintProperty(SLAB_LAYER, 'fill-extrusion-height', top);
      map.setPaintProperty(
        SLAB_LAYER,
        'fill-extrusion-opacity',
        Math.min(0.95, rise * 1.6)
      );
      map.setPaintProperty(SHADOW_LAYER, 'fill-opacity', 0.32 * rise);
      map.setPaintProperty(OUTLINE_LAYER, 'line-opacity', 0.7 * rise);

      const local: ExpressionSpecification = ['-', progress, ['get', 'delay']];
      map.setPaintProperty(BARS_LAYER, 'fill-extrusion-base', top);
      map.setPaintProperty(BARS_LAYER, 'fill-extrusion-height', [
        '+',
        top,
        [
          'interpolate',
          ['linear'],
          local,
          0,
          0,
          GROW * 0.6,
          BAR_M * 1.25,
          GROW,
          BAR_M,
        ],
      ]);
      map.setPaintProperty(
        BARS_LAYER,
        'fill-extrusion-opacity',
        Math.min(1, progress * 2)
      );
    };

    if (frameRef.current != null) cancelAnimationFrame(frameRef.current);

    if (target) {
      slabSource.setData({
        type: 'Feature',
        geometry: target.geometry,
        properties: {},
      } satisfies Feature);
      barsSource.setData(buildBars(target));
      progressRef.current = 0;
    }

    const clear = () => {
      slabSource.setData(EMPTY);
      barsSource.setData(EMPTY);
    };

    if (prefersReducedMotion()) {
      progressRef.current = target ? 1 : 0;
      paint(progressRef.current, 0);
      if (!target) clear();
      return;
    }

    const from = progressRef.current;
    const to = target ? 1 : 0;
    const duration = target ? REVEAL_MS : HIDE_MS;
    const start = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const progress = from + (to - from) * easeOutCubic(t);
      progressRef.current = progress;
      paint(progress, target ? now - start - duration : 0);

      if (t < 1 || target) {
        frameRef.current = requestAnimationFrame(step);
        return;
      }
      frameRef.current = null;
      clear();
    };
    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [map, isLoaded, target]);

  return null;
}
