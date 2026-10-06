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

/**
 * Proxies Google Places / Street View / Static photos through the Python backend.
 *
 * Security contract:
 * - Never return Google URLs that embed API keys to the browser.
 * - mode=image|proxy  → stream image bytes (preferred)
 * - mode=json         → return a same-origin relative URL that streams via mode=image
 * - mode=redirect     → disabled (would leak key in Location header)
 *
 * GET /api/places/photo?name=...&lat=...&lng=...&mode=image|json
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const key = clientKey();
  if (!key) {
    return res.status(500).json({ detail: 'GATEWAY_CLIENT_API_KEY is not configured' });
  }

  const name = typeof req.query.name === 'string' ? req.query.name.trim() : '';
  if (!name) {
    return res.status(400).json({ detail: 'name is required' });
  }

  const lat = typeof req.query.lat === 'string' ? req.query.lat : undefined;
  const lng = typeof req.query.lng === 'string' ? req.query.lng : undefined;
  const mode = typeof req.query.mode === 'string' ? req.query.mode : 'image';

  // Never 302-redirect to Google (Location would expose key=)
  if (mode === 'redirect') {
    return res.status(400).json({
      detail: 'mode=redirect is disabled for security; use mode=image',
    });
  }

  // JSON clients get a same-origin stream URL — never the upstream Google URL
  if (mode === 'json') {
    const params = new URLSearchParams({ name, mode: 'image' });
    if (lat) params.set('lat', lat);
    if (lng) params.set('lng', lng);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).json({
      success: true,
      // Relative so the browser always hits this proxy (no Google key in client)
      url: `/api/places/photo?${params.toString()}`,
    });
  }

  // Stream image bytes straight from the gateway (single hop; the gateway hides
  // the keyed Google URL and returns image/* directly with mode=image, which is
  // also its default). This proxy never lets a keyed URL reach the browser.
  const params = new URLSearchParams({ name, mode: 'image' });
  if (lat) params.set('lat', lat);
  if (lng) params.set('lng', lng);

  try {
    const upstream = await fetch(`${gatewayBase()}/api/places/photo?${params.toString()}`, {
      method: 'GET',
      headers: {
        'X-API-Key': key,
      },
    });

    if (!upstream.ok) {
      // Do not forward upstream bodies that might include sensitive URLs
      return res.status(upstream.status).json({
        success: false,
        detail: 'Upstream photo lookup failed',
      });
    }

    const contentType = upstream.headers.get('content-type') || '';
    // Reject accidental HTML/JSON error pages; only stream real image bytes
    if (!contentType.startsWith('image/') && !contentType.includes('octet-stream')) {
      return res.status(404).json({ success: false, detail: 'No photo found' });
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(200).send(buffer);
  } catch {
    return res.status(502).json({ detail: 'Gateway unreachable' });
  }
}
