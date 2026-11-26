import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAdminSdkConfigured } from '../../_lib/firebaseAdmin.js';
import {
  forbidden,
  methodNotAllowed,
  serverError,
  unauthorized,
} from '../../_lib/http.js';
import { listAdminReports } from '../../_lib/reportsStore.js';
import { requireAdmin } from '../../_lib/session.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    methodNotAllowed(res, ['GET']);
    return;
  }
  if (!isAdminSdkConfigured()) {
    res.status(503).json({ error: 'Reporting is not configured.' });
    return;
  }
  try {
    await requireAdmin(req);
    const reports = await listAdminReports(false);
    res.status(200).json({ reports });
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
