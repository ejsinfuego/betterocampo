import { useEffect } from 'react';
import { useMap } from './map';

const SOURCE_ID = 'mapterhorn-dem';
const LAYER_ID = 'mapterhorn-hillshade';

/**
 * Soft terrain shading under the active basemap (Mapterhorn DEM).
 * Prefer this over full 3D terrain on pin/triage maps — markers stay readable.
 */
export default function MapHillshade({
  exaggeration = 0.4,
}: {
  exaggeration?: number;
}) {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;

    const ensure = () => {
      if (!map.getSource(SOURCE_ID)) {
        map.addSource(SOURCE_ID, {
          type: 'raster-dem',
          tiles: ['https://tiles.mapterhorn.com/{z}/{x}/{y}.webp'],
          tileSize: 512,
          encoding: 'terrarium',
          attribution:
            '<a href="https://mapterhorn.com/attribution">© Mapterhorn</a>',
        });
      }

      if (!map.getLayer(LAYER_ID)) {
        const beforeId = map
          .getStyle()
          .layers?.find(layer => layer.type === 'symbol')?.id;
        map.addLayer(
          {
            id: LAYER_ID,
            type: 'hillshade',
            source: SOURCE_ID,
            paint: {
              'hillshade-exaggeration': exaggeration,
              'hillshade-shadow-color': '#4a3f2e',
              'hillshade-highlight-color': '#ffffff',
              'hillshade-accent-color': '#6b5a3e',
            },
          },
          beforeId
        );
      } else {
        map.setPaintProperty(LAYER_ID, 'hillshade-exaggeration', exaggeration);
      }
    };

    if (map.isStyleLoaded()) ensure();
    map.on('style.load', ensure);

    return () => {
      map.off('style.load', ensure);
      if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
    };
  }, [map, exaggeration]);

  return null;
}
