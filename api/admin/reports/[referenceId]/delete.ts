import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAdminSdkConfigured } from '../../../_lib/firebaseAdmin';
import {
  forbidden,
  methodNotAllowed,
  serverError,
  unauthorized,
} from '../../../_lib/http';
import { softDeleteReport } from '../../../_lib/reportsStore';
import { requireAdmin } from '../../../_lib/session';

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
    await requireAdmin(req);
    const referenceId = String(req.query.referenceId || '')
      .trim()
      .toUpperCase();
    await softDeleteReport(referenceId);
    res.status(200).json({ ok: true });
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 401) {
      unauthorized(res, err instanceof Error ? err.message : 'Unauthorized');
      return;
    }
    if (status === 403) {
      forbidden(res, err instanceof Error ? err.message : 'Forbidden');
      return;
    }
    serverError(res, err);
  }
}
