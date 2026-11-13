import { createElement, useEffect, useState } from 'react';
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import {
  fetchOcampoWeather,
  type OcampoWeather,
} from '../../lib/ocampoWeather';

const REFRESH_MS = 15 * 60 * 1000;

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

export default function HeaderWeather() {
  const [weather, setWeather] = useState<OcampoWeather | null>(null);

  useEffect(() => {
    let controller = new AbortController();

    const load = () => {
      controller.abort();
      controller = new AbortController();
      const { signal } = controller;
      fetchOcampoWeather(signal)
        .then(data => {
          if (!signal.aborted) setWeather(data);
        })
        .catch(error => {
          if (!signal.aborted) console.error(error);
        });
    };

    load();
    const timer = window.setInterval(load, REFRESH_MS);
    return () => {
      window.clearInterval(timer);
      controller.abort();
    };
  }, []);

  if (!weather) return null;

  return (
    <p
      aria-live="polite"
      title={`Ocampo weather as of ${formatObservedAt(weather.observedAt)} (Open-Meteo, not an official PAGASA bulletin). Humidity ${weather.humidity}%, wind ${weather.windKph} km/h.`}
      className="inline-flex shrink-0 items-center gap-1.5 text-xs text-white"
    >
      {createElement(weatherIcon(weather.weatherCode), {
        'aria-hidden': true,
        className: 'size-3.5',
      })}
      <span className="font-semibold">{weather.temperatureC}°C</span>
      <span className="hidden font-light xl:inline">
        {weather.label} · Ocampo
      </span>
    </p>
  );
}
