import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ProjectDetail } from './ProjectSidebar';
import {
  TOWN_WIDE,
  formatPesos,
  type NationalProject,
} from './nationalProjects';

type SortKey = 'year' | 'place' | 'amount';
type Sort = { key: SortKey; dir: 'asc' | 'desc' };

function placeName(project: NationalProject): string {
  return project.barangays[0] ?? 'Town-wide';
}

function matchesPlace(
  project: NationalProject,
  active: string | null
): boolean {
  if (!active) return false;
  if (active === TOWN_WIDE) return project.barangays.length === 0;
  return project.barangays.includes(active);
}

function compare(a: NationalProject, b: NationalProject, sort: Sort): number {
  const dir = sort.dir === 'asc' ? 1 : -1;
  if (sort.key === 'year') {
    const byYear = a.year - b.year;
    if (byYear !== 0) return byYear * dir;
    return (b.amount ?? 0) - (a.amount ?? 0);
  }
  if (sort.key === 'amount') {
    const byAmount = (a.amount ?? -1) - (b.amount ?? -1);
    if (byAmount !== 0) return byAmount * dir;
    return b.year - a.year;
  }
  const byPlace = placeName(a).localeCompare(placeName(b));
  if (byPlace !== 0) return byPlace * dir;
  return b.year - a.year;
}

function useWideLayout() {
  const query = '(min-width: 768px)';
  const [wide, setWide] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setWide(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);
  return wide;
}

function SortLabel({
  label,
  sort,
  column,
  onSort,
  align = 'left',
}: {
  label: string;
  sort: Sort;
  column: SortKey;
  onSort: (column: SortKey) => void;
  align?: 'left' | 'right';
}) {
  const active = sort.key === column;
  const Icon = sort.dir === 'asc' ? ChevronUp : ChevronDown;
  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className={`inline-flex items-center gap-1 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
        align === 'right' ? 'ml-auto' : ''
      }`}
    >
      {label}
      {active ? <Icon aria-hidden="true" className="size-3.5" /> : null}
    </button>
  );
}

