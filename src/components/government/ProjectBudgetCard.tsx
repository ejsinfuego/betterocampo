import {
  PESOS_PER_BAR,
  budgetTotal,
  type NationalProject,
} from './nationalProjects';

const pesos = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

function yearSpan(lines: NationalProject[]): string {
  const years = lines.map(line => line.year);
  const first = Math.min(...years);
  const last = Math.max(...years);
  return first === last ? String(first) : `${first}–${last}`;
}

function shortPesos(amount: number): string {
  if (amount >= PESOS_PER_BAR) {
    const millions = amount / PESOS_PER_BAR;
    const text = Number.isInteger(millions)
      ? String(millions)
      : millions.toFixed(1);
    return `₱${text}M`;
  }
  return pesos.format(amount);
}

/** Hover card for a barangay on the projects map. */
export default function ProjectBudgetCard({
  name,
  lines,
}: {
  name: string;
  lines: NationalProject[];
}) {
  const total = budgetTotal(lines);
  const enacted = lines.filter(line => line.status === 'enacted');
  const proposals = lines.filter(line => line.status === 'proposal');
  const agencies = [...new Set(lines.map(line => line.agency))];
  const largest = [...lines].sort(
    (a, b) => (b.amount ?? 0) - (a.amount ?? 0)
  )[0];

  if (lines.length === 0) {
    return (
      <div
        aria-live="polite"
        className="w-56 rounded-xl border border-white/70 bg-white/95 px-2.5 py-2 text-left shadow-[0_14px_30px_-14px_rgba(15,23,42,0.6)] backdrop-blur-md"
      >
        <p className="truncate text-[13px] font-bold tracking-tight text-gray-950">
          {name}
        </p>
        <p className="mt-1 text-[11px] leading-snug text-gray-600">
          No national budget line names this barangay.
        </p>
      </div>
    );
  }

  return (
    <div
      aria-live="polite"
      className="w-60 rounded-xl border border-white/70 bg-white/95 px-2.5 py-2 text-left shadow-[0_14px_30px_-14px_rgba(15,23,42,0.6)] backdrop-blur-md"
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-[13px] font-bold tracking-tight text-gray-950">
          {name}
        </p>
        <p className="shrink-0 text-[10px] font-semibold text-gray-500">
          {lines.length} {lines.length === 1 ? 'line' : 'lines'}
        </p>
      </div>

      <p className="mt-0.5 text-lg leading-tight font-bold tracking-tight text-gray-950 tabular-nums">
        {pesos.format(total)}
      </p>
      <p className="text-[10px] text-gray-500">
        {yearSpan(lines)}
        {agencies.length > 0 ? ` · ${agencies.join(', ')}` : ''}
      </p>

      {proposals.length > 0 && enacted.length > 0 ? (
        <p className="mt-0.5 text-[10px] text-gray-600">
          Enacted {shortPesos(budgetTotal(enacted))} · Proposed{' '}
          {shortPesos(budgetTotal(proposals))}
        </p>
      ) : proposals.length > 0 ? (
        <p className="mt-0.5 text-[10px] font-semibold text-primary-700">
          Proposal, not an enacted budget
        </p>
      ) : null}

      {largest ? (
        <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-gray-700">
          <span className="font-semibold text-primary-700">
            {largest.year} · {shortPesos(largest.amount ?? 0)}
            {largest.status === 'proposal' ? ' · Proposal' : ''}
          </span>{' '}
          {largest.line}
        </p>
      ) : null}
      <p className="mt-0.5 text-[10px] text-gray-400">
        Tap the pin for the full record
      </p>
    </div>
  );
}
