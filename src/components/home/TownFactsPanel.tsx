import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { municipalityFacts } from '../../data/ocampoFacts';
import { cn } from '../../lib/utils';

/** Glass panel over the map with the seal and the town's headline facts. */
export default function TownFactsPanel({ className }: { className?: string }) {
  const [open, setOpen] = useState(
    () => window.matchMedia('(min-width: 640px)').matches
  );

  return (
    <section
      aria-label="Ocampo at a glance"
      className={cn(
        'w-[min(15rem,calc(100%-1.5rem))] rounded-2xl border border-white/70 bg-white/80 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.45)] backdrop-blur-md',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
        aria-controls="town-facts"
        className="flex w-full items-center gap-3 rounded-2xl p-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
      >
        <img
          src="/logos/png/BetterOcampo-Seal.png"
          alt=""
          className="size-10 shrink-0 drop-shadow-[0_8px_14px_rgba(0,56,168,0.22)]"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold tracking-tight text-gray-950">
            Ocampo at a glance
          </span>
          <span className="block truncate text-[11px] text-gray-600">
            Camarines Sur, Bicol Region
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'size-4 shrink-0 text-gray-500 transition-transform duration-200',
            open ? 'rotate-180' : ''
          )}
        />
      </button>

      {open ? (
        <dl
          id="town-facts"
          className="animate-in fade-in-0 slide-in-from-bottom-1 divide-y divide-gray-200/70 border-t border-gray-200/70 px-3 py-1 duration-200"
        >
          {municipalityFacts.map(fact => (
            <div
              key={fact.label}
              className="flex items-center justify-between gap-3 py-1.5"
            >
              <dt className="min-w-0">
                <span className="block text-[11px] font-semibold text-gray-700">
                  {fact.label}
                </span>
                <span className="block text-[10px] leading-snug text-gray-500">
                  {fact.note}
                </span>
              </dt>
              <dd className="shrink-0 text-sm font-bold text-primary-900 tabular-nums">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
