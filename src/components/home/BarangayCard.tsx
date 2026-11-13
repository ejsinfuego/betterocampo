import { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import {
  BARANGAY_COUNT,
  LARGEST_BARANGAY_POP,
  OCAMPO_POP_2020,
  PEOPLE_PER_DOT,
  populationRank,
} from '../../data/ocampoBarangays';
import { cn } from '../../lib/utils';

export type BarangayStats = {
  psgc: string;
  name: string;
  areaSqKm: number;
  population: number;
  pop2015: number;
  density: number;
};

const COUNT_MS = 900;
const number = new Intl.NumberFormat('en-PH');

function useCountUp(target: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const frame = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(frame);
    }
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_MS);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
}

export default function BarangayCard({ stats }: { stats: BarangayStats }) {
  const population = useCountUp(stats.population);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const share = (stats.population / OCAMPO_POP_2020) * 100;
  const change =
    stats.pop2015 > 0
      ? ((stats.population - stats.pop2015) / stats.pop2015) * 100
      : null;
  const growing = change != null && change >= 0;

  return (
    <div
      aria-live="polite"
      className="w-44 rounded-xl border border-white/70 bg-white/95 px-2.5 py-2 text-left shadow-[0_14px_30px_-14px_rgba(15,23,42,0.6)] backdrop-blur-md"
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-[13px] font-bold tracking-tight text-gray-950">
          {stats.name}
        </p>
        <p className="shrink-0 text-[10px] font-semibold text-gray-500">
          #{populationRank(stats.psgc)}/{BARANGAY_COUNT}
        </p>
      </div>

      <p className="mt-0.5 flex items-baseline gap-1">
        <span className="text-lg leading-tight font-bold tracking-tight text-gray-950 tabular-nums">
          {number.format(population)}
        </span>
        <span className="text-[10px] text-gray-500">people · 2020</span>
      </p>

      <div className="mt-1 h-1 overflow-hidden rounded-full bg-primary-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-700 transition-[width] duration-700 ease-out"
          style={{
            width: filled
              ? `${(stats.population / LARGEST_BARANGAY_POP) * 100}%`
              : '0%',
          }}
        />
      </div>

      <dl className="mt-1.5 flex items-center justify-between gap-2 text-[10px] whitespace-nowrap text-gray-500">
        <div className="flex items-center gap-1">
          <dt className="sr-only">Change since 2015</dt>
          <dd
            className={cn(
              'inline-flex items-center gap-0.5 font-semibold',
              change == null
                ? 'text-gray-500'
                : growing
                  ? 'text-emerald-700'
                  : 'text-rose-700'
            )}
          >
            {change == null ? (
              'No 2015 data'
            ) : (
              <>
                {growing ? (
                  <TrendingUp aria-hidden="true" className="size-3" />
                ) : (
                  <TrendingDown aria-hidden="true" className="size-3" />
                )}
                {growing ? '+' : ''}
                {change.toFixed(1)}% vs 2015
              </>
            )}
          </dd>
        </div>
        <div>
          <dt className="sr-only">Share of Ocampo</dt>
          <dd>{share.toFixed(1)}% of town</dd>
        </div>
      </dl>

      <p className="mt-1 text-[10px] text-gray-400">
        {number.format(stats.density)}/km² · 1 bar ≈ {PEOPLE_PER_DOT} people
      </p>
    </div>
  );
}
