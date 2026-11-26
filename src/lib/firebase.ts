/**
 * Client Firebase SDK removed — reporting goes through /api (Admin SDK).
 * Kept as a thin capability probe so pages can gate UI.
 */

let cached:
  | { reporting: boolean; storage: boolean; googleClientId: boolean }
  | null
  | undefined;

export async function getReportingHealth(): Promise<{
  reporting: boolean;
  storage: boolean;
  googleClientId: boolean;
}> {
  if (cached !== undefined && cached !== null) return cached;
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      cached = { reporting: false, storage: false, googleClientId: false };
      return cached;
    }
    const data = (await res.json()) as {
      reporting?: boolean;
      storage?: boolean;
      googleClientId?: boolean;
    };
    cached = {
      reporting: Boolean(data.reporting),
      storage: Boolean(data.storage),
      googleClientId: Boolean(data.googleClientId),
    };
    return cached;
  } catch {
    cached = { reporting: false, storage: false, googleClientId: false };
    return cached;
  }
}

/** True when the server Admin SDK env is configured. */
export let isFirebaseConfigured = false;
export let isFirebaseStorageEnabled = false;

export async function refreshReportingFlags(): Promise<void> {
  const health = await getReportingHealth();
  isFirebaseConfigured = health.reporting;
  isFirebaseStorageEnabled = health.storage;
}

// Kick off a best-effort probe for modules that read the flags synchronously
// after first paint. Pages that care should await refreshReportingFlags().
void refreshReportingFlags();
