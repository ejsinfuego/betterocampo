import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { isMeilisearchEnabled } from '../../lib/meilisearch';
import HairlineLedgers from '../hairline/HairlineLedgers';

const quickLinks = [
  { label: 'Health', href: '/services/health-services' },
  { label: 'Business', href: '/services/business' },
  { label: 'Social welfare', href: '/services/social-welfare' },
  { label: 'Departments', href: '/government/departments' },
  { label: 'About', href: '/about' },
];

/** Public LGU profile figures (PSA / DILG / PhilAtlas). */
const municipalityFacts: { label: string; value: string; note: string }[] = [
  {
    label: 'Population',
    value: '49,535',
    note: 'PSA 2024 census',
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
    <section className="font-inter relative w-full pt-10 pb-12 selection:bg-primary-200 selection:text-gray-950 sm:pt-14 sm:pb-16">
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)] lg:items-start lg:gap-x-8 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)] xl:gap-x-10">
          <div className="animate-civic-fade-up max-w-2xl xl:max-w-3xl">
            <h1 className="max-w-[14ch] text-[2.75rem] leading-[1.02] tracking-tight text-balance text-gray-950 sm:text-6xl lg:text-7xl">
              Community-driven guide to{' '}
              <span className="text-primary-800">Ocampo</span>
            </h1>

            <p className="mt-5 max-w-[58ch] text-base leading-relaxed text-gray-800 sm:text-lg">
              {t('hero.subtitle')}
            </p>
            <p className="mt-2.5 max-w-[58ch] text-base leading-relaxed text-gray-800">
              Independent community guide.{' '}
              <Link
                to="/about"
                className="font-semibold text-primary-800 underline decoration-primary-300 underline-offset-4 hover:decoration-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
              >
                Sources checked before publishing
              </Link>
              .
            </p>

            <form onSubmit={onSearch} className="mt-7" role="search">
              <label htmlFor="home-search" className="sr-only">
                Search this guide
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-gray-700" />
                <input
                  id="home-search"
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder={
                    isMeilisearchEnabled
                      ? 'Search services and guides'
                      : 'Browse the guides below'
                  }
                  className={`h-14 w-full rounded-2xl border border-gray-300 bg-white pl-11 text-base text-gray-950 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] caret-primary-700 outline-none placeholder:text-gray-700 focus:border-primary-600 focus:ring-2 focus:ring-primary-500/25 ${
                    isMeilisearchEnabled ? 'pr-32' : 'pr-4'
                  }`}
                />
                {isMeilisearchEnabled ? (
                  <button
                    type="submit"
                    className="absolute top-1/2 right-2 inline-flex h-10 -translate-y-1/2 items-center gap-1 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                  >
                    Search
                    <ArrowRight className="size-4" />
                  </button>
                ) : null}
              </div>
              <nav
                aria-label="Common guides"
                className="mt-1 flex flex-wrap gap-x-5"
              >
                {quickLinks.map(link => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="inline-flex min-h-11 items-center text-base font-semibold text-primary-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </form>
          </div>
          <HairlineLedgers className="mx-auto mt-8 w-full max-w-md lg:mx-0 lg:mt-1 lg:max-w-none" />
        </div>

        <div className="mt-12 border-t border-primary-200 pt-8 sm:mt-14">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10 lg:gap-12">
            <img
              src="/logos/png/BetterOcampo-Seal.png"
              alt="Better Ocampo"
              className="mx-auto w-28 shrink-0 drop-shadow-[0_18px_28px_rgba(0,56,168,0.18)] sm:mx-0 sm:w-36"
            />
            <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:gap-x-8 xl:grid-cols-6">
              {municipalityFacts.map(fact => (
                <Fact
                  key={fact.label}
                  label={fact.label}
                  value={fact.value}
                  note={fact.note}
                />
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function Fact({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-sm font-semibold text-gray-950">{label}</dt>
      <dd className="mt-1 text-2xl leading-none font-semibold text-primary-900 tabular-nums">
        {value}
        <span className="mt-1.5 block text-sm leading-snug font-normal text-gray-700">
          {note}
        </span>
      </dd>
    </div>
  );
}
