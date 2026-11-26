import type {
  CreateReportInput,
  PublishedReport,
  Report,
  ReportStatus,
} from '../types/report';
import {
  isFirebaseConfigured,
  isFirebaseStorageEnabled,
  refreshReportingFlags,
} from './firebase';

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'same-origin',
    ...init,
    headers: {
      ...(init?.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...init?.headers,
    },
  });
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
  } & T;
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

function mapReport(raw: Record<string, unknown>): Report {
  return {
    referenceId: String(raw.referenceId || ''),
    category: raw.category as Report['category'],
    description: String(raw.description || ''),
    barangay: String(raw.barangay || ''),
    landmark: String(raw.landmark || ''),
    geo: (raw.geo as Report['geo']) ?? null,
    photoPaths: Array.isArray(raw.photoPaths)
      ? (raw.photoPaths as string[])
      : [],
    contact: {
      name: String((raw.contact as { name?: string } | undefined)?.name || ''),
      phone: String(
        (raw.contact as { phone?: string } | undefined)?.phone || ''
      ),
      email: String(
        (raw.contact as { email?: string } | undefined)?.email || ''
      ),
    },
    status: raw.status as ReportStatus,
    visibility: raw.visibility as Report['visibility'],
    staffNote: String(raw.staffNote || ''),
    createdAt: new Date(String(raw.createdAt || 0)),
    updatedAt: new Date(String(raw.updatedAt || 0)),
    deletedAt: raw.deletedAt ? new Date(String(raw.deletedAt)) : null,
  };
}

function mapPublished(raw: Record<string, unknown>): PublishedReport {
  return {
    referenceId: String(raw.referenceId || ''),
    category: raw.category as PublishedReport['category'],
    description: String(raw.description || ''),
    barangay: String(raw.barangay || ''),
    landmark: String(raw.landmark || ''),
    geo: (raw.geo as PublishedReport['geo']) ?? null,
    photoPaths: Array.isArray(raw.photoPaths)
      ? (raw.photoPaths as string[])
      : [],
    status: raw.status as ReportStatus,
    staffNote: String(raw.staffNote || ''),
    publishedAt: new Date(String(raw.publishedAt || 0)),
    updatedAt: new Date(String(raw.updatedAt || 0)),
  };
}

export async function createReport(
  input: CreateReportInput
): Promise<{ referenceId: string }> {
  await refreshReportingFlags();
  if (!isFirebaseConfigured) {
    throw new Error('Reporting is not available yet.');
  }

  // The create endpoint accepts JSON only. Photo bytes are not sent here.
  const { category, description, barangay, landmark, geo, contact, website } =
    input;
  return api<{ referenceId: string }>('/api/reports', {
    method: 'POST',
    body: JSON.stringify({
      category,
      description,
      barangay,
      landmark,
      geo,
      contact,
      website,
    }),
  });
}

export async function getReportByReferenceId(
  referenceId: string
): Promise<Report | null> {
  await refreshReportingFlags();
  if (!isFirebaseConfigured) return null;
  const id = referenceId.trim().toUpperCase();
  if (!id) return null;
  try {
    const data = await api<{ report: Record<string, unknown> }>(
      `/api/reports/${encodeURIComponent(id)}`
    );
    // Public track payload omits contact.
    return mapReport({
      ...data.report,
      contact: { name: '', phone: '', email: '' },
    });
  } catch (err) {
    if (err instanceof Error && /not found|unavailable/i.test(err.message)) {
      return null;
    }
    throw err;
  }
}

export async function listPublishedReports(): Promise<PublishedReport[]> {
  await refreshReportingFlags();
  if (!isFirebaseConfigured) return [];
  const data = await api<{ reports: Record<string, unknown>[] }>(
    '/api/reports/published'
  );
  return data.reports.map(mapPublished);
}

export async function listAdminReports(): Promise<Report[]> {
  const data = await api<{ reports: Record<string, unknown>[] }>(
    '/api/admin/reports'
  );
  return data.reports.map(mapReport);
}

export async function getAdminReport(
  referenceId: string
): Promise<Report | null> {
  const id = referenceId.trim().toUpperCase();
  try {
    const data = await api<{ report: Record<string, unknown> }>(
      `/api/admin/reports/${encodeURIComponent(id)}`
    );
    return mapReport(data.report);
  } catch (err) {
    if (err instanceof Error && /not found/i.test(err.message)) return null;
    throw err;
  }
}

export async function updateReportStatus(
  referenceId: string,
  status: ReportStatus,
  staffNote: string
): Promise<void> {
  await api(`/api/admin/reports/${encodeURIComponent(referenceId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, staffNote }),
  });
}

export async function publishReport(referenceId: string): Promise<void> {
  await api(`/api/admin/reports/${encodeURIComponent(referenceId)}/publish`, {
    method: 'POST',
    body: '{}',
  });
}

export async function unpublishReport(referenceId: string): Promise<void> {
  await api(`/api/admin/reports/${encodeURIComponent(referenceId)}/unpublish`, {
    method: 'POST',
    body: '{}',
  });
}

export async function softDeleteReport(referenceId: string): Promise<void> {
  await api(`/api/admin/reports/${encodeURIComponent(referenceId)}/delete`, {
    method: 'POST',
    body: '{}',
  });
}

export async function getPhotoUrls(paths: string[]): Promise<string[]> {
  if (!paths.length) return [];
  // Paths alone aren't enough — ask the API by reference id prefix.
  const match = paths[0]?.match(/^reports\/([^/]+)\//);
  if (!match) return [];
  const data = await api<{ urls: string[] }>(
    `/api/reports/${encodeURIComponent(match[1])}/photos`
  );
  return data.urls || [];
}

export {
  isFirebaseConfigured,
  isFirebaseStorageEnabled,
  refreshReportingFlags,
};
