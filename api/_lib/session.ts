import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OAuth2Client } from 'google-auth-library';
import { SignJWT, jwtVerify } from 'jose';
import { adminDb } from './firebaseAdmin.js';

const COOKIE_NAME = 'bo_admin_session';
const MAX_AGE_SEC = 60 * 60 * 24 * 7;

export type AdminSession = {
  sub: string;
  email: string;
};

function sessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('SESSION_SECRET must be set (16+ characters).');
  }
  return new TextEncoder().encode(secret);
}

function googleClientId(): string {
  const id = process.env.GOOGLE_CLIENT_ID;
  if (!id) throw new Error('GOOGLE_CLIENT_ID is not configured.');
  return id;
}

export async function verifyGoogleIdToken(
  idToken: string
): Promise<AdminSession> {
  const client = new OAuth2Client(googleClientId());
  const ticket = await client.verifyIdToken({
    idToken,
    audience: googleClientId(),
  });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new Error('Google token missing subject or email.');
  }
  if (payload.email_verified === false) {
    throw new Error('Google email is not verified.');
  }
  return { sub: payload.sub, email: payload.email };
}

export async function isAllowlistedAdmin(
  session: AdminSession
): Promise<boolean> {
  const db = adminDb();
  const bySub = await db.collection('admins').doc(session.sub).get();
  if (bySub.exists) return true;

  const byEmail = await db.collection('admins').doc(session.email).get();
  if (byEmail.exists) return true;

  // Legacy Firebase Auth UID docs: operators may have seeded by Firebase UID.
  // Also accept a stable hash doc for migration notes — email is preferred.
  return false;
}

export async function createSessionCookie(
  res: VercelResponse,
  session: AdminSession
): Promise<void> {
  const token = await new SignJWT({
    email: session.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(session.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SEC}s`)
    .sign(sessionSecret());

  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SEC}${secure}`
  );
}

export function clearSessionCookie(res: VercelResponse): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
  );
}

function readCookie(req: VercelRequest, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  const parts = header.split(';');
  for (const part of parts) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

export async function readAdminSession(
  req: VercelRequest
): Promise<AdminSession | null> {
  const token = readCookie(req, COOKIE_NAME);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    const sub = payload.sub;
    const email = typeof payload.email === 'string' ? payload.email : null;
    if (!sub || !email) return null;
    return { sub, email };
  } catch {
    return null;
  }
}

export async function requireAdmin(req: VercelRequest): Promise<AdminSession> {
  const session = await readAdminSession(req);
  if (!session) {
    throw Object.assign(new Error('Not signed in'), { status: 401 });
  }
  const allowed = await isAllowlistedAdmin(session);
  if (!allowed) {
    throw Object.assign(new Error('Not on the admin allowlist'), {
      status: 403,
    });
  }
  return session;
}
