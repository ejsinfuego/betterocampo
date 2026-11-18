import { useMemo, useState } from 'react';
import OcampoMap from '../home/OcampoMap';
import { DENSITY_STOPS } from '../../data/ocampoBarangays';
import ProjectBudgetCard from './ProjectBudgetCard';
import ProjectSidebar from './ProjectSidebar';
import {
  budgetBarCount,
  parseNationalProjects,
  projectsByBarangay,
} from './nationalProjects';

const pesos = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

function money(amount: number | null): string {
  return amount == null ? '—' : pesos.format(amount);
}

export default function ProjectsMap({ markdown }: { markdown: string }) {
  const projects = useMemo(() => parseNationalProjects(markdown), [markdown]);
  const groups = useMemo(() => projectsByBarangay(projects), [projects]);
  const unpinned = useMemo(
    () => projects.filter(project => project.barangays.length === 0),
    [projects]
  );
  const pins = useMemo(
    () =>
      groups.map(([name, lines]) => ({
        id: name,
        name,
        count: lines.length,
      })),
    [groups]
  );
  const linesByName = useMemo(() => Object.fromEntries(groups), [groups]);
  const [active, setActive] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const selected =
    groups.find(([name]) => name === active)?.[1] ?? (active ? [] : null);
  const chosen = [...(selected ?? [])].sort(
    (a, b) => b.year - a.year || (b.amount ?? 0) - (a.amount ?? 0)
  );
  const chosenProject =
    chosen.find(project => project.id === projectId) ?? chosen[0] ?? null;
  const liftBars = useMemo(() => {
    const units = Object.fromEntries(
      groups.map(([name, lines]) => [name, budgetBarCount(lines)])
    );
    if (active && chosenProject) {
      units[active] = budgetBarCount([chosenProject]);
    }
    return units;
  }, [active, chosenProject, groups]);

  const close = () => setActive(null);

  const toggle = (name: string | null) => {
    if (!name) {
      setActive(null);
      return;
    }
    setActive(current => (current === name ? null : name));
  };

  const openBarangay = (name: string) => setActive(name);

  return (
    <section aria-labelledby="projects-map-heading">
      <p className="text-xs font-semibold tracking-wide text-primary-700 uppercase">
        On the map
      </p>
      <h2
        id="projects-map-heading"
        className="mt-2 text-2xl tracking-tight text-gray-950 sm:text-3xl"
      >
        Where those lines name a barangay
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base">
        {projects.length} lines are in the tables below.{' '}
        {projects.length - unpinned.length} name a barangay, and the number on
        each pin is how many. Hover a barangay to preview it. Tap a pin to open
        the record. That barangay stays lifted, with one bar per ₱1 million of
        the line you choose. Shading shows how many people live in each square
        kilometer. Right-click and drag, or use two fingers, to tilt and turn.
      </p>

      <div className="relative z-0 isolate mt-6 flex flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)]">
        <div className="relative h-[400px] sm:h-[480px] lg:h-[560px]">
          <OcampoMap
            activeId={active}
            onSelect={toggle}
            pins={pins}
            padForFacts={false}
            onBarangayClick={toggle}
            liftBars={liftBars}
            hoverCard={stats => (
              <ProjectBudgetCard
                name={stats.name}
                lines={
                  stats.name === active && chosenProject
                    ? [chosenProject]
                    : (linesByName[stats.name] ?? [])
                }
              />
            )}
          />
          <ProjectSidebar
            open={active != null}
            name={active}
            lines={selected ?? []}
            onClose={close}
            onOpenBarangay={openBarangay}
            projectId={projectId}
            onChoose={setProjectId}
          />
        </div>

        <div className="border-t border-gray-100 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap gap-2">
            {groups.map(([name, lines]) => {
              const pressed = active === name;
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => toggle(name)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    pressed
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-primary-300 hover:bg-white hover:text-primary-700'
                  }`}
                >
                  {name}
                  <span className={pressed ? 'text-white/80' : 'text-gray-400'}>
                    {lines.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="border-t border-gray-100 px-4 py-4 text-sm text-gray-600 sm:px-5">
          {active
            ? `${active} is open in the panel. Choose a line there for the full record.`
            : 'Tap a pin or a barangay to open its record.'}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 text-xs text-gray-500 sm:px-5">
          <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-2.5 w-14 rounded-sm"
                style={{
                  background: `linear-gradient(to right, ${DENSITY_STOPS.map(([, color]) => color).join(', ')})`,
                }}
              />
              People per km² (2020)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="grid size-4 place-items-center rounded-full bg-primary-600 text-[9px] font-bold text-white">
                3
              </span>
              Budget lines in that barangay
            </span>
            <span>Each bar on hover is ₱1 million</span>
          </span>
          <a
            href="https://data.humdata.org/dataset/cod-ab-phl"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary-700 hover:underline"
          >
            Barangay boundaries
          </a>
        </div>
      </div>

      {unpinned.length > 0 ? (
        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          {unpinned.length === 1
            ? 'One line names'
            : `${unpinned.length} lines name`}{' '}
          Ocampo and no barangay, so{' '}
          {unpinned.length === 1 ? 'it has' : 'they have'} no pin:{' '}
          {unpinned.map((project, index) => (
            <span key={project.id}>
              {index > 0 ? '; ' : null}
              {project.line} ({project.year}, {money(project.amount)})
            </span>
          ))}
          .
        </p>
      ) : null}
    </section>
  );
}
