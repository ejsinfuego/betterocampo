import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAdminSdkConfigured, isStorageEnabled } from './_lib/firebaseAdmin';
import { methodNotAllowed } from './_lib/http';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    methodNotAllowed(res, ['GET']);
    return;
  }
  res.status(200).json({
    ok: true,
    reporting: isAdminSdkConfigured(),
    storage: isStorageEnabled(),
    googleClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
  });
}
