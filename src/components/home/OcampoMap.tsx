import { useEffect, useMemo, useState } from 'react';
import { LngLatBounds } from 'maplibre-gl';
import type {
  FeatureCollection,
  Geometry,
  MultiPolygon,
  Polygon,
} from 'geojson';
import {
  Map,
  MapControls,
  MapGeoJSON,
  MapMarker,
  MapPopup,
  MapRoute,
  MarkerContent,
  useMap,
} from '../ui/map';
import {
  ocampoPlaces,
  OCAMPO_CENTER,
  touristSpots,
  type OcampoPlace,
} from '../../data/ocampoPlaces';
import { barangayPopulation, DENSITY_STOPS } from '../../data/ocampoBarangays';
import { labelPoint, type Area } from '../../lib/polygon';
import BarangayLift, { type LiftTarget } from './BarangayLift';
import BarangayBillboard from './BarangayBillboard';
import type { BarangayStats } from './BarangayCard';
import './ocampo-map.css';

/** Width of TownFactsPanel plus its margin, kept clear when framing the town. */
const FACTS_PANEL_PX = 264;
const PITCH = 52;
const BEARING = -14;

const BOUNDARY_URL = '/geo/ocampo-barangays.geojson';

type RawBarangayProps = {
  psgc: string;
  name: string;
  areaSqKm: number;
};

type BarangayProps = BarangayStats;

type BarangayCollection = FeatureCollection<Geometry, BarangayProps>;

function withPopulation(
  data: FeatureCollection<Geometry, RawBarangayProps>
): BarangayCollection {
  return {
    ...data,
    features: data.features.map(feature => {
      const stats = barangayPopulation[feature.properties.psgc];
      const population = stats?.pop2020 ?? 0;
      return {
        ...feature,
        properties: {
          ...feature.properties,
          population,
          pop2015: stats?.pop2015 ?? 0,
          density:
            feature.properties.areaSqKm > 0
              ? Math.round(population / feature.properties.areaSqKm)
              : 0,
        },
      };
    }),
  };
}

const densityFill = [
  'interpolate',
  ['linear'],
  ['get', 'density'],
  ...DENSITY_STOPS.flat(),
];

type OcampoMapProps = {
  activeId?: string | null;
  onSelect?: (id: string | null) => void;
  className?: string;
};

function walkCoords(value: unknown, visit: (lng: number, lat: number) => void) {
  if (!Array.isArray(value) || value.length === 0) return;
  if (typeof value[0] === 'number') {
    visit(value[0] as number, value[1] as number);
    return;
  }
  for (const child of value) walkCoords(child, visit);
}

function FitBarangays({ data }: { data: BarangayCollection }) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;
    const bounds = new LngLatBounds();
    for (const feature of data.features) {
      const geometry = feature.geometry;
      if (geometry.type === 'GeometryCollection') continue;
      walkCoords(geometry.coordinates, (lng, lat) => {
        bounds.extend([lng, lat]);
      });
    }
    if (bounds.isEmpty()) return;
    const roomForFacts = map.getContainer().clientWidth >= 640;
    map.fitBounds(bounds, {
      padding: roomForFacts
        ? { top: 40, right: 56, bottom: 24, left: FACTS_PANEL_PX }
        : 28,
      duration: 0,
      pitch: PITCH,
      bearing: BEARING,
    });
    if (!roomForFacts) map.setZoom(map.getZoom() + 0.35);
  }, [data, isLoaded, map]);

  return null;
}

function FlyToActive({ activeId }: { activeId: string | null }) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded || !activeId) return;
    const place = ocampoPlaces.find(item => item.id === activeId);
    if (!place) return;
    map.flyTo({
      center: [place.lng, place.lat],
      zoom: Math.max(map.getZoom(), 14),
      duration: 850,
    });
  }, [activeId, isLoaded, map]);

  return null;
}

function PlacePin({
  place,
  active,
  onSelect,
}: {
  place: OcampoPlace;
  active: boolean;
  onSelect?: (id: string | null) => void;
}) {
  const Icon = place.icon;
  const placeLine =
    place.barangay.includes(',') || place.barangay.includes('Tigaon')
      ? place.barangay
      : `Brgy. ${place.barangay}`;

  return (
    <>
      <MapMarker
        longitude={place.lng}
        latitude={place.lat}
        anchor="center"
        onClick={() => onSelect?.(place.id)}
      >
        <MarkerContent>
          <span
            className={`grid size-8 place-items-center rounded-full border shadow-sm ${
              place.kind === 'center'
                ? active
                  ? 'border-primary-600 bg-primary-600 text-white ring-4 ring-primary-600/15'
                  : 'border-primary-200 bg-white text-primary-600'
                : active
                  ? 'border-emerald-700 bg-emerald-700 text-white ring-4 ring-emerald-700/15'
                  : 'border-emerald-200 bg-white text-emerald-700'
            }`}
          >
            <Icon aria-hidden="true" className="size-4" strokeWidth={2} />
          </span>
        </MarkerContent>
      </MapMarker>
      {active ? (
        <MapPopup
          longitude={place.lng}
          latitude={place.lat}
          offset={22}
          closeButton
          focusAfterOpen={false}
          onClose={() => onSelect?.(null)}
          className="ocampo-popup__card max-w-64"
        >
          <p className="ocampo-popup__eyebrow">
            <Icon aria-hidden="true" className="size-3.5" strokeWidth={2} />
            {place.kind === 'center' ? 'Town hub' : 'Must-see stop'}
          </p>
          <p className="ocampo-popup__title">{place.name}</p>
          <p className="ocampo-popup__blurb">{place.blurb}</p>
          <p className="ocampo-popup__meta">{placeLine}</p>
          {place.precision === 'approximate' ? (
            <p className="ocampo-popup__approx">Approximate pin</p>
          ) : null}
        </MapPopup>
      ) : null}
    </>
  );
}

