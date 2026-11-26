import { Link } from 'react-router';
import {
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Construction,
  Droplets,
  HelpCircle,
  Lightbulb,
  MapPin,
  Route,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  REPORT_CATEGORIES,
  REPORT_CATEGORY_LABELS,
  REPORT_STATUSES,
  REPORT_STATUS_LABELS,
  type ReportCategory,
  type ReportStatus,
} from '../../types/report';
import './report.css';

export const reportFieldClass =
  'mt-1.5 w-full rounded-xl border border-gray-300/90 bg-white px-3.5 py-2.5 text-sm text-gray-950 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25';

export const reportBtnPrimary =
  'inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-semibold text-white shadow-[0_4px_14px_-2px_rgba(0,93,245,0.5),0_2px_6px_rgba(15,23,42,0.12)] transition duration-200 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-[0_8px_22px_-4px_rgba(0,93,245,0.55),0_3px_8px_rgba(15,23,42,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_14px_-2px_rgba(0,93,245,0.5),0_2px_6px_rgba(15,23,42,0.12)]';

export const reportBtnGhost =
  'inline-flex h-11 items-center justify-center gap-2 rounded-xl border-0 bg-white px-5 text-sm font-semibold text-gray-800 shadow-[0_2px_10px_-2px_rgba(15,23,42,0.14),0_1px_3px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-[0_6px_16px_-4px_rgba(15,23,42,0.18),0_2px_6px_rgba(15,23,42,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';

const CATEGORY_ICONS: Record<ReportCategory, LucideIcon> = {
  road: Route,
  bridge: Construction,
  drainage: Droplets,
  streetlight: Lightbulb,
  garbage: Trash2,
  other: HelpCircle,
};

const STATUS_TONE: Record<
  ReportStatus,
  { chip: string; dot: string; rail: string }
> = {
  received: {
    chip: 'bg-primary-50 text-primary-900 ring-primary-200',
    dot: 'bg-primary-500',
    rail: 'bg-primary-500',
  },
  in_review: {
    chip: 'bg-accent-50 text-accent-900 ring-accent-200',
    dot: 'bg-accent-500',
    rail: 'bg-accent-500',
  },
  resolved: {
    chip: 'bg-success-50 text-success-900 ring-success-200',
    dot: 'bg-success-500',
    rail: 'bg-success-500',
  },
  closed: {
    chip: 'bg-gray-100 text-gray-800 ring-gray-300',
    dot: 'bg-gray-500',
    rail: 'bg-gray-400',
  },
};

export function ReportCategoryIcon({
  category,
  className,
}: {
  category: ReportCategory;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS[category];
  return <Icon className={cn('size-5', className)} aria-hidden />;
}

export function StatusBadge({ status }: { status: ReportStatus }) {
  const tone = STATUS_TONE[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
        tone.chip
      )}
    >
      <span className={cn('size-1.5 rounded-full', tone.dot)} />
      {REPORT_STATUS_LABELS[status]}
    </span>
  );
}

export function StatusRail({ status }: { status: ReportStatus }) {
  const currentIdx = REPORT_STATUSES.indexOf(status);
  return (
    <ol className="grid grid-cols-4 gap-1 sm:gap-2">
      {REPORT_STATUSES.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        return (
          <li key={step} className="min-w-0">
            <div
              className={cn(
                'h-1.5 rounded-full transition-colors',
                done ? STATUS_TONE[step].rail : 'bg-gray-200'
              )}
            />
            <p
              className={cn(
                'mt-2 truncate text-[11px] font-medium sm:text-xs',
                active
                  ? 'text-gray-950'
                  : done
                    ? 'text-gray-700'
                    : 'text-gray-400'
              )}
            >
              {REPORT_STATUS_LABELS[step]}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

export function ReportSubnav({
  active,
}: {
  active: 'file' | 'track' | 'board';
}) {
  const items = [
    {
      id: 'file' as const,
      href: '/report',
      label: 'Report a problem',
      icon: ClipboardList,
    },
    {
      id: 'track' as const,
      href: '/report/track',
      label: 'Check status',
      icon: CircleDot,
    },
    {
      id: 'board' as const,
      href: '/reports',
      label: 'Public reports',
      icon: MapPin,
    },
  ];
  return (
    <nav aria-label="Reporting" className="mt-5 flex flex-wrap gap-2">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = item.id === active;
        return (
          <Link
            key={item.id}
            to={item.href}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition',
              isActive
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
            )}
          >
            <Icon className="size-3.5" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function CategoryPicker({
  value,
  onChange,
}: {
  value: ReportCategory;
  onChange: (category: ReportCategory) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Category"
      className="grid grid-cols-2 gap-2 sm:grid-cols-3"
    >
      {REPORT_CATEGORIES.map(category => {
        const selected = value === category;
        const Icon = CATEGORY_ICONS[category];
        return (
          <button
            key={category}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(category)}
            className={cn(
              'flex items-center gap-2.5 rounded-2xl border px-3 py-3 text-left text-sm font-semibold transition',
              selected
                ? 'border-primary-500 bg-primary-50 text-primary-950 shadow-[0_0_0_1px_rgba(0,93,245,0.2)]'
                : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50'
            )}
          >
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-xl',
                selected
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              )}
            >
              <Icon className="size-4" aria-hidden />
            </span>
            <span className="leading-tight">
              {REPORT_CATEGORY_LABELS[category]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function FormSection({
  step,
  title,
  hint,
  children,
  className,
}: {
  step?: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('space-y-3', className)}>
      <div className="flex items-start gap-3">
        {step ? (
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-600/10 font-mono text-xs font-bold text-primary-800">
            {step}
          </span>
        ) : null}
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-gray-950">
            {title}
          </h2>
          {hint ? (
            <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
              {hint}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function DisclaimerBanner() {
  return (
    <aside className="rounded-2xl border border-primary-100 bg-primary-50/70 px-4 py-3 text-sm leading-relaxed text-primary-950">
      <p className="font-semibold">
        We’ll help raise this with the municipality
      </p>
      <p className="mt-1 text-primary-900/80">
        This is a community channel, not an official LGU ticket. Site operators
        collect Reports and may share them with the municipality — it does not
        guarantee repair.
      </p>
    </aside>
  );
}

export function ReferenceStamp({ id }: { id: string }) {
  return (
    <div className="report-stamp report-receipt rounded-3xl border border-primary-200/80 p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-primary-700 uppercase">
            Reference ID
          </p>
          <p className="mt-2 font-mono text-2xl font-bold tracking-wide text-gray-950 sm:text-3xl">
            {id}
          </p>
          <p className="mt-3 max-w-md text-sm text-gray-600">
            Screenshot or copy this ID. You need it to track updates — there is
            no account login.
          </p>
        </div>
        <CheckCircle2
          className="size-10 shrink-0 text-success-600"
          aria-hidden
        />
      </div>
    </div>
  );
}
