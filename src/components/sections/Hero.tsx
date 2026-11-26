import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RESIDENT_QUICK_LINKS } from '../../data/residentNeeds';
import HairlineMap from '../hairline/HairlineMap';

export default function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section className="font-inter relative isolate w-full overflow-hidden pt-10 sm:pb-12 selection:bg-primary-200 selection:text-gray-950 sm:pt-14 sm:pb-16">
      <img
        src="/logos/webp/BetterOcampo-Seal.webp"
        alt=""
        width={640}
        height={640}
        fetchPriority="high"
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -right-40 -z-10 w-[34rem] max-w-none -translate-y-1/2 opacity-[0.04] select-none sm:opacity-[0.055] [mask-image:linear-gradient(to_bottom,black_45%,transparent_85%)] sm:-right-32 lg:w-[44rem]"
      />
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(22rem,30rem)] lg:items-stretch lg:gap-x-8 xl:grid-cols-[minmax(0,1fr)_minmax(26rem,34rem)] xl:gap-x-10">
          <div className="animate-civic-fade-up max-w-2xl xl:max-w-3xl">
            <h1 className="text-[2.125rem] leading-[1.05] tracking-tight text-gray-950 sm:text-6xl lg:text-5xl xl:text-7xl">
              <span className="block sm:leading-[1.02]">
                <span className="whitespace-nowrap">Community-driven</span>{' '}
                guide to <span className="text-primary-800">Ocampo</span>
              </span>
              <span className="mt-2 block text-lg font-semibold tracking-tight text-gray-800 sm:mt-3 sm:text-2xl">
                Camarines Sur
              </span>
            </h1>

            <p className="mt-4 max-w-[58ch] text-sm leading-relaxed text-gray-800 sm:mt-5 sm:text-lg">
              {t('hero.subtitle')}
            </p>
            <p className="mt-2 max-w-[58ch] text-sm leading-relaxed text-gray-800 sm:mt-2.5 sm:text-base">
              Independent community guide.{' '}
              <Link
                to="/about"
                className="font-semibold text-primary-800 underline decoration-primary-300 underline-offset-4 hover:decoration-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
              >
                Sources checked before publishing
              </Link>
              .
            </p>

            <form
              onSubmit={onSearch}
              className="mt-5 max-w-[88%] sm:mt-7"
              role="search"
            >
              <label htmlFor="home-search" className="sr-only">
                Search this guide
              </label>
              <div className="relative">
                <Search className="pointer-events-none hidden sm:block absolute top-1/2 left-4 size-4 -translate-y-1/2 text-gray-700" />
                <input
                  id="home-search"
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search services and guides"
                  className="h-10 w-full rounded-xl border border-gray-300 bg-white sm:pr-32 pl-3 sm:pl-11 text-sm text-gray-950 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] caret-primary-700 outline-none placeholder:text-gray-700 focus:border-primary-600 focus:ring-2 focus:ring-primary-500/25 sm:h-12 sm:rounded-2xl sm:text-base"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute inset-y-1 right-1 inline-flex items-center gap-1 rounded-lg bg-primary-600 px-3.5 text-sm font-semibold text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-inset sm:rounded-xl"
                >
                  <Search className="size-4" aria-hidden="true" />
                </button>
              </div>
              <nav
                aria-label="Common resident needs"
                className="mt-1 flex flex-wrap gap-x-2 sm:gap-x-4"
              >
                {RESIDENT_QUICK_LINKS.map(link => {
                  const isReportCta = link.href === '/report';
                  const className = isReportCta
                    ? 'inline-flex h-8 items-center rounded-full bg-primary-600 px-3 text-[11px] font-semibold text-white shadow-[0_4px_14px_-2px_rgba(0,93,245,0.45)] hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 sm:h-9 sm:text-sm'
                    : 'inline-flex min-h-5 sm:min-h-11 items-center text-[10px] sm:text-[13px] font-semibold text-primary-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 sm:text-sm';

                  if ('external' in link && link.external) {
                    return (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={className}
                      >
                        {link.label}
                      </a>
                    );
                  }

                  return (
                    <Link key={link.href} to={link.href} className={className}>
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </form>
          </div>
          <HairlineMap className="mx-auto mt-8 hidden w-full max-w-md sm:block lg:mx-0 lg:mt-0 lg:flex lg:h-full lg:max-w-none lg:flex-col lg:justify-center" />
        </div>
      </div>
    </section>
  );
}
