export const REPORT_CATEGORIES = [
  'road',
  'bridge',
  'drainage',
  'streetlight',
  'garbage',
  'other',
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export const REPORT_STATUSES = [
  'received',
  'in_review',
  'resolved',
  'closed',
] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_VISIBILITIES = ['private', 'published'] as const;

export type ReportVisibility = (typeof REPORT_VISIBILITIES)[number];

export type ReportGeo = {
  lat: number;
  lng: number;
};

export type ReportContact = {
  name: string;
  phone: string;
  email: string;
};

export type Report = {
  referenceId: string;
  category: ReportCategory;
  description: string;
  barangay: string;
  landmark: string;
  geo: ReportGeo | null;
  photoPaths: string[];
  contact: ReportContact;
  status: ReportStatus;
  visibility: ReportVisibility;
  staffNote: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type PublishedReport = {
  referenceId: string;
  category: ReportCategory;
  description: string;
  barangay: string;
  landmark: string;
  geo: ReportGeo | null;
  photoPaths: string[];
  status: ReportStatus;
  staffNote: string;
  publishedAt: Date;
  updatedAt: Date;
};

export type CreateReportInput = {
  category: ReportCategory;
  description: string;
  barangay: string;
  landmark?: string;
  geo?: ReportGeo | null;
  contact?: Partial<ReportContact>;
  photos?: File[];
  /** Honeypot — must stay empty */
  website?: string;
};

export const REPORT_CATEGORY_LABELS: Record<ReportCategory, string> = {
  road: 'Road',
  bridge: 'Bridge',
  drainage: 'Drainage',
  streetlight: 'Streetlight',
  garbage: 'Garbage / waste',
  other: 'Other',
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  received: 'Received',
  in_review: 'In review',
  resolved: 'Resolved',
  closed: 'Closed',
};
