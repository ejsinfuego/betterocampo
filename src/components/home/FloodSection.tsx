import { useEffect } from 'react';
import { Protocol } from 'pmtiles';
import type { FeatureCollection, Geometry } from 'geojson';
import { Map, MapControls, useMap } from '../ui/map';
import { OCAMPO_CENTER } from '../../data/ocampoPlaces';

const BOUNDARY_URL = '/geo/ocampo-barangays.geojson';
const FLOOD_URL =
  'https://huggingface.co/datasets/bettergovph/project-noah-hazard-maps/resolve/main/PMTiles/layers/flood_100yr.pmtiles';
const NOAH_SOURCE = 'https://data.bettergov.ph/datasets/22';
const FLOOD_SOURCE_ID = 'noah-flood-100';
const FLOOD_LAYER_ID = 'noah-flood-100-fill';
const BOUNDARY_SOURCE_ID = 'ocampo-flood-bounds';
const BOUNDARY_LAYER_ID = 'ocampo-flood-bounds-line';

const LEVELS = [
  { label: 'Low', note: 'Up to 0.5 m', color: '#eab308' },
  { label: 'Medium', note: '0.5–1.5 m', color: '#f97316' },
  { label: 'High', note: 'Over 1.5 m', color: '#dc2626' },
] as const;

let protocolReady = false;

function registerPmtiles(
  addProtocol: (protocol: string, loadFn: Protocol['tile']) => void
) {
  if (protocolReady) return;
  const protocol = new Protocol();
  addProtocol('pmtiles', protocol.tile);
  protocolReady = true;
}

function walkCoords(value: unknown, visit: (lng: number, lat: number) => void) {
  if (!Array.isArray(value) || value.length === 0) return;
  if (typeof value[0] === 'number') {
    visit(value[0] as number, value[1] as number);
    return;
  }
  for (const child of value) walkCoords(child, visit);
}

function FloodLayers() {
  const { map, mapLib, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !mapLib || !isLoaded) return;
    registerPmtiles(mapLib.addProtocol);

    const controller = new AbortController();
    let cancelled = false;

    const addFlood = () => {
      if (map.getSource(FLOOD_SOURCE_ID)) return;
      map.addSource(FLOOD_SOURCE_ID, {
        type: 'vector',
        url: `pmtiles://${FLOOD_URL}`,
      });
      map.addLayer({
        id: FLOOD_LAYER_ID,
        type: 'fill',
        source: FLOOD_SOURCE_ID,
        'source-layer': 'flood_100yr',
        paint: {
          'fill-color': [
            'match',
            ['to-number', ['get', 'Var']],
            1,
            LEVELS[0].color,
            2,
            LEVELS[1].color,
            3,
            LEVELS[2].color,
            '#94a3b8',
          ],
          'fill-opacity': 0.55,
        },
      });
    };

    const addBounds = (data: FeatureCollection<Geometry>) => {
      const bounds = new mapLib.LngLatBounds();
      for (const feature of data.features) {
        if (feature.geometry.type === 'GeometryCollection') continue;
        walkCoords(feature.geometry.coordinates, (lng, lat) => {
          bounds.extend([lng, lat]);
        });
      }
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 28, duration: 0 });
      }
      if (map.getSource(BOUNDARY_SOURCE_ID)) return;
      map.addSource(BOUNDARY_SOURCE_ID, { type: 'geojson', data });
      map.addLayer({
        id: BOUNDARY_LAYER_ID,
        type: 'line',
        source: BOUNDARY_SOURCE_ID,
        paint: {
          'line-color': '#0052d6',
          'line-width': 1.25,
        },
      });
    };

    addFlood();

    fetch(BOUNDARY_URL, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error(`Boundaries ${response.status}`);
        return response.json() as Promise<FeatureCollection<Geometry>>;
      })
      .then(data => {
        if (!cancelled) addBounds(data);
      })
      .catch(error => {
        if (controller.signal.aborted) return;
        console.error(error);
      });

    return () => {
      cancelled = true;
      controller.abort();
      if (!map.getStyle()) return;
      if (map.getLayer(BOUNDARY_LAYER_ID)) map.removeLayer(BOUNDARY_LAYER_ID);
      if (map.getLayer(FLOOD_LAYER_ID)) map.removeLayer(FLOOD_LAYER_ID);
      if (map.getSource(BOUNDARY_SOURCE_ID))
        map.removeSource(BOUNDARY_SOURCE_ID);
      if (map.getSource(FLOOD_SOURCE_ID)) map.removeSource(FLOOD_SOURCE_ID);
    };
  }, [isLoaded, map, mapLib]);

  return null;
}

export default function FloodSection() {
  return (
    <section className="relative" aria-labelledby="flood-heading">
      <div className="relative mx-auto w-full max-w-7xl px-4 pt-2 pb-10 sm:px-6 sm:pb-14 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wide text-primary-700 uppercase">
            Hazard
          </p>
          <h2
            id="flood-heading"
            className="mt-2 text-3xl tracking-tight text-gray-950 sm:text-4xl"
          >
            Flood hazard
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
            The 100-year rainfall map from PAGASA, published under Project NOAH.
            Color shows how deep the water is in that scenario. This is not a
            live flood warning.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)]">
          <Map
            theme="light"
            center={[OCAMPO_CENTER.lng, OCAMPO_CENTER.lat]}
            zoom={11}
            scrollZoom={false}
            className="h-[420px] w-full sm:h-[480px]"
          >
            <MapControls showZoom />
            <FloodLayers />
          </Map>
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
            <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
              {LEVELS.map(level => (
                <span
                  key={level.label}
                  className="inline-flex items-center gap-1.5"
                >
                  <span
                    className="size-2.5 rounded-sm"
                    style={{ background: level.color }}
                  />
                  {level.label}
                  <span className="text-gray-400">{level.note}</span>
                </span>
              ))}
            </span>
            <a
              href={NOAH_SOURCE}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary-700 hover:underline"
            >
              Project NOAH
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
