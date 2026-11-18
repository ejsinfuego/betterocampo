import React, { useEffect, useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { mainNavigation } from '../../data/navigation';
import { LANGUAGES } from '../../i18n/languages';
import type { LanguageType } from '../../types/index';
import { cn } from '../../lib/utils';
import HeaderWeather from './HeaderWeather';

const LGU_FACEBOOK = 'https://www.facebook.com/101706771551898';

const LOCAL_HOTLINES = [
  { agency: 'PNP', number: '92077867646' },
  { agency: 'BFP', number: '9615193815' },
  { agency: 'RHU', number: '9122516900' },
  { agency: 'MDRRMO', number: '9475714857' },
];

const serviceLinks =
  mainNavigation.find(item => item.href === '/services')?.children ?? [];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const siteName = import.meta.env.VITE_GOVERNMENT_NAME || 'Better Ocampo';

  useEffect(() => {
    setIsOpen(false);
    setServicesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!servicesOpen && !isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setServicesOpen(false);
      setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [servicesOpen, isOpen]);

  const changeLanguage = (newLanguage: LanguageType) => {
    i18n.changeLanguage(newLanguage);
  };

  const isActive = (href: string) =>
    href === '/'
      ? location.pathname === '/'
      : location.pathname === href || location.pathname.startsWith(`${href}/`);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: t('navbar.needs'), href: '/needs' },
    { label: t('navbar.services'), href: '/services' },
    { label: t('navbar.government'), href: '/government' },
    { label: 'Projects', href: '/projects' },
    { label: 'About', href: '/about' },
  ];

  const linkClass = (active: boolean) =>
    cn(
      'inline-flex h-10 items-center border-b-2 px-0.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2',
      active
        ? 'border-primary-600 font-semibold text-primary-700'
        : 'border-transparent text-gray-700 hover:border-primary-600 hover:text-gray-950'
    );

  const languageSelect = (id: string) => (
    <>
      <label className="sr-only" htmlFor={id}>
        Language
      </label>
      <select
        id={id}
        value={i18n.language}
        onChange={event => changeLanguage(event.target.value as LanguageType)}
        className="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-900"
      >
        {Object.entries(LANGUAGES).map(([code, lang]) => (
          <option key={code} value={code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div id="hotlines" className="bg-primary-800 text-white">
          <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto whitespace-nowrap px-4 py-1.5 sm:px-6">
            <HeaderWeather />
            <div className="ml-auto flex shrink-0 items-center gap-3">
              {LOCAL_HOTLINES.map(({ agency, number }) => (
                <a
                  key={agency}
                  href={`tel:${number}`}
                  title={`${agency} hotline. Local Ocampo numbers are listed only after they are verified.`}
                  className="px-1 py-1 text-xs font-light text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:px-2"
                >
                  <span className="font-semibold">{agency}</span> {number}
                </a>
              ))}
              <a
                href="tel:911"
                title="National emergency hotline. Local Ocampo numbers are listed only after they are verified."
                className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-[#c8102e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span className="sm:hidden">911</span>
                <span className="hidden sm:inline">Emergency 911</span>
              </a>
              <a
                href={LGU_FACEBOOK}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden whitespace-nowrap rounded-md border border-white/40 px-2 py-1 text-xs text-white sm:inline"
              >
                Facebook Page
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            aria-label={`${siteName} home`}
          >
            <img
              src="/logos/png/BetterOcampo-Mark.png"
              alt=""
              className="h-9 w-auto shrink-0 object-contain sm:h-10"
            />
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-kapwa-serif font-extrabold text-[#1d4ed8] sm:text-lg">
                {siteName}
              </span>
              <span className="block truncate text-xs text-gray-600">
                Municipality of Ocampo, Camarines Sur
              </span>
            </span>
          </Link>

          <nav
            aria-label="Main navigation"
            className="ml-2 hidden items-center gap-4 lg:flex"
          >
            {navItems.map(item => {
              const active = isActive(item.href);
              if (item.href === '/services' && serviceLinks.length > 0) {
                return (
                  <div key={item.href} className="relative">
                    <button
                      type="button"
                      className={linkClass(active)}
                      aria-expanded={servicesOpen}
                      aria-haspopup="true"
                      onClick={() => setServicesOpen(open => !open)}
                    >
                      {item.label}
                      <ChevronDown className="ml-1 size-3.5" />
                    </button>
                    {servicesOpen ? (
                      <div className="absolute left-0 z-50 mt-1 w-64 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
                        <Link
                          to="/services"
                          className="block rounded-lg px-2.5 py-2 text-sm font-semibold text-gray-950 hover:bg-gray-50"
                        >
                          All services
                        </Link>
                        {serviceLinks.map(child => (
                          <Link
                            key={child.href}
                            to={child.href}
                            className="block rounded-lg px-2.5 py-2 text-sm text-primary- hover:bg-gray-50"
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
                  className={linkClass(active)}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/search"
              className={linkClass(isActive('/search'))}
              aria-current={isActive('/search') ? 'page' : undefined}
            >
              Search
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden md:block">
              {languageSelect('language-desktop')}
            </div>
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-lg border border-gray-200 px-2.5 text-sm text-gray-950 lg:hidden"
              onClick={() => setIsOpen(open => !open)}
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className="mr-1 size-4" />
              ) : (
                <Menu className="mr-1 size-4" />
              )}
              {isOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        {isOpen ? (
          <div className="border-t border-gray-200 lg:hidden">
            <nav aria-label="Mobile" className="mx-auto max-w-7xl px-4">
              {navItems.map(item => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex h-11 items-center border-b border-gray-200 text-sm',
                      active
                        ? 'font-semibold text-primary-700'
                        : 'text-gray-800'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <a
                href="tel:9475714857"
                className="flex h-11 items-center border-b border-gray-200 text-sm font-semibold text-[#c8102e]"
              >
                MDRRMO: 9475714857
              </a>
              <a
                href="tel:911"
                className="flex h-11 items-center border-b border-gray-200 text-sm font-semibold text-[#c8102e]"
              >
                Emergency 911
              </a>
              <a
                href={LGU_FACEBOOK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center border-b border-gray-200 text-sm text-gray-950"
              >
                LGU Facebook
              </a>
            </nav>
            {serviceLinks.length > 0 ? (
              <div className="mx-auto max-w-7xl px-4 py-3">
                <p className="text-sm font-semibold text-gray-950">Services</p>
                {serviceLinks.map(child => (
                  <Link
                    key={child.href}
                    to={child.href}
                    className="block py-2 text-sm text-gray-800"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : null}
            <div className="mx-auto max-w-7xl px-4 py-3 md:hidden">
              {languageSelect('language-mobile')}
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
};

export default Navbar;
