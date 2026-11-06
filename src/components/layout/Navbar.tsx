import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  CloudSun,
  ExternalLink,
  Globe,
  Info,
  Landmark,
  Menu,
  PhoneCall,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { mainNavigation } from '../../data/navigation';
import { LANGUAGES } from '../../i18n/languages';
import { isMeilisearchEnabled } from '../../lib/meilisearch';
import type { LanguageType } from '../../types/index';
import { cn } from '../../lib/utils';

const OFFICIAL_SITE = 'https://ocampo.camarinessur.gov.ph';
const OCAMPO_LAT = 13.5594;
const OCAMPO_LNG = 123.3761;

const serviceLinks =
  mainNavigation.find(item => item.href === '/services')?.children ?? [];

function LivePhtClock() {
  const [label, setLabel] = useState('Ocampo, Camarines Sur');

  useEffect(() => {
    if (window.innerWidth < 768) return;

    const dateFormatter = new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeFormatter = new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const update = () => {
      const now = new Date();
      setLabel(
        `${dateFormatter.format(now)} • ${timeFormatter.format(now)} PHT`
      );
    };

    update();
    const interval = window.setInterval(update, 30000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <span className="hidden items-center gap-1 font-mono text-[11px] text-blue-900 md:inline-flex">
      <Calendar className="size-3" />
      <Clock className="size-3" />
      {label}
    </span>
  );
}

function LiveWeather() {
  const [summary, setSummary] = useState('Ocampo, Camarines Sur');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${OCAMPO_LAT}&longitude=${OCAMPO_LNG}&current=temperature_2m&timezone=Asia%2FManila`
      )
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          const temp = Math.round(Number(data?.current?.temperature_2m));
          if (!Number.isNaN(temp)) {
            setSummary(`${temp}°C • Ocampo`);
          }
        })
        .catch(() => {});
    }, 1500);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <span className="inline-flex items-center gap-1 font-medium text-blue-900">
      <CloudSun className="size-3.5 text-amber-600" />
      {summary}
    </span>
  );
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const siteName = import.meta.env.VITE_GOVERNMENT_NAME || 'Better Ocampo';

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setServicesOpen(false);
    setGuideOpen(false);
  }, [location.pathname]);

  const changeLanguage = (newLanguage: LanguageType) => {
    i18n.changeLanguage(newLanguage);
  };

  const isActive = (href: string) =>
    href === '/'
      ? location.pathname === '/'
      : location.pathname === href || location.pathname.startsWith(`${href}/`);

  const navItems = [
    { label: 'Home', href: '/', icon: Building2 },
    { label: t('navbar.services'), href: '/services', icon: Briefcase },
    {
      label: t('navbar.government'),
      href: '/government',
      icon: Landmark,
    },
    { label: 'About', href: '/about', icon: Info },
  ];

  return (
    <>
      <div className="w-full max-w-full overflow-hidden bg-slate-950 text-slate-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-1.5 text-xs sm:gap-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 sm:gap-2">
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-amber-400">
              <PhoneCall className="size-3.5 animate-civic-pulse" />
              <span className="hidden sm:inline">Emergency:</span>
            </span>
            <a
              href="tel:911"
              title="National emergency hotline. Local Ocampo numbers are listed only after they are verified."
              className="inline-flex h-6 shrink-0 items-center gap-1 rounded-md border border-slate-800 bg-slate-900/90 px-2 font-mono text-[11px] font-semibold text-slate-100 hover:border-amber-500/50 hover:text-amber-300"
            >
              911
            </a>
            <span className="hidden truncate text-[11px] text-slate-400 lg:inline">
              Local hotlines appear here only after verification
            </span>
          </div>
          <a
            href={OFFICIAL_SITE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border border-blue-600/70 bg-blue-950/90 px-2.5 text-[11px] font-semibold text-blue-200 hover:bg-blue-900 hover:text-white"
          >
            <span className="hidden text-slate-300 sm:inline">
              Official Portal:
            </span>
            <span className="font-bold">ocampo.camarinessur.gov.ph</span>
            <ExternalLink className="size-3 text-blue-400" />
          </a>
        </div>
      </div>

      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-md transition-shadow',
          isScrolled ? 'shadow-md' : 'shadow-sm'
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2.5 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="group flex min-w-0 items-center gap-2.5"
            aria-label={`${siteName} home`}
          >
            <img
              src="/ocampo-seal.png"
              alt=""
              className="h-9 w-9 object-contain sm:h-10 sm:w-10"
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold tracking-tight text-gray-950 sm:text-base">
                {siteName}
              </span>
              <span className="hidden truncate text-[11px] text-gray-500 sm:block">
                {t('site_description')}
              </span>
            </span>
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-0.5 lg:flex"
          >
            {navItems.map(item => {
              const active = isActive(item.href);
              if (item.href === '/services' && serviceLinks.length > 0) {
                return (
                  <div key={item.href} className="relative">
                    <button
                      type="button"
                      className={cn(
                        'inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold',
                        active
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                      aria-expanded={servicesOpen}
                      onClick={() => setServicesOpen(open => !open)}
                    >
                      {item.label}
                      <ChevronDown className="size-3" />
                    </button>
                    {servicesOpen ? (
                      <div className="animate-civic-fade-up absolute left-0 z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
                        <Link
                          to="/services"
                          className="block rounded-lg px-2.5 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          All services
                        </Link>
                        {serviceLinks.map(child => (
                          <Link
                            key={child.href}
                            to={child.href}
                            className="block rounded-lg px-2.5 py-2 text-xs text-gray-700 hover:bg-gray-50"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'inline-flex h-8 items-center rounded-lg px-2.5 text-xs font-semibold',
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-950'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            {isMeilisearchEnabled ? (
              <Link
                to="/search"
                className={cn(
                  'inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold',
                  isActive('/search')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Search className="size-3.5" />
                Search
              </Link>
            ) : null}
          </nav>

          <div className="flex items-center gap-1.5">
            <label className="sr-only" htmlFor="language-desktop">
              Language
            </label>
            <select
              id="language-desktop"
              value={i18n.language}
              onChange={e => changeLanguage(e.target.value as LanguageType)}
              className="hidden h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-700 md:block"
            >
              {Object.entries(LANGUAGES).map(([code, lang]) => (
                <option key={code} value={code}>
                  {lang.nativeName}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-lg border border-gray-200 text-gray-700 lg:hidden"
              onClick={() => setIsOpen(open => !open)}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {isOpen ? (
          <div className="animate-civic-fade-up border-t border-gray-200 bg-white px-4 py-3 lg:hidden">
            <nav className="grid grid-cols-2 gap-1.5" aria-label="Mobile">
              {navItems.map(item => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold',
                      active
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-200 bg-white text-gray-800'
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            {serviceLinks.length > 0 ? (
              <div className="mt-3 space-y-1 border-t border-gray-200 pt-3">
                <p className="px-1 text-xs font-bold text-gray-900">Services</p>
                {serviceLinks.map(child => (
                  <Link
                    key={child.href}
                    to={child.href}
                    className="block rounded-lg px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : null}
            <div className="mt-3 flex items-center gap-2 border-t border-gray-200 pt-3">
              <Globe className="size-4 text-gray-500" />
              <select
                value={i18n.language}
                onChange={e => changeLanguage(e.target.value as LanguageType)}
                className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs"
              >
                {Object.entries(LANGUAGES).map(([code, lang]) => (
                  <option key={code} value={code}>
                    {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}
      </header>

      <div className="w-full border-b border-blue-200/70 bg-blue-50/90 text-blue-950">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 text-xs sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-left text-xs font-semibold text-blue-950 hover:bg-blue-100/70"
          >
            <ShieldAlert className="size-3.5 text-amber-600" />
            <span className="underline decoration-blue-400/60 underline-offset-2">
              Community Guide
            </span>
            <span className="hidden font-normal text-blue-800/80 sm:inline">
              • Independent public guide
            </span>
          </button>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <LiveWeather />
            <LivePhtClock />
            <Link
              to="/about"
              className="inline-flex items-center gap-1 font-semibold text-emerald-800 underline underline-offset-2"
            >
              <CheckCircle2 className="size-3.5" />
              How we publish
            </Link>
          </div>
        </div>
      </div>

      {guideOpen ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/50 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="community-guide-title"
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl"
          >
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600" />
              <h2
                id="community-guide-title"
                className="text-lg font-bold text-gray-950"
              >
                About this community guide
              </h2>
            </div>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-gray-600">
              <p>
                <strong className="text-gray-900">{siteName}</strong> is an
                independent community transparency portal for the Municipality
                of Ocampo, Camarines Sur.
              </p>
              <p>
                This website is not the official LGU site. Official transactions
                stay on{' '}
                <a
                  href={OFFICIAL_SITE}
                  className="font-medium text-blue-700 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ocampo.camarinessur.gov.ph
                </a>
                .
              </p>
              <p>
                Local fees, schedules, and hotlines stay off these pages until
                they can be checked against a public source.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setGuideOpen(false)}
                className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700"
              >
                Close
              </button>
              <Link
                to="/about"
                className="rounded-xl bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white"
              >
                Read About
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Navbar;
