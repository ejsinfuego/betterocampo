import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAdminSdkConfigured } from '../../_lib/firebaseAdmin.js';
import { methodNotAllowed, notFound, serverError } from '../../_lib/http.js';
import { getLiveReport, signedPhotoUrls } from '../../_lib/reportsStore.js';

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
    const report = await getLiveReport(referenceId);
    if (!report) {
      notFound(res, 'Report not found.');
      return;
    }
    const urls = await signedPhotoUrls(report.photoPaths);
    res.status(200).json({ urls });
  } catch (err) {
    serverError(res, err);
  }
}
