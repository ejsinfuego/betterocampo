import MapHillshade from '../ui/MapHillshade';
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
} from '../ui/map';
import { SurfaceCard } from '../ui/PageFrame';
import { OCAMPO_MAP_CENTER } from '../../data/ocampoBarangayNames';
import { REPORT_MAP_STYLE } from '../../data/reportMapStyle';
import { cn } from '../../lib/utils';
import {
  REPORT_CATEGORIES,
  REPORT_CATEGORY_LABELS,
  REPORT_STATUS_LABELS,
  type ReportCategory,
  type ReportGeo,
  type ReportStatus,
} from '../../types/report';
import { ReportCategoryIcon, StatusBadge } from './ReportUi';

export type ReportsMapItem = {
  referenceId: string;
  category: ReportCategory;
  description: string;
  barangay: string;
  landmark?: string;
  geo: ReportGeo;
  status: ReportStatus;
};

const CATEGORY_MARKER: Record<ReportCategory, { pin: string; ink: string }> = {
  road: { pin: 'bg-slate-700', ink: 'text-slate-700' },
  bridge: { pin: 'bg-amber-600', ink: 'text-amber-800' },
  drainage: { pin: 'bg-sky-600', ink: 'text-sky-800' },
  streetlight: { pin: 'bg-yellow-500', ink: 'text-yellow-800' },
  garbage: { pin: 'bg-emerald-600', ink: 'text-emerald-800' },
  other: { pin: 'bg-gray-500', ink: 'text-gray-700' },
};

const STATUS_RING: Record<ReportStatus, string> = {
  received: 'ring-primary-500',
  in_review: 'ring-accent-500',
  resolved: 'ring-success-500',
  closed: 'ring-gray-400',
};

export default function ReportsMap({
  reports,
  showReferenceId = false,
  onSelect,
  className,
  title = 'Map of pinned Reports',
  description = 'Pins show category by color/icon and status by ring. Click a pin for details.',
}: {
  reports: ReportsMapItem[];
  showReferenceId?: boolean;
  onSelect?: (referenceId: string) => void;
  className?: string;
  title?: string;
  description?: string;
}) {
  if (reports.length === 0) return null;

  const usedCategories = REPORT_CATEGORIES.filter(category =>
    reports.some(report => report.category === category)
  );

  return (
    <SurfaceCard className={cn('overflow-hidden p-0', className)}>
      <div className="border-b border-gray-200 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-950">{title}</p>
            <p className="mt-0.5 text-xs text-gray-500">{description}</p>
          </div>
          <p className="text-xs font-medium text-gray-500 tabular-nums">
            {reports.length} pinned
          </p>
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
          {usedCategories.map(category => (
            <li
              key={category}
              className={cn(
                'inline-flex items-center gap-1.5 text-[11px] font-semibold',
                CATEGORY_MARKER[category].ink
              )}
            >
              <span
                className={cn(
                  'flex size-5 items-center justify-center rounded-full text-white',
                  CATEGORY_MARKER[category].pin
                )}
              >
                <ReportCategoryIcon category={category} className="size-3" />
              </span>
              {REPORT_CATEGORY_LABELS[category]}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative h-72 sm:h-96">
        <Map
          className="h-full w-full"
          center={[OCAMPO_MAP_CENTER.lng, OCAMPO_MAP_CENTER.lat]}
          zoom={13}
          theme="light"
          styles={{ light: REPORT_MAP_STYLE, dark: REPORT_MAP_STYLE }}
        >
          <MapHillshade />
          <MapControls showZoom showCompass={false} />
          {reports.map(report => {
            const tone = CATEGORY_MARKER[report.category];
            return (
              <MapMarker
                key={report.referenceId}
                longitude={report.geo.lng}
                latitude={report.geo.lat}
                onClick={() => onSelect?.(report.referenceId)}
              >
                <MarkerContent>
                  <span
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full text-white shadow-md ring-2 ring-offset-1',
                      tone.pin,
                      STATUS_RING[report.status]
                    )}
                    aria-label={`${REPORT_CATEGORY_LABELS[report.category]} in ${report.barangay}, ${REPORT_STATUS_LABELS[report.status]}`}
                  >
                    <ReportCategoryIcon
                      category={report.category}
                      className="size-3.5"
                    />
                  </span>
                </MarkerContent>
                <MarkerTooltip>
                  <span className="font-semibold">
                    {REPORT_CATEGORY_LABELS[report.category]}
                  </span>
                  {' · '}
                  {report.barangay}
                </MarkerTooltip>
                <MarkerPopup>
                  <div className="max-w-xs space-y-2 p-0.5 text-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-950">
                          {REPORT_CATEGORY_LABELS[report.category]}
                        </p>
                        <p className="text-xs text-gray-600">
                          {report.barangay}
                          {report.landmark ? ` · ${report.landmark}` : ''}
                        </p>
                      </div>
                      <StatusBadge status={report.status} />
                    </div>
                    {showReferenceId ? (
                      <p className="font-mono text-[11px] tracking-wide text-gray-500">
                        {report.referenceId}
                      </p>
                    ) : null}
                    <p className="line-clamp-4 text-gray-800">
                      {report.description}
                    </p>
                  </div>
                </MarkerPopup>
              </MapMarker>
            );
          })}
        </Map>
      </div>
    </SurfaceCard>
  );
}
