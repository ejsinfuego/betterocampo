/** Open-Meteo (no API key). WMO weather interpretation codes. */

export type OcampoWeather = {
  temperatureC: number;
  humidity: number;
  windKph: number;
  weatherCode: number;
  label: string;
  observedAt: string;
};

/** Match Municipal Hall coordinates used on the home map. */
const LAT = 13.5573008;
const LNG = 123.372209;

const WEATHER_LABELS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with hail',
};

export function weatherLabel(code: number): string {
  return WEATHER_LABELS[code] ?? 'Weather update';
}

export async function fetchOcampoWeather(
  signal?: AbortSignal
): Promise<OcampoWeather> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(LAT));
  url.searchParams.set('longitude', String(LNG));
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m'
  );
  url.searchParams.set('timezone', 'Asia/Manila');
  url.searchParams.set('wind_speed_unit', 'kmh');

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) {
    throw new Error(`Weather request failed (${response.status})`);
  }

  const data = (await response.json()) as {
    current: {
      time: string;
      temperature_2m: number;
      relative_humidity_2m: number;
      weather_code: number;
      wind_speed_10m: number;
    };
  };

  const code = data.current.weather_code;
  return {
    temperatureC: Math.round(data.current.temperature_2m),
    humidity: data.current.relative_humidity_2m,
    windKph: Math.round(data.current.wind_speed_10m),
    weatherCode: code,
    label: weatherLabel(code),
    observedAt: data.current.time,
  };
}
