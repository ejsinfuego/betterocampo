import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { budgetTotal, type NationalProject } from './nationalProjects';

const pesos = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

function money(amount: number | null): string {
  return amount == null ? '—' : pesos.format(amount);
}

function byRecent(a: NationalProject, b: NationalProject) {
  return b.year - a.year || (b.amount ?? 0) - (a.amount ?? 0);
}

function ProjectDetail({ project }: { project: NationalProject }) {
  const enacted = project.status === 'enacted';

  return (
    <article className="rounded-xl border border-gray-200 bg-gray-50/80 p-3">
      <p className="text-[11px] font-semibold tracking-wide text-primary-700 uppercase">
        {enacted ? `Enacted ${project.year}` : `FY${project.year} proposal`}
        {' · '}
        {project.agency}
      </p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-gray-950 tabular-nums">
        {money(project.amount)}
      </p>
      {project.detail ? (
        <p className="mt-1 text-xs font-semibold text-gray-700">
          {project.detail}
        </p>
      ) : null}
      <p className="mt-2 text-sm leading-relaxed text-gray-800">
        {project.line}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-gray-500">
        {enacted
          ? 'This is the amount that year’s national budget assigned to the line. It is not a report that the work was finished.'
          : 'This is a House bill figure. It is not an enacted budget.'}
      </p>
      {project.barangays.length > 0 ? (
        <p className="mt-2 text-xs text-gray-600">
          Named in {project.barangays.join(', ')}
        </p>
      ) : (
        <p className="mt-2 text-xs text-gray-600">
          Names Ocampo and no barangay, so it has no pin.
        </p>
      )}
      {project.href ? (
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-semibold text-primary-700 hover:underline"
        >
          Read this line on budget.bettergov.ph
        </a>
      ) : null}
    </article>
  );
}

export default function ProjectSidebar({
  open,
  name,
  lines,
  onClose,
  onOpenBarangay,
  projectId,
  onChoose,
}: {
  open: boolean;
  name: string | null;
  lines: NationalProject[];
  onClose: () => void;
  onOpenBarangay: (name: string) => void;
  projectId: string | null;
  onChoose: (id: string) => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const sorted = [...lines].sort(byRecent);
  const chosen =
    sorted.find(project => project.id === projectId) ?? sorted[0] ?? null;
  const total = budgetTotal(lines);
  const enactedTotal = budgetTotal(
    lines.filter(project => project.status === 'enacted')
  );
  const proposalTotal = budgetTotal(
    lines.filter(project => project.status === 'proposal')
  );

  useEffect(() => {
    if (open && !wasOpen.current) closeRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <aside
      inert={!open}
      aria-hidden={!open}
      aria-labelledby={titleId}
      className={`absolute inset-y-0 right-0 z-20 flex w-full max-w-sm flex-col border-l border-gray-200 bg-white shadow-[-12px_0_30px_-18px_rgba(15,23,42,0.35)] transition-transform duration-300 ease-out motion-reduce:transition-none ${
        open ? 'translate-x-0' : 'pointer-events-none translate-x-full'
      }`}
    >
      <header className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-wide text-primary-700 uppercase">
            Project record
          </p>
          <h3
            id={titleId}
            className="truncate text-lg font-bold tracking-tight text-gray-950"
          >
            {name ?? 'Projects'}
          </h3>
          {lines.length > 0 ? (
            <p className="mt-0.5 text-xs text-gray-500">
              {lines.length} {lines.length === 1 ? 'line' : 'lines'} ·{' '}
              {money(total)}
              {proposalTotal > 0 && enactedTotal > 0
                ? ` · enacted ${money(enactedTotal)}`
                : ''}
            </p>
          ) : null}
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close project record"
          className="grid size-8 shrink-0 place-items-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {lines.length === 0 ? (
          <p className="text-sm leading-relaxed text-gray-600">
            No national budget line names {name}.
          </p>
        ) : (
          <>
            {chosen ? <ProjectDetail project={chosen} /> : null}
            {sorted.length > 1 ? (
              <ul className="mt-3 space-y-1">
                {sorted.map(project => {
                  const pressed = project.id === chosen?.id;
                  return (
                    <li key={project.id}>
                      <button
                        type="button"
                        aria-pressed={pressed}
                        onClick={() => onChoose(project.id)}
                        className={`w-full rounded-lg px-2.5 py-2 text-left ${
                          pressed
                            ? 'bg-primary-50 text-primary-900'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="block text-[11px] font-semibold text-primary-700">
                          {project.year} · {project.agency} ·{' '}
                          {money(project.amount)}
                          {project.status === 'proposal' ? ' · Proposal' : ''}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-gray-700">
                          {project.line}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
            {chosen && chosen.barangays.length > 1 ? (
              <div className="mt-3">
                <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                  Also on the map
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {chosen.barangays
                    .filter(barangay => barangay !== name)
                    .map(barangay => (
                      <button
                        key={barangay}
                        type="button"
                        onClick={() => onOpenBarangay(barangay)}
                        className="rounded-full border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:border-primary-300 hover:text-primary-700"
                      >
                        {barangay}
                      </button>
                    ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </aside>
  );
}
