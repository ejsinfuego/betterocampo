import { cn } from '../../lib/utils';

export function CivicPage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50/80 via-white to-white p-4 shadow-sm sm:p-6 lg:p-8">
      {eyebrow ? (
        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold tracking-wide text-blue-900 uppercase">
          {eyebrow}
        </span>
      ) : null}
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base">
          {description}
        </p>
      ) : null}
      {children}
    </header>
  );
}

export function Notice({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'error';
  title: string;
  children: React.ReactNode;
}) {
  const tones = {
    info: 'border-blue-200 bg-blue-50 text-blue-950',
    error: 'border-rose-200 bg-rose-50 text-rose-950',
  };

  return (
    <div className={`rounded-2xl border p-5 ${tones[tone]}`}>
      <h1 className="text-lg font-bold">{title}</h1>
      <div className="mt-1 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
