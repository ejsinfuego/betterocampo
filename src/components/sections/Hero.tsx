import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, Search, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { serviceCategories, governmentCategories } from '../../data/yamlLoader';
import { isMeilisearchEnabled } from '../../lib/meilisearch';

const quickLinks = [
  { label: 'Health', href: '/services/health-services' },
  { label: 'Business', href: '/services/business' },
  { label: 'Social welfare', href: '/services/social-welfare' },
  { label: 'Departments', href: '/government/departments' },
  { label: 'About', href: '/about' },
];

export default function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const siteName = import.meta.env.VITE_GOVERNMENT_NAME || 'Better Ocampo';
  const serviceCount = serviceCategories.categories.length;
  const governmentCount = governmentCategories.categories.length;

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || !isMeilisearchEnabled) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section className="relative w-full overflow-hidden border-b border-gray-200 pt-10 pb-14 sm:pt-14 sm:pb-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:28px_28px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white/80 to-white"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <img
              src="/ocampo-seal.png"
              alt={`Seal of the Municipality of Ocampo`}
              className="size-32 object-contain drop-shadow-xl sm:size-40 lg:size-48"
            />
          </div>

          <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-blue-200 bg-white/95 px-4 py-1 text-xs font-semibold text-blue-900 shadow-sm">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            <span>Independent community guide</span>
            <span className="text-gray-400">•</span>
            <span>Municipality of Ocampo</span>
            <span className="text-gray-400">•</span>
            <Link
              to="/about"
              className="font-bold text-blue-700 underline underline-offset-2"
            >
              Sources checked before publishing
            </Link>
          </div>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-gray-950 sm:text-5xl">
            The people&apos;s guide to{' '}
            <span className="text-blue-700">
              {siteName.replace(/^Better\s+/i, '')}
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-3xl rounded-2xl border border-gray-200/80 bg-white/90 px-4 py-3 text-sm font-medium leading-relaxed text-gray-800 shadow-sm sm:text-base">
            {t('hero.subtitle')}
          </p>
        </div>

        <form
          onSubmit={onSearch}
          className="mx-auto mt-8 max-w-3xl"
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
              className="h-12 w-full rounded-xl border border-gray-200 bg-white/95 pr-28 pl-10 text-sm text-gray-900 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
            {isMeilisearchEnabled ? (
              <button
                type="submit"
                className="absolute top-1/2 right-1.5 inline-flex h-9 -translate-y-1/2 items-center gap-1 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Search
                <ArrowRight className="size-3.5" />
              </button>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {quickLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-700"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </form>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Fact label="Province" value="Camarines Sur" note="Bicol Region V" />
          <Fact
            label="Postal code"
            value="4419"
            note="Municipal Hall, Ocampo"
          />
          <Link
            to="/services"
            className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Fact
              label="Service guides"
              value={String(serviceCount)}
              note="Citizen topics on this portal"
              accent
            />
          </Link>
          <Link
            to="/government"
            className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Fact
              label="Government sections"
              value={String(governmentCount)}
              note="Departments, news, and records"
              accent
            />
          </Link>
          <Fact
            label="Portal status"
            value="Community"
            note="Not the official LGU site"
          />
          <Fact
            label="Cost to residents"
            value="₱0"
            note="Volunteer-maintained"
          />
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
        className={`mt-1 text-xl font-bold ${accent ? 'text-blue-700' : 'text-gray-950'}`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-gray-500">{note}</p>
    </div>
  );
}
