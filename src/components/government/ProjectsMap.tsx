import { type ReactNode } from 'react';
import OcampoMap from '../home/OcampoMap';
import { PROJECT_COUNT_STOPS } from '../home/OcampoMap';
import ProjectBudgetCard from './ProjectBudgetCard';
import ProjectSidebar from './ProjectSidebar';
import type { NationalProject } from './nationalProjects';

export default function ProjectsMap({
  pins,
  linesByName,
  activeId,
  sidebarOpen,
  sidebarName,
  sidebarLines,
  selectedId,
  chosenProject,
  townWideCount,
  onTogglePlace,
  onOpenPlace,
  onChoose,
  onClose,
  fill = false,
  chrome,
}: {
  pins: { id: string; name: string; count: number }[];
  linesByName: Record<string, NationalProject[]>;
  activeId: string | null;
  sidebarOpen: boolean;
  sidebarName: string | null;
  sidebarLines: NationalProject[];
  selectedId: string | null;
  chosenProject: NationalProject | null;
  townWideCount: number;
  onTogglePlace: (name: string | null) => void;
  onOpenPlace: (name: string) => void;
  onChoose: (id: string) => void;
  onClose: () => void;
  fill?: boolean;
  chrome?: ReactNode;
}) {
  return (
    <div className={fill ? 'relative h-full' : undefined}>
      <div
        className={
          fill
            ? 'absolute inset-0 z-0 isolate'
            : 'relative z-0 isolate h-[400px] sm:h-[480px] lg:h-[560px]'
        }
      >
        <OcampoMap
          activeId={activeId}
          onSelect={onTogglePlace}
          pins={pins}
          padForFacts={false}
          onBarangayClick={onTogglePlace}
          bars={false}
          hoverCard={stats => (
            <ProjectBudgetCard
              name={stats.name}
              lines={
                stats.name === activeId && chosenProject
                  ? [chosenProject]
                  : (linesByName[stats.name] ?? [])
              }
            />
          )}
        />
        {chrome ? (
          <div className="pointer-events-none absolute inset-0 z-10">
            {chrome}
          </div>
        ) : null}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 ${
            fill
              ? 'absolute inset-x-0 bottom-0 z-10 border-t border-gray-200/80 bg-white/95 px-4 py-2 backdrop-blur-sm sm:px-5'
              : 'hidden'
          }`}
        >
          <MapLegend townWideCount={townWideCount} />
        </div>
        <ProjectSidebar
          open={sidebarOpen}
          name={sidebarName}
          lines={sidebarLines}
          onClose={onClose}
          onOpenBarangay={onOpenPlace}
          projectId={selectedId}
          onChoose={onChoose}
        />
      </div>

      {fill ? null : (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 text-xs text-gray-500 sm:px-5">
          <MapLegend townWideCount={townWideCount} />
        </div>
      )}
    </div>
  );
}

function MapLegend({ townWideCount }: { townWideCount: number }) {
  return (
    <>
      <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-2.5 w-14 rounded-sm"
            style={{
              background: `linear-gradient(to right, ${PROJECT_COUNT_STOPS.map(([, color]) => color).join(', ')})`,
            }}
          />
          More lines, darker blue
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="grid size-4 place-items-center rounded-full bg-primary-600 text-[9px] font-bold text-white">
            3
          </span>
          Lines in that barangay
        </span>
        <span>Drag to tilt the map</span>
        {townWideCount > 0 ? <span>Town-wide lines have no pin</span> : null}
      </span>
      <a
        href="https://data.humdata.org/dataset/cod-ab-phl"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-primary-700 hover:underline"
      >
        Barangay boundaries
      </a>
    </>
  );
}
