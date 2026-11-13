import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

interface DirectoryCardProps {
  to: string;
  title: string;
  description?: string;
  /** Optional quiet meta (e.g. count). Avoid generic “Service” labels. */
  badge?: string;
  icon?: React.ReactNode;
  featured?: boolean;
  footer?: string;
}

export default function DirectoryCard({
  to,
  title,
  description,
  badge,
  icon,
  featured = false,
  footer,
}: DirectoryCardProps) {
  if (featured) {
    return (
      <Link
        to={to}
        className="civic-card-hover group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-primary-600 p-4 text-white shadow-[0_18px_40px_-24px_rgba(0,93,245,0.65)] sm:p-6"
      >
        <span
          className="pointer-events-none absolute -right-10 -bottom-12 size-40 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-110"
          aria-hidden="true"
        />

        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            {icon ? (
              <span className="flex size-9 items-center justify-center rounded-lg bg-white/12 text-white ring-1 ring-white/15 sm:size-11 sm:rounded-xl">
                {icon}
              </span>
            ) : null}
            {badge ? (
              <span className="pt-1 text-[11px] font-semibold tracking-wide text-primary-100 uppercase">
                {badge}
              </span>
            ) : null}
          </div>
          <h3 className="mt-3 text-base font-semibold tracking-tight text-white sm:mt-5 sm:text-lg">
            {title}
          </h3>
          {description ? (
            <p className="mt-1.5 text-[13px] leading-relaxed text-primary-100/90 sm:mt-2 sm:text-sm">
              {description}
            </p>
          ) : null}
        </div>

        <div className="relative mt-4 flex items-center gap-2 text-[13px] font-semibold text-white sm:mt-6 sm:text-sm">
          <span>{footer || 'Browse all'}</span>
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className="civic-card-hover group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white/80 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-300 hover:border-gray-300 hover:bg-white hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_18px_40px_-16px_rgba(0,93,245,0.28)] sm:p-6"
    >
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          {icon ? (
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary-600/[0.08] text-primary-700 ring-1 ring-primary-600/10 transition-colors duration-300 group-hover:bg-primary-600 group-hover:text-white group-hover:ring-primary-600 sm:size-11 sm:rounded-xl">
              {icon}
            </span>
          ) : (
            <span />
          )}
          {badge ? (
            <span className="pt-1 text-[11px] font-medium tracking-wide text-gray-400 uppercase">
              {badge}
            </span>
          ) : null}
        </div>

        <h3 className="mt-3 text-base font-semibold tracking-tight text-gray-950 transition-colors group-hover:text-primary-700 sm:mt-5 sm:text-lg">
          {title}
        </h3>
        {description ? (
          <p className="mt-1.5 line-clamp-2 text-[13px] sm:line-clamp-3 leading-relaxed text-gray-500 sm:mt-2 sm:text-sm">
            {description}
          </p>
        ) : null}

        <div className="mt-auto flex items-center gap-1.5 pt-4 text-[13px] font-medium text-primary-700 sm:pt-6 sm:text-sm">
          <span className="truncate">{footer || 'Open'}</span>
          <ArrowRight className="size-4 shrink-0 opacity-60 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
        </div>
      </div>
    </Link>
  );
}
