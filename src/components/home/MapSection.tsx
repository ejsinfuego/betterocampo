import { useState } from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import { OCAMPO_CENTER, touristSpots } from '../../data/ocampoPlaces';
import {
  BARANGAY_POPULATION_SOURCE,
  DENSITY_STOPS,
} from '../../data/ocampoBarangays';
import OcampoMap from './OcampoMap';
import TownFactsPanel from './TownFactsPanel';

const OSM_LINK = `https://www.openstreetmap.org/?mlat=${OCAMPO_CENTER.lat}&mlon=${OCAMPO_CENTER.lng}#map=12/${OCAMPO_CENTER.lat}/${OCAMPO_CENTER.lng}`;
const GOOGLE_LINK = `https://www.google.com/maps/search/?api=1&query=${OCAMPO_CENTER.lat},${OCAMPO_CENTER.lng}`;

const history: { year: string; text: string }[] = [
  {
    year: '1735',
    text: 'Franciscan friars start the Mission de Mabatobato, named for the large rocks scattered across the area, believed to come from Mt. Isarog.',
  },
  {
    year: '1800s',
    text: 'Settlers from neighboring towns arrive to farm the land, and the settlement grows.',
  },
  {
    year: 'Early 1900s',
    text: 'Under American rule, Mabatobato is annexed to the municipality of Pili.',
  },
  {
    year: '1922',
    text: 'Mabatobato becomes a parish, now St. Bernard Abbot Parish.',
  },
  {
    year: '1949',
    text: 'President Elpidio Quirino signs Executive Order No. 243 on July 15, making Mabatobato, Ayugan, Hanawan, and Moriones an independent town named Ocampo, after Don Julian Ocampo, governor of Camarines Sur in the 1930s.',
  },
];

const historySources = [
  {
    label: 'Executive Order No. 243 (Lawphil)',
    href: 'https://lawphil.net/executive/execord/eo1949/eo_243_1949.html',
  },
  {
    label: 'Wikipedia',
    href: 'https://en.wikipedia.org/wiki/Ocampo,_Camarines_Sur',
  },
  {
    label: 'The Old Churches',
    href: 'https://www.theoldchurches.com/philippines/camarines-sur/ocampo/st-bernard-abbot-church-ocampo/',
  },
];

export default function MapSection() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section className="relative" aria-labelledby="map-heading">
      <div className="relative mx-auto w-full max-w-7xl px-4 pt-4 pb-10 sm:px-6 sm:pt-6 sm:pb-14 lg:px-8">
        <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:gap-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-primary-700 uppercase">
              Tourist spots & history
            </p>
            <h2
              id="map-heading"
              className="mt-2 text-3xl tracking-tight text-gray-950 sm:text-4xl"
            >
              Ocampo on the Map
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
              Barangays shaded by how many people live in each square kilometer.
              Hover or tap a barangay to lift it off the map, with one bar for
              every 20 residents. Right-click and drag, or use two fingers, to
              tilt and turn. Tap a spot below to zoom in.
            </p>
          </div>

          <div className="flex flex-col gap-2 self-start sm:flex-row lg:self-end">
            <a
              href={OSM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
            >
              <MapPin className="size-4" />
              OpenStreetMap
              <ExternalLink className="size-3.5 opacity-80" />
            </a>
            <a
              href={GOOGLE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-gray-200/90 bg-white/80 px-5 text-sm font-semibold text-gray-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-sm hover:bg-white hover:text-primary-700"
            >
              Google Maps
              <ExternalLink className="size-3.5 opacity-70" />
            </a>
          </div>
        </div>

        <div className="relative z-0 isolate mt-8 flex flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)]">
          <div className="relative h-[400px] sm:h-[480px] lg:h-[560px]">
            <OcampoMap activeId={activeId} onSelect={setActiveId} />
            <TownFactsPanel className="absolute bottom-3 left-3 z-10" />
          </div>

          <div className="border-t border-gray-100 px-4 py-4 sm:px-5">
            <div className="flex flex-wrap gap-2">
              {touristSpots.map(spot => {
                const active = activeId === spot.id;
                const Icon = spot.icon;
                return (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={() => setActiveId(spot.id)}
                    title={`${spot.name} · ${spot.barangay}${spot.precision === 'approximate' ? ' (approximate)' : ''}`}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-primary-300 hover:bg-white hover:text-primary-700'
                    }`}
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-3.5"
                      strokeWidth={2}
                    />
                    {spot.name}
                    {spot.precision === 'approximate' ? (
                      <span
                        className={`text-[10px] font-bold tracking-wide uppercase ${active ? 'text-white/80' : 'text-gray-400'}`}
                      >
                        approx
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 text-xs text-gray-500 sm:px-5">
            <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-14 rounded-sm"
                  style={{
                    background: `linear-gradient(to right, ${DENSITY_STOPS.map(([, color]) => color).join(', ')})`,
                  }}
                />
                People per km² (2020)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-primary-600" />
                Municipal center
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-emerald-700" />
                Tourist spots
              </span>
              <span className="text-gray-400">
                “Approx” means barangay-level only, with no exact pin yet.
              </span>
            </span>
            <span className="inline-flex flex-wrap gap-x-3 gap-y-1">
              <a
                href={BARANGAY_POPULATION_SOURCE.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary-700 hover:underline"
              >
                {BARANGAY_POPULATION_SOURCE.label}
              </a>
              <a
                href="https://data.humdata.org/dataset/cod-ab-phl"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary-700 hover:underline"
              >
                Barangay boundaries
              </a>
            </span>
          </div>
        </div>

        <section
          className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] lg:gap-10"
          aria-labelledby="history-heading"
        >
          <div>
            <p className="text-xs font-semibold tracking-wide text-primary-700 uppercase">
              Brief history
            </p>
            <h3
              id="history-heading"
              className="mt-2 text-2xl tracking-tight text-gray-950 sm:text-3xl"
            >
              From Mabatobato to Ocampo
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Ocampo was a Franciscan mission long before it was a town. Dates
              that sources disagree on are left out.
            </p>
            <p className="mt-4 text-xs leading-relaxed text-gray-500">
              Sources:{' '}
              {historySources.map((source, index) => (
                <span key={source.href}>
                  {index > 0 ? ', ' : null}
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary-700 hover:underline"
                  >
                    {source.label}
                  </a>
                </span>
              ))}
            </p>
          </div>

          <ol className="border-l border-gray-200">
            {history.map(item => (
              <li key={item.year} className="relative pb-5 pl-6 last:pb-0">
                <span className="absolute top-1.5 -left-[5px] size-2.5 rounded-full bg-primary-600" />
                <p className="text-sm font-semibold text-primary-700">
                  {item.year}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-700">
                  {item.text}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </section>
  );
}
