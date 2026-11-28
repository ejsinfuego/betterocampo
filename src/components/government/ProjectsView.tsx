import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  BadgeCheck,
  FileClock,
  Info,
  Layers,
  Map,
  PanelLeftClose,
  PanelLeftOpen,
  Table,
} from 'lucide-react';
import { useSearchParams } from 'react-router';
import { SurfaceCard } from '../ui/PageFrame';
import ProjectsMap from './ProjectsMap';
import ProjectsTable from './ProjectsTable';
import ProjectsIntro from './ProjectsIntro';
import {
  TOWN_WIDE,
  budgetTotal,
  formatPesos,
  parseNationalProjects,
  projectsByBarangay,
  type NationalProject,
} from './nationalProjects';

type ViewMode = 'map' | 'table';
type StatusFilter = 'all' | 'enacted' | 'proposal';

function viewFromParams(params: URLSearchParams): ViewMode {
  return params.get('view') === 'table' ? 'table' : 'map';
}

function chipClass(pressed: boolean): string {
  return `inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 ${
    pressed
      ? 'border-primary-600 bg-primary-600 text-white'
      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-primary-300 hover:bg-white hover:text-primary-700'
  }`;
}

function SegmentedChoice<T extends string>({
  name,
  label,
  value,
  onChange,
  options,
  tone,
  compact = false,
  direction = 'row',
}: {
  name: string;
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; icon?: ReactNode; count?: number }[];
  tone: 'primary' | 'quiet';
  compact?: boolean;
  direction?: 'row' | 'column';
}) {
  return (
    <fieldset className="w-fit border-0 p-0">
      <legend className="sr-only">{label}</legend>
      <div
        className={`inline-flex p-1 ${direction === 'column' ? 'flex-col' : ''} ${
          tone === 'primary'
            ? 'rounded-full bg-gray-100'
            : 'rounded-full border border-gray-200 bg-white'
        }`}
      >
        {options.map(option => {
          const nameText =
            option.count != null
              ? `${option.label} ${option.count}`
              : option.label;
          return (
            <label
              key={option.value}
              title={compact ? nameText : undefined}
              className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full font-semibold text-gray-600 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-600 has-[:focus-visible]:ring-offset-2 ${
                compact ? 'size-9' : 'px-3 py-1.5 text-sm'
              } ${
                tone === 'primary'
                  ? 'has-[:checked]:bg-primary-600 has-[:checked]:text-white'
                  : 'has-[:checked]:bg-primary-50 has-[:checked]:text-primary-900'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.icon}
              {compact ? (
                <span className="sr-only">{nameText}</span>
              ) : (
                option.label
              )}
              {!compact && option.count != null ? (
                <span className="tabular-nums opacity-80">{option.count}</span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Totals({
  status,
  enactedTotal,
  proposalTotal,
}: {
  status: StatusFilter;
  enactedTotal: number;
  proposalTotal: number;
}) {
  return (
    <p className="text-sm text-gray-600 tabular-nums">
      {status !== 'proposal' ? (
        <span className="whitespace-nowrap">
          <span className="font-semibold text-gray-950">
            {formatPesos(enactedTotal)}
          </span>{' '}
          enacted
        </span>
      ) : null}
      {status === 'all' ? <span aria-hidden="true"> · </span> : null}
      {status !== 'enacted' ? (
        <span className="whitespace-nowrap">
          <span className="font-semibold text-gray-950">
            {formatPesos(proposalTotal)}
          </span>{' '}
          proposed
        </span>
      ) : null}
    </p>
  );
}

export default function ProjectsView({
  markdown,
  layout = 'page',
}: {
  markdown: string;
  layout?: 'page' | 'stage';
}) {
  const [params, setParams] = useSearchParams();
  const mode = viewFromParams(params);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [active, setActive] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [showLabels, setShowLabels] = useState(false);

  const projects = useMemo(() => parseNationalProjects(markdown), [markdown]);
  const filtered = useMemo(() => {
    if (status === 'all') return projects;
    return projects.filter(project => project.status === status);
  }, [projects, status]);
  const groups = useMemo(() => projectsByBarangay(filtered), [filtered]);
  const unpinned = useMemo(
    () => filtered.filter(project => project.barangays.length === 0),
    [filtered]
  );
  const linesByName = useMemo(() => Object.fromEntries(groups), [groups]);
  const pins = useMemo(
    () =>
      groups.map(([name, lines]) => ({
        id: name,
        name,
        count: lines.length,
      })),
    [groups]
  );
  const sidebarLines =
    active === TOWN_WIDE ? unpinned : active ? (linesByName[active] ?? []) : [];
  const chosen = [...sidebarLines].sort(
    (a, b) => b.year - a.year || (b.amount ?? 0) - (a.amount ?? 0)
  );
  const chosenProject =
    chosen.find(project => project.id === projectId) ?? chosen[0] ?? null;

  const enactedTotal = budgetTotal(
    filtered.filter(project => project.status === 'enacted')
  );
  const proposalTotal = budgetTotal(
    filtered.filter(project => project.status === 'proposal')
  );
  const enactedCount = projects.filter(
    project => project.status === 'enacted'
  ).length;
  const proposalCount = projects.filter(
    project => project.status === 'proposal'
  ).length;

  useEffect(() => {
    if (!active) return;
    if (active === TOWN_WIDE) {
      if (unpinned.length === 0) setActive(null);
      return;
    }
    if (!groups.some(([name]) => name === active)) setActive(null);
  }, [active, groups, unpinned.length]);

  useEffect(() => {
    if (projectId && !filtered.some(project => project.id === projectId)) {
      setProjectId(null);
    }
  }, [filtered, projectId]);

  const setMode = (next: ViewMode) => {
    setParams(
      current => {
        const updated = new URLSearchParams(current);
        if (next === 'table') updated.set('view', 'table');
        else updated.delete('view');
        return updated;
      },
      { replace: true }
    );
  };

  const selectPlace = (name: string | null) => {
    setActive(name);
    setProjectId(current => {
      if (!name) return null;
      const project = projects.find(item => item.id === current);
      if (!project) return null;
      if (name === TOWN_WIDE) {
        return project.barangays.length === 0 ? current : null;
      }
      return project.barangays.includes(name) ? current : null;
    });
  };

  const togglePlace = (name: string | null) => {
    if (!name) {
      selectPlace(null);
      return;
    }
    selectPlace(active === name ? null : name);
  };

  const chooseProject = (project: NationalProject, place?: string) => {
    setProjectId(project.id);
    setActive(current => {
      if (project.barangays.length === 0 || place === TOWN_WIDE) {
        return TOWN_WIDE;
      }
      if (place && project.barangays.includes(place)) return place;
      if (
        current &&
        current !== TOWN_WIDE &&
        project.barangays.includes(current)
      ) {
        return current;
      }
      return project.barangays[0];
    });
  };

  const showOnMap = (project: NationalProject) => {
    chooseProject(project);
    setMode('map');
  };

  const mapActiveId = active && active !== TOWN_WIDE ? active : null;

  const placeChips = (
    <>
      <button
        type="button"
        aria-pressed={active == null}
        onClick={() => selectPlace(null)}
        className={chipClass(active == null)}
      >
        All places
        <span className={active == null ? 'text-white/80' : 'text-gray-400'}>
          {filtered.length}
        </span>
      </button>
      {groups.map(([name, lines]) => {
        const pressed = active === name;
        return (
          <button
            key={name}
            type="button"
            aria-pressed={pressed}
            onClick={() => selectPlace(name)}
            className={chipClass(pressed)}
          >
            {name}
            <span className={pressed ? 'text-white/80' : 'text-gray-400'}>
              {lines.length}
            </span>
          </button>
        );
      })}
      {unpinned.length > 0 ? (
        <button
          type="button"
          aria-pressed={active === TOWN_WIDE}
          onClick={() => selectPlace(TOWN_WIDE)}
          className={chipClass(active === TOWN_WIDE)}
        >
          Town-wide
          <span
            className={active === TOWN_WIDE ? 'text-white/80' : 'text-gray-400'}
          >
            {unpinned.length}
          </span>
        </button>
      ) : null}
    </>
  );

  useEffect(() => {
    if (layout !== 'stage') return;
    window.scrollTo(0, 0);
  }, [layout]);

  const map = (
    <ProjectsMap
      pins={pins}
      linesByName={linesByName}
      activeId={mapActiveId}
      sidebarOpen={active != null}
      sidebarName={active === TOWN_WIDE ? 'Town-wide' : active}
      sidebarLines={sidebarLines}
      selectedId={chosenProject?.id ?? null}
      chosenProject={chosenProject}
      townWideCount={unpinned.length}
      onTogglePlace={togglePlace}
      onOpenPlace={selectPlace}
      onChoose={setProjectId}
      onClose={() => selectPlace(null)}
      fill={layout === 'stage'}
      chrome={
        layout === 'stage' ? (
          <div className="flex h-full flex-col">
            <div
              role="group"
              aria-label="Place"
              className="no-scrollbar pointer-events-auto flex gap-2 overflow-x-auto px-3 py-2 sm:px-4"
            >
              {placeChips}
            </div>
            <div className="pointer-events-none min-h-0 flex-1">
              <div className="pointer-events-auto m-3 flex w-fit max-w-xl flex-col items-start gap-2">
                <div className="flex flex-col gap-2 rounded-2xl border border-gray-200/90 bg-white/95 p-1.5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.35)] backdrop-blur-sm">
                  <button
                    type="button"
                    aria-pressed={showLabels}
                    onClick={() => setShowLabels(open => !open)}
                    title={showLabels ? 'Show icons' : 'Show labels'}
                    className="grid size-9 place-items-center rounded-full text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                  >
                    {showLabels ? (
                      <PanelLeftClose aria-hidden="true" className="size-4" />
                    ) : (
                      <PanelLeftOpen aria-hidden="true" className="size-4" />
                    )}
                    <span className="sr-only">
                      {showLabels ? 'Show icons' : 'Show labels'}
                    </span>
                  </button>
                  <SegmentedChoice
                    name="projects-view"
                    label="View"
                    value={mode}
                    onChange={setMode}
                    tone="primary"
                    compact={!showLabels}
                    direction={showLabels ? 'row' : 'column'}
                    options={[
                      {
                        value: 'map',
                        label: 'Map',
                        icon: <Map aria-hidden="true" className="size-4" />,
                      },
                      {
                        value: 'table',
                        label: 'Table',
                        icon: <Table aria-hidden="true" className="size-4" />,
                      },
                    ]}
                  />
                  <SegmentedChoice
                    name="projects-status-stage"
                    label="Which lines"
                    value={status}
                    onChange={setStatus}
                    tone="quiet"
                    compact={!showLabels}
                    direction={showLabels ? 'row' : 'column'}
                    options={[
                      {
                        value: 'all',
                        label: 'All',
                        count: projects.length,
                        icon: <Layers aria-hidden="true" className="size-4" />,
                      },
                      {
                        value: 'enacted',
                        label: 'Enacted',
                        count: enactedCount,
                        icon: (
                          <BadgeCheck aria-hidden="true" className="size-4" />
                        ),
                      },
                      {
                        value: 'proposal',
                        label: 'Proposals',
                        count: proposalCount,
                        icon: (
                          <FileClock aria-hidden="true" className="size-4" />
                        ),
                      },
                    ]}
                  />
                  <button
                    type="button"
                    aria-expanded={aboutOpen}
                    onClick={() => setAboutOpen(open => !open)}
                    title="About these lines"
                    className={`inline-flex items-center justify-center gap-1.5 rounded-full font-semibold text-primary-700 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
                      showLabels ? 'px-3 py-1.5 text-sm' : 'size-9'
                    }`}
                  >
                    <Info aria-hidden="true" className="size-4" />
                    {showLabels ? (
                      'About these lines'
                    ) : (
                      <span className="sr-only">About these lines</span>
                    )}
                  </button>
                </div>
                {showLabels ? (
                  <div className="rounded-2xl border border-gray-200/90 bg-white/95 px-3 py-2 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.35)] backdrop-blur-sm">
                    <Totals
                      status={status}
                      enactedTotal={enactedTotal}
                      proposalTotal={proposalTotal}
                    />
                  </div>
                ) : null}
                {aboutOpen ? (
                  <div className="max-h-64 overflow-y-auto rounded-2xl border border-gray-200/90 bg-white/95 p-3 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.35)] backdrop-blur-sm">
                    <ProjectsIntro />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null
      }
    />
  );

  if (layout === 'stage') {
    return (
      <section className="relative h-[calc(100svh-var(--site-header,7.5rem))] min-h-[28rem]">
        {map}
      </section>
    );
  }

  return (
    <SurfaceCard as="section" className="overflow-hidden bg-white">
      <div className="relative z-10 flex flex-col gap-3 border-b border-gray-100 bg-white px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedChoice
            name="projects-view"
            label="View"
            value={mode}
            onChange={setMode}
            tone="primary"
            options={[
              {
                value: 'map',
                label: 'Map',
                icon: <Map aria-hidden="true" className="size-4" />,
              },
              {
                value: 'table',
                label: 'Table',
                icon: <Table aria-hidden="true" className="size-4" />,
              },
            ]}
          />
          <SegmentedChoice
            name="projects-status"
            label="Which lines"
            value={status}
            onChange={setStatus}
            tone="quiet"
            options={[
              { value: 'all', label: 'All', count: projects.length },
              { value: 'enacted', label: 'Enacted', count: enactedCount },
              {
                value: 'proposal',
                label: 'Proposals',
                count: proposalCount,
              },
            ]}
          />
        </div>
        <Totals
          status={status}
          enactedTotal={enactedTotal}
          proposalTotal={proposalTotal}
        />
      </div>

      <div
        role="group"
        aria-label="Place"
        className="no-scrollbar relative z-10 flex gap-2 overflow-x-auto border-b border-gray-100 bg-white px-4 py-3 sm:px-5 lg:flex-wrap"
      >
        {placeChips}
      </div>

      {mode === 'map' ? (
        <ProjectsMap
          pins={pins}
          linesByName={linesByName}
          activeId={mapActiveId}
          sidebarOpen={active != null}
          sidebarName={active === TOWN_WIDE ? 'Town-wide' : active}
          sidebarLines={sidebarLines}
          selectedId={chosenProject?.id ?? null}
          chosenProject={chosenProject}
          townWideCount={unpinned.length}
          onTogglePlace={togglePlace}
          onOpenPlace={selectPlace}
          onChoose={setProjectId}
          onClose={() => selectPlace(null)}
        />
      ) : (
        <ProjectsTable
          projects={filtered}
          active={active}
          selectedId={chosenProject?.id ?? null}
          onChoose={chooseProject}
          onShowOnMap={showOnMap}
        />
      )}
    </SurfaceCard>
  );
}
