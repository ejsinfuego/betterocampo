import { ReportCategoryIcon, StatusBadge } from './ReportUi';
import { SurfaceCard } from '../ui/PageFrame';
import { REPORT_CATEGORY_LABELS } from '../../types/report';
import type { ReportCategory, ReportStatus } from '../../types/report';
import { cn } from '../../lib/utils';

export type ReportCardData = {
  referenceId?: string;
  category: ReportCategory;
  barangay: string;
  landmark?: string;
  description: string;
  status: ReportStatus;
  staffNote?: string;
  photoUrls?: string[];
};

export default function ReportCard({
  report,
  className,
  showReferenceId = false,
}: {
  report: ReportCardData;
  className?: string;
  showReferenceId?: boolean;
}) {
  return (
    <SurfaceCard className={cn('flex h-full flex-col p-5 sm:p-6', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-600/10 text-primary-800">
            <ReportCategoryIcon category={report.category} />
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold text-gray-950">
              {REPORT_CATEGORY_LABELS[report.category]}
            </p>
            <p className="truncate text-sm text-gray-600">
              {report.barangay}
              {report.landmark ? ` · ${report.landmark}` : ''}
            </p>
            {showReferenceId && report.referenceId ? (
              <p className="mt-1 font-mono text-xs tracking-wide text-gray-500">
                {report.referenceId}
              </p>
            ) : null}
          </div>
        </div>
        <StatusBadge status={report.status} />
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-800">
        {report.description}
      </p>

      {report.staffNote ? (
        <p className="mt-3 rounded-xl bg-primary-50/70 px-3 py-2 text-sm text-primary-950">
          <span className="font-semibold">Operator note: </span>
          {report.staffNote}
        </p>
      ) : null}

      {(report.photoUrls || []).length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {report.photoUrls!.map(url => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="overflow-hidden rounded-xl border border-gray-200"
            >
              <img src={url} alt="" className="h-24 w-full object-cover" />
            </a>
          ))}
        </div>
      ) : null}
    </SurfaceCard>
  );
}
