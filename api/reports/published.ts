import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAdminSdkConfigured } from '../_lib/firebaseAdmin.js';
import { methodNotAllowed, serverError } from '../_lib/http.js';
import { listPublished } from '../_lib/reportsStore.js';

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
    const reports = await listPublished();
    res.status(200).json({ reports });
  } catch (err) {
    serverError(res, err);
  }
}
