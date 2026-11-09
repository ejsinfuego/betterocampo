import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, Search, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { isMeilisearchEnabled } from '../../lib/meilisearch';

const quickLinks = [
  { label: 'Health', href: '/services/health-services' },
  { label: 'Business', href: '/services/business' },
  { label: 'Social welfare', href: '/services/social-welfare' },
  { label: 'Departments', href: '/government/departments' },
  { label: 'About', href: '/about' },
];

/** Public LGU profile figures (PSA / DILG / PhilAtlas). */
const municipalityFacts: {
  label: string;
  value: string;
  note: string;
  accent?: boolean;
}[] = [
  {
    label: 'Population',
    value: '49,535',
    note: 'PSA 2024 census',
    accent: true,
  },
  {
    label: 'Land area',
    value: '118.33 km²',
    note: 'PSA land area',
  },
  {
    label: 'Barangays',
    value: '25',
    note: 'DILG Region V',
    accent: true,
  },
  {
    label: 'Density',
    value: '419 / km²',
    note: 'Based on 2024 census',
  },
  {
    label: 'Founded',
    value: '1949',
    note: 'Municipality of Ocampo',
  },
  {
    label: 'Postal code',
    value: '4419',
    note: 'Camarines Sur · Region V',
  },
];

export default function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || !isMeilisearchEnabled) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section className="relative w-full pt-8 pb-8 sm:pt-10 sm:pb-10">
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
          <div className="relative order-1 flex items-center justify-center lg:order-none lg:justify-center">
            <div
              aria-hidden="true"
              className="landing-rays pointer-events-none absolute top-1/2 left-1/2 size-[70rem] -translate-x-1/2 -translate-y-1/2"
            />
            <img
              src="/logos/png/BetterOcampo-Seal.png"
              alt="BetterOcampo"
              className="relative size-36 object-contain drop-shadow-xl sm:size-44 lg:size-56"
            />
          </div>

          <div className="order-2 min-w-0 text-center lg:order-none lg:text-left">
            <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-primary-200 bg-white/95 px-4 py-1 text-xs font-semibold text-primary-900 shadow-sm lg:justify-start">
              <ShieldCheck className="size-3.5 shrink-0 text-emerald-600" />
              <span>Independent community guide</span>
              <span className="text-gray-400">•</span>
              <span>Municipality of Ocampo</span>
              <span className="text-gray-400">•</span>
              <Link
                to="/about"
                className="font-bold text-primary-700 underline underline-offset-2"
              >
                Sources checked before publishing
              </Link>
            </div>

            <h1 className="mt-5 text-3xl tracking-tight text-gray-950 sm:text-5xl">
              Community-driven guide to{' '}
              <span className="text-primary-700">Ocampo</span>
            </h1>

            <p className="mt-4 max-w-2xl rounded-2xl border border-gray-200/80 bg-white/90 px-4 py-3 text-sm font-medium leading-relaxed text-gray-800 shadow-sm sm:text-base lg:mx-0">
              {t('hero.subtitle')}
            </p>

            <form
              onSubmit={onSearch}
              className="mt-6 max-w-2xl lg:mx-0"
              role="search"
            >
              <label htmlFor="home-search" className="sr-only">
                Search this guide
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="home-search"
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder={
                    isMeilisearchEnabled
                      ? 'Search services, departments, and guides'
                      : 'Browse services and government pages below'
                  }
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white/95 pr-28 pl-10 text-sm text-gray-900 shadow-sm outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-500/20"
                />
                {isMeilisearchEnabled ? (
                  <button
                    type="submit"
                    className="absolute top-1/2 right-1.5 inline-flex h-9 -translate-y-1/2 items-center gap-1 rounded-lg bg-primary-600 px-3 text-xs font-semibold text-white hover:bg-primary-700"
                  >
                    Search
                    <ArrowRight className="size-3.5" />
                  </button>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5 lg:justify-start">
                {quickLinks.map(link => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:border-primary-300 hover:text-primary-700"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </form>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {municipalityFacts.map(fact => (
            <Fact
              key={fact.label}
              label={fact.label}
              value={fact.value}
              note={fact.note}
              accent={fact.accent}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Fact({
  label,
  value,
  note,
  accent = false,
}: {
  label: string;
  value: string;
  note: string;
  accent?: boolean;
}) {
  return (
    <div className="civic-card-hover h-full rounded-xl border border-gray-200 bg-white/90 p-3.5 shadow-sm">
      <p className="text-[11px] font-medium tracking-wide text-gray-500 uppercase">
        {label}
      </p>
      <p
        className={`mt-1 text-xl font-bold ${accent ? 'text-primary-700' : 'text-gray-950'}`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-gray-500">{note}</p>
    </div>
  );
}
