import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAdminSdkConfigured } from '../_lib/firebaseAdmin';
import {
  badRequest,
  clientIp,
  methodNotAllowed,
  readJsonBody,
  serverError,
} from '../_lib/http';
import { takeToken } from '../_lib/rateLimit';
import {
  createReportRecord,
  isCategory,
  type ReportCategory,
  type ReportGeo,
} from '../_lib/reportsStore';

type CreateBody = {
  category?: string;
  description?: string;
  barangay?: string;
  landmark?: string;
  geo?: ReportGeo | null;
  contact?: { name?: string; phone?: string; email?: string };
  website?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }
  if (!isAdminSdkConfigured()) {
    res.status(503).json({ error: 'Reporting is not configured.' });
    return;
  }

  try {
    const limited = takeToken(`report:${clientIp(req)}`, 5, 15 * 60 * 1000);
    if (!limited.ok) {
      res.setHeader('Retry-After', String(limited.retryAfterSec));
      res.status(429).json({
        error: 'Please wait a few minutes before reporting another problem.',
      });
      return;
    }

    const body = readJsonBody<CreateBody>(req);

    // Honeypot — pretend success.
    if (body.website?.trim()) {
      res.status(200).json({ referenceId: 'OCP-IGNORED' });
      return;
    }

    if (!isCategory(body.category)) {
      badRequest(res, 'Invalid category.');
      return;
    }
    const description = (body.description || '').trim();
    const barangay = (body.barangay || '').trim();
    if (!description) {
      badRequest(res, 'Please describe the problem.');
      return;
    }
    if (description.length > 2000) {
      badRequest(res, 'Description must be 2000 characters or fewer.');
      return;
    }
    if (!barangay || barangay.length > 80) {
      badRequest(res, 'Please choose a barangay.');
      return;
    }

    let geo: ReportGeo | null = null;
    if (
      body.geo &&
      typeof body.geo.lat === 'number' &&
      typeof body.geo.lng === 'number'
    ) {
      geo = { lat: body.geo.lat, lng: body.geo.lng };
    }

    const result = await createReportRecord({
      category: body.category as ReportCategory,
      description,
      barangay,
      landmark: (body.landmark || '').trim().slice(0, 200),
      geo,
      contact: body.contact,
    });

    res.status(201).json(result);
  } catch (err) {
    serverError(res, err);
  }
}
