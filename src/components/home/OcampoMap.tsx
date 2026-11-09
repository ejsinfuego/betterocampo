import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ocampo-map.css';
import {
  ocampoPlaces,
  OCAMPO_CENTER,
  touristSpots,
  type OcampoPlace,
} from '../../data/ocampoPlaces';

/** Same pattern as meetmehalfway: Carto Voyager only with a real key; else OSM. */
function basemapTiles() {
  const key = import.meta.env.VITE_CARTO_API_KEY?.trim();
  if (key) {
    return {
      url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(key)}`,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd' as const,
      maxZoom: 20,
    };
  }

  return {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abc' as const,
    maxZoom: 19,
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function markerIcon(place: OcampoPlace, active: boolean) {
  return L.divIcon({
    className: 'ocampo-pin-wrap',
    iconSize: [44, 52],
    iconAnchor: [22, 50],
    popupAnchor: [0, -42],
    html: `
      <span class="ocampo-pin${active ? ' is-active' : ''}" style="color:${place.accent}">
        <span class="ocampo-pin__pulse"></span>
        <span class="ocampo-pin__bubble" style="background:${place.accent}">
          <span aria-hidden="true">${place.emoji}</span>
        </span>
        <span class="ocampo-pin__tail" style="background:${place.accent}"></span>
      </span>
    `,
  });
}

function popupHtml(place: OcampoPlace) {
  const placeLine =
    place.barangay.includes(',') || place.barangay.includes('Tigaon')
      ? escapeHtml(place.barangay)
      : `Brgy. ${escapeHtml(place.barangay)}`;
  const approx =
    place.precision === 'approximate'
      ? `<p class="ocampo-popup__approx">Approximate pin</p>`
      : '';

  return `
    <div class="ocampo-popup__card">
      <div class="ocampo-popup__eyebrow">
        <span aria-hidden="true">${place.emoji}</span>
        ${place.kind === 'center' ? 'Town hub' : 'Must-see stop'}
      </div>
      <p class="ocampo-popup__title">${escapeHtml(place.name)}</p>
      <p class="ocampo-popup__blurb">${escapeHtml(place.blurb)}</p>
      <p class="ocampo-popup__meta">${placeLine}</p>
      ${approx}
    </div>
  `;
}

type OcampoMapProps = {
  activeId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
};

export default function OcampoMap({
  activeId = null,
  onSelect,
  className = '',
}: OcampoMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const trailRef = useRef<L.Polyline | null>(null);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
      zoomAnimation: true,
    }).setView([OCAMPO_CENTER.lat, OCAMPO_CENTER.lng], 12);

    containerRef.current.classList.add('ocampo-map');

    const tiles = basemapTiles();
    L.tileLayer(tiles.url, {
      attribution: tiles.attribution,
      maxZoom: tiles.maxZoom,
      subdomains: tiles.subdomains,
    }).addTo(map);

    const bounds = L.latLngBounds([]);

    trailRef.current = L.polyline(
      touristSpots.map(spot => [spot.lat, spot.lng] as [number, number]),
      {
        color: '#005df5',
        weight: 2.5,
        opacity: 0.35,
        dashArray: '6 10',
        lineCap: 'round',
        interactive: false,
      }
    ).addTo(map);

    for (const place of ocampoPlaces) {
      const marker = L.marker([place.lat, place.lng], {
        icon: markerIcon(place, false),
        title: place.name,
        riseOnHover: true,
      }).addTo(map);

      marker.bindPopup(popupHtml(place), {
        className: 'ocampo-popup',
        maxWidth: 260,
        closeButton: true,
      });

      marker.on('click', () => onSelectRef.current?.(place.id));
      markersRef.current[place.id] = marker;
      bounds.extend([place.lat, place.lng]);
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.2));
    }

    mapRef.current = map;

    const resize = () => map.invalidateSize({ animate: false });
    window.setTimeout(resize, 80);
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    if (containerRef.current && observer) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer?.disconnect();
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
      trailRef.current = null;
    };
  }, []);

  useEffect(() => {
    for (const place of ocampoPlaces) {
      const marker = markersRef.current[place.id];
      if (!marker) continue;
      marker.setIcon(markerIcon(place, place.id === activeId));
      marker.setZIndexOffset(place.id === activeId ? 1000 : 0);
    }

    const map = mapRef.current;
    if (!map || !activeId) return;
    const place = ocampoPlaces.find(item => item.id === activeId);
    const marker = markersRef.current[activeId];
    if (!place || !marker) return;

    map.flyTo([place.lat, place.lng], Math.max(map.getZoom(), 14), {
      duration: 0.85,
    });
    window.setTimeout(() => marker.openPopup(), 280);
  }, [activeId]);

  return (
    <div
      ref={containerRef}
      className={`h-full w-full ${className}`}
      role="presentation"
    />
  );
}
