import type { VercelRequest, VercelResponse } from '@vercel/node';

export function methodNotAllowed(res: VercelResponse, allowed: string[]): void {
  res.setHeader('Allow', allowed.join(', '));
  res.status(405).json({ error: 'Method not allowed' });
}

export function badRequest(res: VercelResponse, message: string): void {
  res.status(400).json({ error: message });
}

export function unauthorized(
  res: VercelResponse,
  message = 'Unauthorized'
): void {
  res.status(401).json({ error: message });
}

export function forbidden(res: VercelResponse, message = 'Forbidden'): void {
  res.status(403).json({ error: message });
}

export function notFound(res: VercelResponse, message = 'Not found'): void {
  res.status(404).json({ error: message });
}

export function serverError(res: VercelResponse, err: unknown): void {
  const message = err instanceof Error ? err.message : 'Server error';
  console.error(err);
  res.status(500).json({ error: message });
}

export function readJsonBody<T>(req: VercelRequest): T {
  if (req.body == null) {
    throw new Error('Missing request body');
  }
  if (typeof req.body === 'string') {
    return JSON.parse(req.body) as T;
  }
  return req.body as T;
}

export function clientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}
