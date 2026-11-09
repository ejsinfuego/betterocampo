import { cn } from '../../lib/utils';

const surfaceShadow =
  'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)]';

export function CivicPage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="landing-aurora absolute inset-x-0 top-0 h-[28rem] sm:h-[24rem]" />
      </div>
      <div
        className={cn(
          'relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8',
          className
        )}
      >
        {children}
      </div>
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
    <header
      className={cn(
        'rounded-3xl border border-gray-200/90 bg-white/80 p-5 backdrop-blur-sm sm:p-6 lg:p-8',
        surfaceShadow
      )}
    >
      {eyebrow ? (
        <p className="text-xs font-semibold tracking-wide text-primary-700 uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-2 text-2xl tracking-tight text-gray-950 sm:text-4xl">
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
    info: 'border-primary-200 bg-primary-50/80 text-primary-950',
    error: 'border-error-200 bg-error-50 text-error-950',
  };

  return (
    <div
      className={cn(
        'rounded-2xl border p-5 backdrop-blur-sm',
        surfaceShadow,
        tones[tone]
      )}
    >
      <h1 className="text-lg">{title}</h1>
      <div className="mt-1 text-sm leading-relaxed opacity-90">{children}</div>
    </div>
  );
}

export function SurfaceCard({
  children,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'section';
}) {
  return (
    <Tag
      className={cn(
        'rounded-2xl border border-gray-200/90 bg-white/80 backdrop-blur-sm',
        surfaceShadow,
        className
      )}
    >
      {children}
    </Tag>
  );
}
