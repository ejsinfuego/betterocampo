export const GA_MEASUREMENT_ID = 'G-38HDWR3F2H';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const nativePushState = history.pushState.bind(history);
const nativeReplaceState = history.replaceState.bind(history);
const nativeAddEventListener = window.addEventListener.bind(window);

let started = false;
let blockHistoryListeners = false;
let lastPagePath = '';
let previousLocation = document.referrer;
let activeLanguage = '';
let lastSearchTerm = '';

function installHistoryGuard() {
  window.addEventListener = ((
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) => {
    if (blockHistoryListeners && type === 'popstate') return;
    nativeAddEventListener(type, listener, options);
  }) as typeof window.addEventListener;

  // Router subscribes to popstate in this same commit. Block only listeners
  // added later, which is the Google tag's history page-view listener.
  window.setTimeout(() => {
    blockHistoryListeners = true;
  }, 0);

  const startedAt = Date.now();
  const timer = window.setInterval(() => {
    if (history.pushState !== nativePushState) {
      history.pushState = nativePushState;
    }
    if (history.replaceState !== nativeReplaceState) {
      history.replaceState = nativeReplaceState;
    }
    if (Date.now() - startedAt > 5000) window.clearInterval(timer);
  }, 100);
}

function ensureStarted() {
  if (started) return;
  started = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js reads the Arguments object, not a rest array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
  installHistoryGuard();

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

export function trackPageView(path: string) {
  if (path === lastPagePath) return;
  const isLanding = lastPagePath === '';
  lastPagePath = path;
  ensureStarted();

  const pageLocation = window.location.href;
  // The tag already records the first page when it loads. Later views are
  // sent from here, after the document title updates.
  if (!isLanding) {
    window.gtag?.('event', 'page_view', {
      page_title: document.title,
      page_location: pageLocation,
      page_path: path,
      page_referrer: previousLocation,
      send_to: GA_MEASUREMENT_ID,
    });
  }
  previousLocation = pageLocation;
}

export function setAnalyticsLanguage(language: string) {
  if (!language || language === activeLanguage) return;
  activeLanguage = language;
  ensureStarted();
  window.gtag?.('set', 'user_properties', { language });
}

export function trackLanguageChange(language: string) {
  if (!language || language === activeLanguage) return;
  activeLanguage = language;
  ensureStarted();
  window.gtag?.('set', 'user_properties', { language });
  window.gtag?.('event', 'language_change', {
    language,
    send_to: GA_MEASUREMENT_ID,
  });
}

export function trackSearch(term: string) {
  const searchTerm = term.trim();
  if (!searchTerm || searchTerm === lastSearchTerm) return;
  lastSearchTerm = searchTerm;
  ensureStarted();
  window.gtag?.('event', 'search', {
    search_term: searchTerm,
    send_to: GA_MEASUREMENT_ID,
  });
}
