import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import i18n from '../i18n';
import {
  setAnalyticsLanguage,
  trackLanguageChange,
  trackPageView,
} from '../lib/analytics';

export default function Analytics() {
  const { pathname, search } = useLocation();
  const trackedPathname = useRef<string | null>(null);

  useEffect(() => {
    if (trackedPathname.current === pathname) return;
    trackedPathname.current = pathname;
    trackPageView(`${pathname}${search}`);
  }, [pathname, search]);

  useEffect(() => {
    setAnalyticsLanguage(i18n.resolvedLanguage || i18n.language);

    const onLanguageChanged = (language: string) => {
      trackLanguageChange(language);
    };

    i18n.on('languageChanged', onLanguageChanged);
    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, []);

  return null;
}
