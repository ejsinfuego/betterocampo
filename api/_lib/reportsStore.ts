import { FieldValue, type Timestamp } from 'firebase-admin/firestore';
import { adminBucket, adminDb, isStorageEnabled } from './firebaseAdmin.js';

export const REPORT_CATEGORIES = [
  'road',
  'bridge',
  'drainage',
  'streetlight',
  'garbage',
  'other',
] as const;

export const REPORT_STATUSES = [
  'received',
  'in_review',
  'resolved',
  'closed',
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export type ReportGeo = { lat: number; lng: number };
export type ReportContact = { name: string; phone: string; email: string };

export type ReportRecord = {
  referenceId: string;
  category: ReportCategory;
  description: string;
  barangay: string;
  landmark: string;
  geo: ReportGeo | null;
  photoPaths: string[];
  contact: ReportContact;
  status: ReportStatus;
  visibility: 'private' | 'published';
  staffNote: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type PublishedRecord = {
  referenceId: string;
  category: ReportCategory;
  description: string;
  barangay: string;
  landmark: string;
  geo: ReportGeo | null;
  photoPaths: string[];
  status: ReportStatus;
  staffNote: string;
  publishedAt: string;
  updatedAt: string;
};

type FirestoreReport = {
  referenceId: string;
  category: ReportCategory;
  description: string;
  barangay: string;
  landmark: string;
  geo: ReportGeo | null;
  photoPaths: string[];
  contact: ReportContact;
  status: ReportStatus;
  visibility: 'private' | 'published';
  staffNote: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  deletedAt: Timestamp | null;
};

function toIso(value: Timestamp | null | undefined): string {
  if (!value) return new Date(0).toISOString();
  return value.toDate().toISOString();
}

function mapReport(data: FirestoreReport): ReportRecord {
  return {
    referenceId: data.referenceId,
    category: data.category,
    description: data.description,
    barangay: data.barangay,
    landmark: data.landmark || '',
    geo: data.geo ?? null,
    photoPaths: data.photoPaths || [],
    contact: {
      name: data.contact?.name || '',
      phone: data.contact?.phone || '',
      email: data.contact?.email || '',
    },
    status: data.status,
    visibility: data.visibility,
    staffNote: data.staffNote || '',
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
    deletedAt: data.deletedAt ? toIso(data.deletedAt) : null,
  };
}

function publicTrackView(report: ReportRecord): Omit<ReportRecord, 'contact'> {
  return {
    referenceId: report.referenceId,
    category: report.category,
    description: report.description,
    barangay: report.barangay,
    landmark: report.landmark,
    geo: report.geo,
    photoPaths: report.photoPaths,
    status: report.status,
    visibility: report.visibility,
    staffNote: report.staffNote,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    deletedAt: report.deletedAt,
  };
}

export function generateReferenceId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const code = Array.from(bytes, b => (b % 36).toString(36))
    .join('')
    .toUpperCase();
  return `OCP-${code}`;
}

export function isCategory(value: unknown): value is ReportCategory {
  return (
    typeof value === 'string' &&
    (REPORT_CATEGORIES as readonly string[]).includes(value)
  );
}

export function isStatus(value: unknown): value is ReportStatus {
  return (
    typeof value === 'string' &&
    (REPORT_STATUSES as readonly string[]).includes(value)
  );
}

export async function createReportRecord(input: {
  category: ReportCategory;
  description: string;
  barangay: string;
  landmark?: string;
  geo?: ReportGeo | null;
  contact?: Partial<ReportContact>;
  photos?: Array<{ buffer: Buffer; contentType: string; ext: string }>;
}): Promise<{ referenceId: string }> {
  const referenceId = generateReferenceId();
  const photoPaths: string[] = [];

  if (isStorageEnabled() && input.photos?.length) {
    const bucket = adminBucket();
    for (let i = 0; i < input.photos.length; i += 1) {
      const photo = input.photos[i];
      const path = `reports/${referenceId}/${i + 1}.${photo.ext}`;
      const file = bucket.file(path);
      await file.save(photo.buffer, {
        contentType: photo.contentType,
        resumable: false,
        metadata: { cacheControl: 'private, max-age=3600' },
      });
      photoPaths.push(path);
    }
  }

  await adminDb()
    .collection('reports')
    .doc(referenceId)
    .set({
      referenceId,
      category: input.category,
      description: input.description,
      barangay: input.barangay,
      landmark: input.landmark || '',
      geo: input.geo ?? null,
      photoPaths,
      contact: {
        name: input.contact?.name?.trim() || '',
        phone: input.contact?.phone?.trim() || '',
        email: input.contact?.email?.trim() || '',
      },
      status: 'received',
      visibility: 'private',
      staffNote: '',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      deletedAt: null,
    });

  return { referenceId };
}

export async function getLiveReport(
  referenceId: string
): Promise<ReportRecord | null> {
  const id = referenceId.trim().toUpperCase();
  if (!id) return null;
  const snap = await adminDb().collection('reports').doc(id).get();
  if (!snap.exists) return null;
  const report = mapReport(snap.data() as FirestoreReport);
  if (report.deletedAt) return null;
  return report;
}

/** Public track response — never includes contact. */
export async function getTrackReport(referenceId: string) {
  const report = await getLiveReport(referenceId);
  if (!report) return null;
  return publicTrackView(report);
}

export async function listPublished(): Promise<PublishedRecord[]> {
  const snap = await adminDb()
    .collection('publishedReports')
    .orderBy('publishedAt', 'desc')
    .get();
  return snap.docs.map(doc => {
    const data = doc.data();
    return {
      referenceId: data.referenceId,
      category: data.category,
      description: data.description,
      barangay: data.barangay,
      landmark: data.landmark || '',
      geo: data.geo ?? null,
      photoPaths: data.photoPaths || [],
      status: data.status,
      staffNote: data.staffNote || '',
      publishedAt: toIso(data.publishedAt),
      updatedAt: toIso(data.updatedAt),
    };
  });
}

export async function listAdminReports(
  includeDeleted = false
): Promise<ReportRecord[]> {
  const snap = await adminDb()
    .collection('reports')
    .orderBy('createdAt', 'desc')
    .get();
  const reports = snap.docs.map(doc =>
    mapReport(doc.data() as FirestoreReport)
  );
  if (includeDeleted) return reports;
  return reports.filter(r => !r.deletedAt);
}

export async function updateStatus(
  referenceId: string,
  status: ReportStatus,
  staffNote: string
): Promise<void> {
  const db = adminDb();
  const note = staffNote.trim();
  await db.collection('reports').doc(referenceId).update({
    status,
    staffNote: note,
    updatedAt: FieldValue.serverTimestamp(),
  });
  const published = await db
    .collection('publishedReports')
    .doc(referenceId)
    .get();
  if (published.exists) {
    await published.ref.update({
      status,
      staffNote: note,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

export async function publishReport(referenceId: string): Promise<void> {
  const report = await getLiveReport(referenceId);
  if (!report) throw new Error('Report not found.');
  const db = adminDb();
  await db.collection('publishedReports').doc(referenceId).set({
    referenceId: report.referenceId,
    category: report.category,
    description: report.description,
    barangay: report.barangay,
    landmark: report.landmark,
    geo: report.geo,
    photoPaths: report.photoPaths,
    status: report.status,
    staffNote: report.staffNote,
    publishedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  await db.collection('reports').doc(referenceId).update({
    visibility: 'published',
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function unpublishReport(referenceId: string): Promise<void> {
  const db = adminDb();
  await db.collection('publishedReports').doc(referenceId).delete();
  await db.collection('reports').doc(referenceId).update({
    visibility: 'private',
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function softDeleteReport(referenceId: string): Promise<void> {
  const db = adminDb();
  const published = await db
    .collection('publishedReports')
    .doc(referenceId)
    .get();
  if (published.exists) await published.ref.delete();
  await db.collection('reports').doc(referenceId).update({
    deletedAt: FieldValue.serverTimestamp(),
    visibility: 'private',
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function signedPhotoUrls(paths: string[]): Promise<string[]> {
  if (!isStorageEnabled() || paths.length === 0) return [];
  const bucket = adminBucket();
  const expires = Date.now() + 60 * 60 * 1000;
  return Promise.all(
    paths.map(async path => {
      const [url] = await bucket.file(path).getSignedUrl({
        action: 'read',
        expires,
      });
      return url;
    })
  );
}
