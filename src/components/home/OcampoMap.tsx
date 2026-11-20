import { useEffect, useMemo, useState, type ReactNode } from 'react';
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
import { loadBarangayBoundaries } from '../../lib/barangayBoundaries';
import { labelPoint, type Area } from '../../lib/polygon';
import BarangayLift, { type LiftTarget } from './BarangayLift';
import BarangayBillboard from './BarangayBillboard';
import type { BarangayStats } from './BarangayCard';
import './ocampo-map.css';

/** Width of TownFactsPanel plus its margin, kept clear when framing the town. */
const FACTS_PANEL_PX = 264;
const PITCH = 52;
const BEARING = -14;

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

export type BarangayPin = {
  id: string;
  /** GeoJSON barangay name. */
  name: string;
  count: number;
};

type OcampoMapProps = {
  activeId?: string | null;
  onSelect?: (id: string | null) => void;
  className?: string;
  /** Count badges at barangay centers. Hides the tourist pins and route. */
  pins?: BarangayPin[];
  /** Leave room for the home facts panel when framing the town. */
  padForFacts?: boolean;
  onBarangayClick?: (name: string) => void;
  /** Replaces the population card while a barangay is hovered. */
  hoverCard?: (stats: BarangayStats) => ReactNode;
  /**
   * Bars to draw on hover, keyed by barangay name. Missing names draw none.
   * Omit this and each bar stands for 20 residents.
   */
  liftBars?: Record<string, number>;
};

const NO_PINS: BarangayPin[] = [];

function walkCoords(value: unknown, visit: (lng: number, lat: number) => void) {
  if (!Array.isArray(value) || value.length === 0) return;
  if (typeof value[0] === 'number') {
    visit(value[0] as number, value[1] as number);
    return;
  }
  for (const child of value) walkCoords(child, visit);
}

function FitBarangays({
  data,
  padForFacts,
}: {
  data: BarangayCollection;
  padForFacts: boolean;
}) {
  const { map, mapLib, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !mapLib || !isLoaded) return;
    const bounds = new mapLib.LngLatBounds();
    for (const feature of data.features) {
      const geometry = feature.geometry;
      if (geometry.type === 'GeometryCollection') continue;
      walkCoords(geometry.coordinates, (lng, lat) => {
        bounds.extend([lng, lat]);
      });
    }
    if (bounds.isEmpty()) return;
    const roomForFacts = padForFacts && map.getContainer().clientWidth >= 640;
    map.fitBounds(bounds, {
      padding: roomForFacts
        ? { top: 40, right: 56, bottom: 24, left: FACTS_PANEL_PX }
        : 28,
      duration: 0,
      pitch: PITCH,
      bearing: BEARING,
    });
    if (!roomForFacts) map.setZoom(map.getZoom() + 0.35);
  }, [data, isLoaded, map, mapLib, padForFacts]);

  return null;
}

function FlyToActive({
  activeId,
  focus,
}: {
  activeId: string | null;
  focus: { lng: number; lat: number; zoom: number } | null;
}) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded || !activeId || !focus) return;
    map.flyTo({
      center: [focus.lng, focus.lat],
      zoom: Math.max(map.getZoom(), focus.zoom),
      duration: 850,
    });
  }, [activeId, focus, isLoaded, map]);

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

function liftFromFeature(
  feature: {
    properties: BarangayProps;
    geometry: Polygon | MultiPolygon | Geometry;
  } | null,
  origin: [number, number] | null,
  liftBars?: Record<string, number>
): LiftTarget | null {
  if (!feature) return null;
  const { geometry } = feature;
  if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') {
    return null;
  }
  const area = geometry;
  return {
    psgc: feature.properties.psgc,
    population: feature.properties.population,
    areaSqKm: feature.properties.areaSqKm,
    geometry: area,
    origin: origin ?? labelPoint(area),
    barCount:
      liftBars == null ? undefined : (liftBars[feature.properties.name] ?? 0),
  };
}

function ProjectPin({
  pin,
  active,
  onSelect,
}: {
  pin: BarangayPin & { lng: number; lat: number };
  active: boolean;
  onSelect?: (id: string | null) => void;
}) {
  return (
    <MapMarker
      longitude={pin.lng}
      latitude={pin.lat}
      anchor="center"
      onClick={event => {
        event.stopPropagation();
        onSelect?.(pin.id);
      }}
    >
      <MarkerContent>
        <span
          className={`grid h-8 min-w-8 place-items-center rounded-full border px-1.5 text-xs font-bold shadow-sm ${
            active
              ? 'border-primary-600 bg-primary-600 text-white ring-4 ring-primary-600/20'
              : 'border-primary-200 bg-white text-primary-700'
          }`}
        >
          {pin.count}
        </span>
      </MarkerContent>
    </MapMarker>
  );
}

