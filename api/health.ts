import type { VercelRequest, VercelResponse } from '@vercel/node';
import { methodNotAllowed } from './_lib/http';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    methodNotAllowed(res, ['GET']);
    return;
  }
  try {
    const { isAdminSdkConfigured, isStorageEnabled } =
      await import('./_lib/firebaseAdmin');
    res.status(200).json({
      ok: true,
      reporting: isAdminSdkConfigured(),
      storage: isStorageEnabled(),
      googleClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Firebase Admin failed to load.';
    res.status(200).json({
      ok: false,
      reporting: false,
      storage: false,
      googleClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
      error: message,
    });
  }
}
