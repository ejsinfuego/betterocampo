import { useEffect } from 'react';
import type { MapMouseEvent } from 'maplibre-gl';
import MapHillshade from '../ui/MapHillshade';
import { Map, MapMarker, MarkerContent, useMap } from '../ui/map';
import { OCAMPO_MAP_CENTER } from '../../data/ocampoBarangayNames';
import { REPORT_MAP_STYLE } from '../../data/reportMapStyle';
import type { ReportGeo } from '../../types/report';

type Props = {
  value: ReportGeo | null;
  onChange: (geo: ReportGeo | null) => void;
};

function MapClickCapture({ onPick }: { onPick: (geo: ReportGeo) => void }) {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;
    const handleClick = (event: MapMouseEvent) => {
      onPick({ lng: event.lngLat.lng, lat: event.lngLat.lat });
    };
    map.on('click', handleClick);
    map.getCanvas().style.cursor = 'crosshair';
    return () => {
      map.off('click', handleClick);
      map.getCanvas().style.cursor = '';
    };
  }, [map, onPick]);

  return null;
}

export default function ReportLocationPicker({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-600">
          Optional: tap the map to drop a pin.
        </p>
        {value ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-sm font-semibold text-primary-700 underline decoration-primary-200 underline-offset-2"
          >
            Clear pin
          </button>
        ) : null}
      </div>
      <div className="h-56 overflow-hidden rounded-2xl border border-gray-200 sm:h-72">
        <Map
          className="h-full w-full"
          center={[OCAMPO_MAP_CENTER.lng, OCAMPO_MAP_CENTER.lat]}
          zoom={13}
          theme="light"
          styles={{ light: REPORT_MAP_STYLE, dark: REPORT_MAP_STYLE }}
        >
          <MapHillshade />
          <MapClickCapture onPick={onChange} />
          {value ? (
            <MapMarker longitude={value.lng} latitude={value.lat}>
              <MarkerContent />
            </MapMarker>
          ) : null}
        </Map>
      </div>
      {value ? (
        <p className="text-xs text-gray-500">
          Pin: {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
        </p>
      ) : null}
    </div>
  );
}
