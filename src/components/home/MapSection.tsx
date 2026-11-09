import { createElement, useEffect, useState } from 'react';
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  Droplets,
  ExternalLink,
  MapPin,
  Sun,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import {
  fetchOcampoWeather,
  type OcampoWeather,
} from '../../lib/ocampoWeather';
import { OCAMPO_CENTER, touristSpots } from '../../data/ocampoPlaces';
import OcampoMap from './OcampoMap';

const OSM_LINK = `https://www.openstreetmap.org/?mlat=${OCAMPO_CENTER.lat}&mlon=${OCAMPO_CENTER.lng}#map=12/${OCAMPO_CENTER.lat}/${OCAMPO_CENTER.lng}`;
const GOOGLE_LINK = `https://www.google.com/maps/search/?api=1&query=${OCAMPO_CENTER.lat},${OCAMPO_CENTER.lng}`;

function weatherIcon(code: number): LucideIcon {
  if (code === 0 || code === 1) return Sun;
  if (code === 2 || code === 3) return Cloud;
  if (code === 45 || code === 48) return CloudFog;
  if (code >= 51 && code <= 67) return CloudRain;
  if (code >= 80 && code <= 82) return CloudRain;
  if (code >= 95) return CloudLightning;
  return Cloud;
}

function formatObservedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function MapSection() {
  const [weather, setWeather] = useState<OcampoWeather | null>(null);
  const [weatherError, setWeatherError] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchOcampoWeather(controller.signal)
      .then(data => {
        if (controller.signal.aborted) return;
        setWeather(data);
        setWeatherError(false);
        setWeatherLoading(false);
      })
      .catch(error => {
        if (controller.signal.aborted) return;
        console.error(error);
        setWeatherError(true);
        setWeatherLoading(false);
      });

    return () => controller.abort();
  }, []);

  const weatherIconComponent = weather
    ? weatherIcon(weather.weatherCode)
    : Cloud;

  return (
    <section className="relative" aria-labelledby="map-heading">
      <div className="relative mx-auto w-full max-w-7xl px-4 pt-4 pb-10 sm:px-6 sm:pt-6 sm:pb-14 lg:px-8">
        <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:gap-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-primary-700 uppercase">
              Location & weather
            </p>
            <h2
              id="map-heading"
              className="mt-2 text-3xl tracking-tight text-gray-950 sm:text-4xl"
            >
              Find Ocampo on the map
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
              Town center, live weather, and tourist stops pinned from public
              map records—tap a pill to zoom in.
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

        <div className="mt-8 grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <div className="relative z-0 isolate flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] sm:min-h-[380px] lg:min-h-0">
            <OcampoMap
              activeId={activeId}
              onSelect={setActiveId}
              className="min-h-[260px] flex-1"
            />
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
              <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-primary-600" />
                  Municipal center
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-emerald-700" />
                  Tourist spots
                </span>
              </span>
              <a
                href={OSM_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary-700 hover:underline"
              >
                Larger map
              </a>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl border border-gray-200/90 bg-white/90 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] backdrop-blur-sm sm:p-6">
            <div aria-live="polite">
              <p className="text-[11px] font-medium tracking-wide text-gray-500 uppercase">
                Live weather · Ocampo
              </p>

              {weatherLoading ? (
                <p className="mt-6 text-sm text-gray-500">
                  Loading conditions…
                </p>
              ) : weatherError || !weather ? (
                <p className="mt-6 text-sm text-gray-500">
                  Weather is unavailable right now. Try again in a moment.
                </p>
              ) : (
                <>
                  <div className="mt-4 flex items-start gap-4">
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-600/10 text-primary-700">
                      {createElement(weatherIconComponent, {
                        className: 'size-7',
                      })}
                    </span>
                    <div>
                      <p className="text-4xl font-bold tracking-tight text-gray-950">
                        {weather.temperatureC}°
                        <span className="text-xl font-semibold text-gray-500">
                          C
                        </span>
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-700">
                        {weather.label}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        As of {formatObservedAt(weather.observedAt)} ·
                        Asia/Manila
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5">
                      <p className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 uppercase">
                        <Droplets className="size-3.5" />
                        Humidity
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-950">
                        {weather.humidity}%
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5">
                      <p className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 uppercase">
                        <Wind className="size-3.5" />
                        Wind
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-950">
                        {weather.windKph}{' '}
                        <span className="text-sm font-semibold text-gray-500">
                          km/h
                        </span>
                      </p>
                    </div>
                  </div>
                </>
              )}

              <p className="mt-4 text-[11px] leading-relaxed text-gray-400">
                Conditions from Open-Meteo for coordinates {OCAMPO_CENTER.lat}
                °N, {OCAMPO_CENTER.lng}°E. Not an official PAGASA bulletin.
              </p>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-5">
              <p className="text-[11px] font-medium tracking-wide text-gray-500 uppercase">
                Tourist spots
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {touristSpots.map(spot => {
                  const active = activeId === spot.id;
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
                      <span aria-hidden="true">{spot.emoji}</span>
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
              <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
                Tap a pill to fly to its pin. “Approx” means barangay-level
                only—no exact OSM pin yet. Hours and fees stay local.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
