import type { ReactNode } from 'react';

export default function DirectorySectionHeading({
  icon,
  title,
  description,
  count,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  count?: number;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4 sm:mb-5">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary-600 text-white sm:size-9">
            {icon}
          </span>
          <h2 className="text-lg font-semibold tracking-tight text-gray-950 sm:text-xl">
            {title}
          </h2>
        </div>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
            {description}
          </p>
        ) : null}
      </div>
      {count !== undefined ? (
        <span className="shrink-0 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-gray-700">
          {count}
        </span>
      ) : null}
    </div>
  );
}
