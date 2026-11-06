import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

interface DirectoryCardProps {
  to: string;
  title: string;
  description?: string;
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
        className="civic-card-hover group flex h-full flex-col justify-between rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 p-5 text-white shadow-sm"
      >
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 text-white">
              {icon}
            </span>
            {badge ? (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold text-white">
                {badge}
              </span>
            ) : null}
          </div>
          <h3 className="mt-3 text-base font-extrabold">{title}</h3>
          {description ? (
            <p className="mt-1.5 text-xs leading-relaxed text-blue-100">
              {description}
            </p>
          ) : null}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-2.5 text-xs font-bold text-amber-300">
          <span>{footer || 'Open directory'}</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className="civic-card-hover group flex h-full flex-col justify-between rounded-xl border border-gray-200 bg-white shadow-sm transition-colors hover:border-blue-600"
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
            {icon}
          </span>
          {badge ? (
            <span className="rounded-full border border-gray-200 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
              {badge}
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 text-base font-bold text-gray-900 group-hover:text-blue-600">
          {title}
        </h3>
        {description ? (
          <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-gray-500">
            {description}
          </p>
        ) : null}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-2.5 text-xs font-semibold text-blue-600">
          <span className="truncate">{footer || 'Open'}</span>
          <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
