import type { VercelRequest, VercelResponse } from '@vercel/node';

const gatewayBase = (): string => {
  const url =
    process.env.AI_API_URL ||
    process.env.GEMINI_GATEWAY_URL ||
    'https://python-backend-270384591051.europe-west3.run.app';
  return url.replace(/\/$/, '');
};

const clientKey = (): string | null => {
  const key = process.env.GATEWAY_CLIENT_API_KEY || process.env.CLIENT_API_KEY || '';
  return key.trim() || null;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const key = clientKey();
  const headers: Record<string, string> = {};
  if (key) {
    headers['X-API-Key'] = key;
  }

  try {
    const upstream = await fetch(`${gatewayBase()}/api/maps/config`, {
      method: 'GET',
      headers,
    });
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.send(text);
  } catch {
    return res.status(502).json({ detail: 'Gateway unreachable' });
  }
}
