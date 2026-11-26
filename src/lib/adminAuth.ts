import {
  getReportingHealth,
  isFirebaseConfigured,
  refreshReportingFlags,
} from './firebase';

export type AdminUser = {
  email: string;
  sub: string;
};

export class AdminNotAllowlistedError extends Error {
  uid: string;
  email: string | null;

  constructor(sub: string, email: string | null, message?: string) {
    super(
      message ||
        `This Google account is not on the admin allowlist. In Firestore, create admins/${email || 'your-email'} (preferred) or admins/${sub} with an empty document.`
    );
    this.name = 'AdminNotAllowlistedError';
    this.uid = sub;
    this.email = email;
  }
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: (
            momentListener?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              getNotDisplayedReason: () => string;
            }) => void
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

function loadGisScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-google-gis="true"]'
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () =>
        reject(new Error('Failed to load Google Identity Services'))
      );
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleGis = 'true';
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
}

async function googleClientId(): Promise<string> {
  const fromEnv = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  if (fromEnv) return fromEnv;
  throw new Error(
    'Set VITE_GOOGLE_CLIENT_ID to your Google OAuth Web Client ID.'
  );
}

function requestGoogleIdToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.id) {
      reject(new Error('Google Identity Services is not available.'));
      return;
    }
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: response => {
        if (!response.credential) {
          reject(new Error('Google sign-in returned no credential.'));
          return;
        }
        resolve(response.credential);
      },
    });
    window.google.accounts.id.prompt(notification => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        reject(
          new Error(
            `Google sign-in was not shown (${notification.getNotDisplayedReason?.() || 'skipped'}). Allow popups / third-party cookies and try again.`
          )
        );
      }
    });
  });
}

export async function signInAdminWithGoogle(): Promise<AdminUser> {
  await refreshReportingFlags();
  if (!isFirebaseConfigured) {
    throw new Error('Reporting is not configured on the server.');
  }
  const health = await getReportingHealth();
  if (!health.googleClientId && !import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    throw new Error(
      'Google sign-in is not configured. Set GOOGLE_CLIENT_ID (server) and VITE_GOOGLE_CLIENT_ID (client).'
    );
  }

  await loadGisScript();
  const clientId = await googleClientId();
  const idToken = await requestGoogleIdToken(clientId);

  const res = await fetch('/api/admin/session', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const data = (await res.json()) as {
    error?: string;
    admin?: boolean;
    user?: AdminUser;
  };
  if (res.status === 403) {
    throw new AdminNotAllowlistedError(
      data.user?.sub || 'unknown',
      data.user?.email || null,
      data.error
    );
  }
  if (!res.ok || !data.admin || !data.user) {
    throw new Error(data.error || 'Sign-in failed.');
  }
  return data.user;
}

export async function signOutAdmin(): Promise<void> {
  await fetch('/api/admin/session', {
    method: 'DELETE',
    credentials: 'same-origin',
  });
}

export function subscribeAdminAuth(
  callback: (user: AdminUser | null, isAdmin: boolean) => void
): () => void {
  let cancelled = false;

  const tick = async () => {
    await refreshReportingFlags();
    if (!isFirebaseConfigured) {
      if (!cancelled) callback(null, false);
      return;
    }
    try {
      const res = await fetch('/api/admin/session', {
        credentials: 'same-origin',
      });
      const data = (await res.json()) as {
        admin?: boolean;
        user?: AdminUser | null;
      };
      if (!cancelled) {
        callback(
          data.admin && data.user ? data.user : null,
          Boolean(data.admin)
        );
      }
    } catch {
      if (!cancelled) callback(null, false);
    }
  };

  void tick();
  const interval = window.setInterval(() => void tick(), 60_000);
  return () => {
    cancelled = true;
    window.clearInterval(interval);
  };
}
