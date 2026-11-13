import { useEffect, useState } from 'react';
import { MapMarker, MarkerContent, useMap } from '../ui/map';
import BarangayCard, { type BarangayStats } from './BarangayCard';
import { BAR_M, LIFT_M, REVEAL_MS, SLAB_M, metersToPixels } from './liftConfig';

const CLEARANCE_PX = 44;

function usePoleHeight(latitude: number) {
  const { map } = useMap();
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!map) return;
    const update = () =>
      setHeight(
        metersToPixels(
          LIFT_M + SLAB_M + BAR_M,
          map.getZoom(),
          latitude,
          map.getPitch()
        ) + CLEARANCE_PX
      );
    const frame = requestAnimationFrame(update);
    map.on('move', update);
    return () => {
      cancelAnimationFrame(frame);
      map.off('move', update);
    };
  }, [map, latitude]);

  return height;
}

/** Upright data card on a pole above the hovered barangay's floating slab. */
export default function BarangayBillboard({
  stats,
  anchor,
}: {
  stats: BarangayStats;
  anchor: [number, number];
}) {
  const pole = usePoleHeight(anchor[1]);
  const [raised, setRaised] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setRaised(true));
    const timer = window.setTimeout(() => setSettled(true), REVEAL_MS);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <MapMarker
      longitude={anchor[0]}
      latitude={anchor[1]}
      anchor="bottom"
      className="ocampo-billboard"
    >
      <MarkerContent className="cursor-default">
        <div className="flex flex-col items-center">
          <div
            className="transition-[opacity,transform] ease-out"
            style={{
              transitionDuration: `${REVEAL_MS}ms`,
              opacity: raised ? 1 : 0,
              transform: raised ? 'none' : 'translateY(12px) scale(0.96)',
            }}
          >
            <BarangayCard stats={stats} />
          </div>
          <div
            className="w-px bg-gradient-to-b from-gray-900/70 to-gray-900/10 ease-out"
            style={{
              height: raised ? pole : 0,
              transition:
                raised && !settled ? `height ${REVEAL_MS}ms` : undefined,
            }}
          />
          <div className="size-2 rounded-full border-2 border-white bg-gray-900 shadow" />
        </div>
      </MarkerContent>
    </MapMarker>
  );
}