export default function OcampoMap({
  activeId = null,
  onSelect,
  className = '',
  pins = NO_PINS,
  padForFacts = true,
  onBarangayClick,
  hoverCard,
  liftBars,
}: OcampoMapProps) {
  const [barangays, setBarangays] = useState<BarangayCollection | null>(null);
  const [hovered, setHovered] = useState<{
    psgc: string;
    origin: [number, number];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadBarangayBoundaries()
      .then(data => {
        if (cancelled) return;
        setBarangays(
          withPopulation(data as FeatureCollection<Geometry, RawBarangayProps>)
        );
      })
      .catch(error => {
        if (!cancelled) console.error(error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const showPlaces = pins.length === 0;
  const activePlace = showPlaces
    ? (ocampoPlaces.find(place => place.id === activeId) ?? null)
    : null;

  const painted = useMemo(() => {
    if (!barangays) return null;
    const counts: Record<string, number> = {};
    for (const pin of pins) counts[pin.name] = pin.count;
    return {
      ...barangays,
      features: barangays.features.map(feature => ({
        ...feature,
        properties: {
          ...feature.properties,
          projectCount: counts[feature.properties.name] ?? 0,
        },
      })),
    };
  }, [barangays, pins]);

  const pinPositions = useMemo(() => {
    if (!painted) return [];
    return pins.flatMap(pin => {
      const feature = painted.features.find(
        item => item.properties.name === pin.name
      );
      const geometry = feature?.geometry;
      if (
        !geometry ||
        (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')
      ) {
        return [];
      }
      const [lng, lat] = labelPoint(geometry);
      return [{ ...pin, lng, lat }];
    });
  }, [painted, pins]);

  const placeFocus = useMemo(() => {
    if (!showPlaces || !activeId) return null;
    const place = ocampoPlaces.find(item => item.id === activeId);
    return place ? { lng: place.lng, lat: place.lat, zoom: 14 } : null;
  }, [activeId, showPlaces]);

  const barangayFocus = useMemo(() => {
    if (showPlaces || !activeId || !painted) return null;
    const feature = painted.features.find(
      item => item.properties.name === activeId
    );
    const geometry = feature?.geometry;
    if (
      !geometry ||
      (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')
    ) {
      return null;
    }
    const [lng, lat] = labelPoint(geometry);
    return { lng, lat, zoom: 13 };
  }, [activeId, painted, showPlaces]);

  const focus = showPlaces ? placeFocus : barangayFocus;

  const hoveredFeature = useMemo(
    () =>
      hovered
        ? (painted?.features.find(
            feature => feature.properties.psgc === hovered.psgc
          ) ?? null)
        : null,
    [painted, hovered]
  );

  /** On the projects map, the open barangay keeps the lift after the pointer leaves. */
  const activeFeature = useMemo(() => {
    if (showPlaces || !activeId || !painted) return null;
    return (
      painted.features.find(feature => feature.properties.name === activeId) ??
      null
    );
  }, [activeId, painted, showPlaces]);

  const liftFeature = activeFeature ?? hoveredFeature;

  const pinnedLift = useMemo(
    () => liftFromFeature(activeFeature, null, liftBars),
    [activeFeature, liftBars]
  );
  const hoverLift = useMemo(
    () => liftFromFeature(hoveredFeature, hovered?.origin ?? null, liftBars),
    [hovered, hoveredFeature, liftBars]
  );
  const liftTarget = pinnedLift ?? hoverLift;

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
        {painted ? (
          <>
            <FitBarangays data={painted} padForFacts={padForFacts} />
            <MapGeoJSON<BarangayProps & { projectCount: number }>
              id="ocampo-barangays"
              data={painted}
              promoteId="psgc"
              interactive
              fillPaint={{
                'fill-color': densityFill as never,
                'fill-opacity': 0.55,
              }}
              fillHoverPaint={{
                'fill-opacity': 0.75,
              }}
              linePaint={
                pins.length > 0
                  ? {
                      'line-color': [
                        'case',
                        ['==', ['get', 'name'], activeId ?? ''],
                        '#1e3a8a',
                        ['>', ['get', 'projectCount'], 0],
                        '#2563eb',
                        '#ffffff',
                      ] as never,
                      'line-width': [
                        'case',
                        ['==', ['get', 'name'], activeId ?? ''],
                        3,
                        ['>', ['get', 'projectCount'], 0],
                        2,
                        1.25,
                      ] as never,
                    }
                  : {
                      'line-color': '#ffffff',
                      'line-width': 1.25,
                    }
              }
              onHover={selectBarangay}
              onClick={event => {
                selectBarangay(event);
                if (event) onBarangayClick?.(event.feature.properties.name);
              }}
            />
            <BarangayLift target={liftTarget} />
          </>
        ) : null}
        {liftFeature && billboardAnchor ? (
          <BarangayBillboard
            key={liftFeature.properties.psgc}
            stats={liftFeature.properties}
            anchor={billboardAnchor}
          >
            {hoverCard?.(liftFeature.properties)}
          </BarangayBillboard>
        ) : null}
        {showPlaces ? (
          <MapRoute
            coordinates={touristSpots.map(spot => [spot.lng, spot.lat])}
            color="#005df5"
            width={2.5}
            opacity={0.35}
            dashArray={[1.5, 2]}
            interactive={false}
          />
        ) : null}
        <FlyToActive activeId={activeId ?? null} focus={focus} />
        {showPlaces
          ? ocampoPlaces.map(place => (
              <PlacePin
                key={place.id}
                place={place}
                active={place.id === activePlace?.id}
                onSelect={onSelect}
              />
            ))
          : pinPositions.map(pin =>
              liftFeature?.properties.name === pin.name ? null : (
                <ProjectPin
                  key={pin.id}
                  pin={pin}
                  active={pin.id === activeId}
                  onSelect={onSelect}
                />
              )
            )}
      </Map>
    </div>
  );
}
