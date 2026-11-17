import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SurfaceCard } from '../ui/PageFrame';

const LGU_FACEBOOK = 'https://www.facebook.com/101706771551898';
const PLUGIN_HEIGHT = 700;
const LOAD_TIMEOUT_MS = 12000;

type Status = 'loading' | 'ready' | 'unavailable';

function pluginSrc(width: number) {
  const params = new URLSearchParams({
    href: LGU_FACEBOOK,
    tabs: 'timeline',
    width: String(width),
    height: String(PLUGIN_HEIGHT),
    small_header: 'false',
    adapt_container_width: 'true',
    hide_cover: 'false',
    show_facepile: 'false',
    hide_cta: 'true',
  });
  return `https://www.facebook.com/plugins/page.php?${params.toString()}`;
}

function FacebookLink({ className }: { className?: string }) {
  return (
    <a
      href={LGU_FACEBOOK}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      Open the LGU Facebook page
      <ArrowUpRight className="size-4" aria-hidden="true" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

const linkClassName =
  'inline-flex h-11 items-center justify-center gap-1.5 self-start rounded-xl border border-gray-200/90 bg-white px-5 text-sm font-semibold text-gray-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:text-primary-700';

export default function FacebookPageFeed() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      const measured = Math.min(
        500,
        Math.max(180, Math.floor(frame.clientWidth || 500))
      );
      setWidth(current => (current === measured ? current : measured));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (width === null || status !== 'loading') return;
    const timeoutId = window.setTimeout(() => {
      setStatus(current => (current === 'loading' ? 'unavailable' : current));
    }, LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timeoutId);
  }, [width, status]);

  return (
    <section
      aria-label="LGU Facebook posts"
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,500px)]"
    >
      <SurfaceCard as="section" className="flex flex-col gap-4 p-5 sm:p-6">
        <div>
          <h2 className="text-xl tracking-tight text-gray-950">
            Posts from the municipality
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
            The municipality writes these posts on its Facebook page. This guide
            displays that public timeline.
          </p>
        </div>
        <FacebookLink className={linkClassName} />
        <p className="text-sm leading-relaxed text-gray-500">
          Facebook loads the timeline in the frame. If the frame stays empty, or
          asks you to log in, the link above still opens the page.
        </p>
      </SurfaceCard>

      <div
        ref={frameRef}
        className="relative min-h-[44rem] w-full max-w-[500px] overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)]"
      >
        {status === 'loading' ? (
          <div
            className="absolute inset-0 z-10 flex flex-col gap-4 bg-white p-5"
            aria-busy="true"
            aria-live="polite"
          >
            <p className="sr-only">Loading posts from the LGU Facebook page.</p>
            <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
            <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
            <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
          </div>
        ) : null}

        {status === 'unavailable' ? (
          <div className="flex min-h-[44rem] flex-col items-start justify-center gap-4 p-6">
            <p className="text-sm leading-relaxed text-gray-600">
              The timeline did not load in this browser. Open the LGU Facebook
              page to read the posts.
            </p>
            <FacebookLink className={linkClassName} />
          </div>
        ) : null}

        {width !== null && status !== 'unavailable' ? (
          <iframe
            title="Posts from LGU - Ocampo, Camarines Sur on Facebook"
            src={pluginSrc(width)}
            width={width}
            height={PLUGIN_HEIGHT}
            className="block h-[700px] w-full border-0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            onLoad={() => setStatus('ready')}
            onError={() => setStatus('unavailable')}
          />
        ) : null}
      </div>
    </section>
  );
}
