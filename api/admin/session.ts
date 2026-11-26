import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAdminSdkConfigured } from '../_lib/firebaseAdmin';
import {
  badRequest,
  methodNotAllowed,
  readJsonBody,
  serverError,
  unauthorized,
} from '../_lib/http';
import {
  clearSessionCookie,
  createSessionCookie,
  isAllowlistedAdmin,
  readAdminSession,
  verifyGoogleIdToken,
} from '../_lib/session';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAdminSdkConfigured()) {
    res.status(503).json({ error: 'Reporting is not configured.' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const session = await readAdminSession(req);
      if (!session) {
        res.status(200).json({ admin: false, user: null });
        return;
      }
      const allowed = await isAllowlistedAdmin(session);
      res.status(200).json({
        admin: allowed,
        user: allowed ? { email: session.email, sub: session.sub } : null,
      });
      return;
    }

    if (req.method === 'DELETE') {
      clearSessionCookie(res);
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method === 'POST') {
      const body = readJsonBody<{ idToken?: string }>(req);
      if (!body.idToken?.trim()) {
        badRequest(res, 'Missing Google ID token.');
        return;
      }
      const session = await verifyGoogleIdToken(body.idToken.trim());
      const allowed = await isAllowlistedAdmin(session);
      if (!allowed) {
        clearSessionCookie(res);
        res.status(403).json({
          error: `This Google account is not on the admin allowlist. In Firestore, create admins/${session.email} (preferred) or admins/${session.sub} with an empty document.`,
          user: { email: session.email, sub: session.sub },
        });
        return;
      }
      await createSessionCookie(res, session);
      res.status(200).json({
        admin: true,
        user: { email: session.email, sub: session.sub },
      });
      return;
    }

    methodNotAllowed(res, ['GET', 'POST', 'DELETE']);
  } catch (err) {
    if (err instanceof Error && /token|audience|Google/i.test(err.message)) {
      unauthorized(res, err.message);
      return;
    }
    serverError(res, err);
  }
}
