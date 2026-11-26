import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAdminSdkConfigured } from '../_lib/firebaseAdmin.js';
import { methodNotAllowed, notFound, serverError } from '../_lib/http.js';
import { getTrackReport } from '../_lib/reportsStore.js';

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
    const referenceId = String(req.query.referenceId || '');
    const report = await getTrackReport(referenceId);
    if (!report) {
      notFound(
        res,
        'No Report found for that Reference ID (or it is unavailable).'
      );
      return;
    }
    res.status(200).json({ report });
  } catch (err) {
    serverError(res, err);
  }
}
