import { useEffect, useRef } from 'react';
import { mountTerritoryMap } from '../../lib/hairline/territoryMap';

type Props = {
  className?: string;
};

export default function HairlineMap({ className = '' }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    return mountTerritoryMap(stage, canvas);
  }, []);

  return (
    <div className={className}>
      <div className="w-full mx-auto">
        <div
          ref={stageRef}
          role="img"
          aria-label="Animated map of Ocampo"
          tabIndex={0}
          className="aspect-[1024/537] min-w-[500px] touch-pan-y overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
        >
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="block h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