export default function OcampoMap({
  activeId = null,
  onSelect,
  className = '',
}: OcampoMapProps) {
  const [barangays, setBarangays] = useState<BarangayCollection | null>(null);
  const [hovered, setHovered] = useState<{
    psgc: string;
    origin: [number, number];
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(BOUNDARY_URL, { signal: controller.signal })
      .then(response => {
        if (!response.ok)
          throw new Error(`Barangay boundaries ${response.status}`);
        return response.json() as Promise<
          FeatureCollection<Geometry, RawBarangayProps>
        >;
      })
      .then(data => {
        if (!controller.signal.aborted) setBarangays(withPopulation(data));
      })
      .catch(error => {
        if (controller.signal.aborted) return;
        console.error(error);
      });
    return () => controller.abort();
  }, []);

  const activePlace = ocampoPlaces.find(place => place.id === activeId) ?? null;

  const hoveredFeature = useMemo(
    () =>
      hovered
        ? (barangays?.features.find(
            feature => feature.properties.psgc === hovered.psgc
          ) ?? null)
        : null,
    [barangays, hovered]
  );

  const liftTarget = useMemo<LiftTarget | null>(() => {
    if (!hovered || !hoveredFeature) return null;
    const { geometry } = hoveredFeature;
    if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
      return null;
    }
    return {
      psgc: hovered.psgc,
      population: hoveredFeature.properties.population,
      areaSqKm: hoveredFeature.properties.areaSqKm,
      geometry: geometry as Polygon | MultiPolygon,
      origin: hovered.origin,
    };
  }, [hovered, hoveredFeature]);

  const billboardAnchor = useMemo(
    () => (liftTarget ? labelPoint(liftTarget.geometry as Area) : null),
    [liftTarget]
  );

  const selectBarangay = (
    event: {
      feature: { properties: BarangayProps };
      longitude: number;
      latitude: number;
    } | null
  ) => {
    setHovered(
      event
        ? {
            psgc: event.feature.properties.psgc,
            origin: [event.longitude, event.latitude],
          }
        : null
    );
  };

  return (
    <div
      className={`ocampo-map relative h-full min-h-[260px] w-full ${className}`}
    >
      <Map
        theme="light"
        center={[OCAMPO_CENTER.lng, OCAMPO_CENTER.lat]}
        zoom={11}
        pitch={PITCH}
        bearing={BEARING}
        maxPitch={70}
        scrollZoom={false}
      >
        <MapControls showZoom />
        {barangays ? (
          <>
            <FitBarangays data={barangays} />
            <MapGeoJSON<BarangayProps>
              id="ocampo-barangays"
              data={barangays}
              promoteId="psgc"
              interactive
              fillPaint={{
                'fill-color': densityFill as never,
                'fill-opacity': 0.55,
              }}
              fillHoverPaint={{
                'fill-opacity': 0.75,
              }}
              linePaint={{
                'line-color': '#ffffff',
                'line-width': 1.25,
              }}
              onHover={selectBarangay}
              onClick={selectBarangay}
            />
            <BarangayLift target={liftTarget} />
          </>
        ) : null}
        {hoveredFeature && billboardAnchor ? (
          <BarangayBillboard
            key={hoveredFeature.properties.psgc}
            stats={hoveredFeature.properties}
            anchor={billboardAnchor}
          />
        ) : null}
        <MapRoute
          coordinates={touristSpots.map(spot => [spot.lng, spot.lat])}
          color="#005df5"
          width={2.5}
          opacity={0.35}
          dashArray={[1.5, 2]}
          interactive={false}
        />
        <FlyToActive activeId={activeId ?? null} />
        {ocampoPlaces.map(place => (
          <PlacePin
            key={place.id}
            place={place}
            active={place.id === activePlace?.id}
            onSelect={onSelect}
          />
        ))}
      </Map>
    </div>
  );
}
