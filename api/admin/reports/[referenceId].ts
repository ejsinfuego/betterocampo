import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAdminSdkConfigured } from '../../_lib/firebaseAdmin';
import {
  badRequest,
  forbidden,
  methodNotAllowed,
  notFound,
  readJsonBody,
  serverError,
  unauthorized,
} from '../../_lib/http';
import {
  getLiveReport,
  isStatus,
  updateStatus,
  type ReportStatus,
} from '../../_lib/reportsStore';
import { requireAdmin } from '../../_lib/session';

async function withAdmin(
  req: VercelRequest,
  res: VercelResponse,
  run: () => Promise<void>
) {
  try {
    await requireAdmin(req);
    await run();
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAdminSdkConfigured()) {
    res.status(503).json({ error: 'Reporting is not configured.' });
    return;
  }

  const referenceId = String(req.query.referenceId || '')
    .trim()
    .toUpperCase();

  if (req.method === 'GET') {
    await withAdmin(req, res, async () => {
      const report = await getLiveReport(referenceId);
      if (!report) {
        notFound(res, 'Report not found.');
        return;
      }
      res.status(200).json({ report });
    });
    return;
  }

  if (req.method === 'PATCH') {
    await withAdmin(req, res, async () => {
      const body = readJsonBody<{ status?: string; staffNote?: string }>(req);
      if (!isStatus(body.status)) {
        badRequest(res, 'Invalid status.');
        return;
      }
      const existing = await getLiveReport(referenceId);
      if (!existing) {
        notFound(res, 'Report not found.');
        return;
      }
      await updateStatus(
        referenceId,
        body.status as ReportStatus,
        body.staffNote || ''
      );
      const report = await getLiveReport(referenceId);
      res.status(200).json({ report });
    });
    return;
  }

  methodNotAllowed(res, ['GET', 'PATCH']);
}
