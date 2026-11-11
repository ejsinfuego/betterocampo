import { useEffect, useRef, type CSSProperties } from 'react';
import figure, { HL } from '../../lib/hairline/ledgers.js';

type Props = {
  className?: string;
  /** Walk the figure's tour once when it first enters the viewport. */
  autoPlay?: boolean;
};

function intensityAt(t: number) {
  const [lo, mid, hi] = figure.range;
  return (
    Math.round(
      (t <= 0.5
        ? lo + (t / 0.5) * (mid - lo)
        : mid + ((t - 0.5) / 0.5) * (hi - mid)) * 1000
    ) / 1000
  );
}

export default function HairlineLedgers({
  className = '',
  autoPlay = true,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const live = liveRef.current;
    if (!stage || !live) return;

    HL.inject(document);
    stage.setAttribute('data-hairline', figure.name);
    stage.setAttribute('data-hairline-theme', 'light');

    const svg = HL.mk(
      'svg',
      { viewBox: '0 0 400 320', 'aria-hidden': 'true' },
      stage
    );

    let text: string | null = null;
    const read = {
      get textContent() {
        return text;
      },
      set textContent(value: string | null) {
        text = value == null ? '' : String(value);
        live.textContent = text;
      },
    };

    const handle = figure.mount({ stage, svg, read }, intensityAt(0.5));
    if (text === null) read.textContent = 'rest';

    let playing: { stop: () => void } | null = null;
    let io: IntersectionObserver | null = null;

    if (autoPlay) {
      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting || playing) return;
          playing = HL.tour(stage, figure.tour || HL.LAP);
        },
        { threshold: 0.45 }
      );
      io.observe(stage);
    }

    return () => {
      playing?.stop();
      io?.disconnect();
      handle.destroy();
      svg.remove();
      stage.removeAttribute('data-hairline');
      stage.removeAttribute('data-hairline-theme');
    };
  }, [autoPlay]);

  return (
    <div className={className}>
      <div
        ref={stageRef}
        role="img"
        aria-label={figure.means}
        className="w-full outline-none"
        style={
          {
            '--hairline-plate': '#ffffff',
            '--hairline-hi': '#0038a8',
            '--hairline-edge': '#005df5',
            '--hairline-mid': '#76cdff',
            '--hairline-lo': '#d1ecff',
            '--hairline-stroke': '1.05',
          } as CSSProperties
        }
        tabIndex={0}
      >
        <span
          ref={liveRef}
          data-hairline-live=""
          className="sr-only"
          aria-live="polite"
        />
      </div>
    </div>
  );
}