export default function ProjectsTable({
  projects,
  active,
  selectedId,
  onChoose,
  onShowOnMap,
}: {
  projects: NationalProject[];
  active: string | null;
  selectedId: string | null;
  onChoose: (project: NationalProject, place?: string) => void;
  onShowOnMap: (project: NationalProject) => void;
}) {
  const wide = useWideLayout();
  const [sort, setSort] = useState<Sort>({ key: 'year', dir: 'desc' });
  const rows = useMemo(
    () => [...projects].sort((a, b) => compare(a, b, sort)),
    [projects, sort]
  );

  useEffect(() => {
    if (!selectedId) return;
    document.getElementById(`project-${selectedId}`)?.scrollIntoView({
      block: 'nearest',
    });
  }, [selectedId, wide]);

  const onSort = (column: SortKey) => {
    setSort(current =>
      current.key === column
        ? { key: column, dir: current.dir === 'asc' ? 'desc' : 'asc' }
        : { key: column, dir: column === 'place' ? 'asc' : 'desc' }
    );
  };

  if (rows.length === 0) {
    return (
      <p className="px-4 py-8 text-sm text-gray-600 sm:px-5">
        No lines match this filter.
      </p>
    );
  }

  return wide ? (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[44rem] text-left text-sm">
        <caption className="sr-only">
          {rows.length} national budget lines for Ocampo
        </caption>
        <thead className="border-b border-gray-200 text-xs text-gray-500">
          <tr>
            <th
              scope="col"
              aria-sort={
                sort.key === 'year'
                  ? sort.dir === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              }
              className="px-4 py-2 font-semibold sm:px-5"
            >
              <SortLabel
                label="Year"
                sort={sort}
                column="year"
                onSort={onSort}
              />
            </th>
            <th
              scope="col"
              aria-sort={
                sort.key === 'place'
                  ? sort.dir === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              }
              className="px-3 py-2 font-semibold"
            >
              <SortLabel
                label="Place"
                sort={sort}
                column="place"
                onSort={onSort}
              />
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Agency
            </th>
            <th
              scope="col"
              aria-sort={
                sort.key === 'amount'
                  ? sort.dir === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              }
              className="px-3 py-2 text-right font-semibold"
            >
              <SortLabel
                label="Amount"
                sort={sort}
                column="amount"
                onSort={onSort}
                align="right"
              />
            </th>
            <th scope="col" className="px-4 py-2 font-semibold sm:pr-5">
              Line
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(project => (
            <TableRow
              key={project.id}
              project={project}
              selected={project.id === selectedId}
              highlighted={matchesPlace(project, active)}
              onChoose={onChoose}
              onShowOnMap={onShowOnMap}
            />
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <ul>
      {rows.map(project => (
        <ListRow
          key={project.id}
          project={project}
          selected={project.id === selectedId}
          highlighted={matchesPlace(project, active)}
          onChoose={onChoose}
          onShowOnMap={onShowOnMap}
        />
      ))}
    </ul>
  );
}

function PlaceButtons({
  project,
  onChoose,
}: {
  project: NationalProject;
  onChoose: (project: NationalProject, place?: string) => void;
}) {
  const names = project.barangays.length > 0 ? project.barangays : [TOWN_WIDE];
  return (
    <span className="inline-flex flex-wrap gap-1">
      {names.map(name => (
        <button
          key={name}
          type="button"
          onClick={event => {
            event.stopPropagation();
            onChoose(project, name);
          }}
          className="rounded-full px-1.5 py-0.5 text-xs font-semibold text-primary-800 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          {name === TOWN_WIDE ? 'Town-wide' : name}
        </button>
      ))}
    </span>
  );
}

function Record({
  project,
  onShowOnMap,
}: {
  project: NationalProject;
  onShowOnMap: (project: NationalProject) => void;
}) {
  return (
    <div className="max-w-2xl">
      <ProjectDetail project={project} />
      <button
        type="button"
        onClick={() => onShowOnMap(project)}
        className="mt-2 text-xs font-semibold text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
      >
        Show on map
      </button>
    </div>
  );
}

function TableRow({
  project,
  selected,
  highlighted,
  onChoose,
  onShowOnMap,
}: {
  project: NationalProject;
  selected: boolean;
  highlighted: boolean;
  onChoose: (project: NationalProject, place?: string) => void;
  onShowOnMap: (project: NationalProject) => void;
}) {
  const tone = selected
    ? 'bg-primary-50'
    : highlighted
      ? 'bg-primary-50/50'
      : 'hover:bg-gray-50';

  return (
    <>
      <tr
        id={selected ? `project-${project.id}` : undefined}
        className={`cursor-pointer border-b border-gray-100 ${tone}`}
        onClick={() => onChoose(project)}
      >
        <td className="px-4 py-3 align-top sm:px-5">
          <span className="block tabular-nums text-gray-950">
            {project.year}
          </span>
          {project.status === 'proposal' ? (
            <span className="block text-[11px] font-semibold text-primary-700">
              Proposal
            </span>
          ) : null}
        </td>
        <td className="px-3 py-3 align-top">
          <PlaceButtons project={project} onChoose={onChoose} />
        </td>
        <td className="px-3 py-3 align-top text-gray-700">{project.agency}</td>
        <td className="px-3 py-3 text-right align-top font-semibold text-gray-950 tabular-nums">
          {formatPesos(project.amount)}
        </td>
        <td className="px-4 py-3 align-top sm:pr-5">
          <button
            type="button"
            aria-pressed={selected}
            onClick={event => {
              event.stopPropagation();
              onChoose(project);
            }}
            className="line-clamp-2 text-left leading-snug text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            {project.line}
          </button>
        </td>
      </tr>
      {selected ? (
        <tr className="border-b border-gray-100 bg-primary-50">
          <td colSpan={5} className="px-4 py-3 sm:px-5">
            <Record project={project} onShowOnMap={onShowOnMap} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function ListRow({
  project,
  selected,
  highlighted,
  onChoose,
  onShowOnMap,
}: {
  project: NationalProject;
  selected: boolean;
  highlighted: boolean;
  onChoose: (project: NationalProject, place?: string) => void;
  onShowOnMap: (project: NationalProject) => void;
}) {
  const tone = selected
    ? 'bg-primary-50'
    : highlighted
      ? 'bg-primary-50/50'
      : '';

  return (
    <li
      id={selected ? `project-${project.id}` : undefined}
      className={`border-b border-gray-100 ${tone}`}
    >
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onChoose(project)}
        className="w-full px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600"
      >
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-xs font-semibold text-primary-700">
            {project.year}
            {project.status === 'proposal' ? ' · Proposal' : ''} ·{' '}
            {project.agency}
          </span>
          <span className="shrink-0 font-semibold text-gray-950 tabular-nums">
            {formatPesos(project.amount)}
          </span>
        </span>
        <span className="mt-1 block text-sm leading-snug text-gray-950">
          {project.line}
        </span>
      </button>
      <div className="px-4 pb-3">
        <PlaceButtons project={project} onChoose={onChoose} />
        {selected ? (
          <div className="mt-3">
            <Record project={project} onShowOnMap={onShowOnMap} />
          </div>
        ) : null}
      </div>
    </li>
  );
}
