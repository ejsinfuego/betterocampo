import { useEffect, useState } from 'react';
import { LngLatBounds } from 'maplibre-gl';
import type { FeatureCollection, Geometry } from 'geojson';
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
import './ocampo-map.css';

const BOUNDARY_URL = '/geo/ocampo-barangays.geojson';

type BarangayProps = {
  psgc: string;
  name: string;
  areaSqKm: number;
};

type BarangayCollection = FeatureCollection<Geometry, BarangayProps>;

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
    map.fitBounds(bounds, { padding: 28, duration: 0 });
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
  const [hovered, setHovered] = useState<BarangayProps | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(BOUNDARY_URL, { signal: controller.signal })
      .then(response => {
        if (!response.ok)
          throw new Error(`Barangay boundaries ${response.status}`);
        return response.json() as Promise<BarangayCollection>;
      })
      .then(data => {
        if (!controller.signal.aborted) setBarangays(data);
      })
      .catch(error => {
        if (controller.signal.aborted) return;
        console.error(error);
      });
    return () => controller.abort();
  }, []);

  const activePlace = ocampoPlaces.find(place => place.id === activeId) ?? null;

  return (
    <div
      className={`ocampo-map relative h-full min-h-[260px] w-full ${className}`}
    >
      <Map
        theme="light"
        center={[OCAMPO_CENTER.lng, OCAMPO_CENTER.lat]}
        zoom={11}
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
                'fill-color': '#005df5',
                'fill-opacity': 0.12,
              }}
              fillHoverPaint={{
                'fill-color': '#005df5',
                'fill-opacity': 0.32,
              }}
              linePaint={{
                'line-color': '#0052d6',
                'line-width': 1.25,
              }}
              onHover={event => {
                setHovered(event?.feature.properties ?? null);
              }}
              onClick={event => {
                setHovered(event.feature.properties);
              }}
            />
          </>
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
      {hovered ? (
        <div className="pointer-events-none absolute top-3 left-3 z-10 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-900 shadow-sm">
          {hovered.name}
          <span className="font-medium text-gray-500">
            {' '}
            · {hovered.areaSqKm} km²
          </span>
        </div>
      ) : null}
    </div>
  );
}
