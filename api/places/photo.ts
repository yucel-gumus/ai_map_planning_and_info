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

  // Default: resolve upstream once, stream bytes to client
  const params = new URLSearchParams({ name });
  if (lat) params.set('lat', lat);
  if (lng) params.set('lng', lng);

  try {
    const upstream = await fetch(`${gatewayBase()}/api/places/photo?${params.toString()}`, {
      method: 'GET',
      headers: {
        'X-API-Key': key,
        Accept: 'application/json',
      },
    });

    const text = await upstream.text();
    let data: { success?: boolean; url?: string | null; detail?: string } = {};
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({ detail: 'Invalid upstream response' });
    }

    if (!upstream.ok) {
      // Do not forward upstream bodies that might include sensitive URLs
      return res.status(upstream.status).json({
        success: false,
        detail: typeof data?.detail === 'string' ? data.detail : 'Upstream photo lookup failed',
      });
    }

    const photoUrl = data?.url;
    if (!photoUrl) {
      return res.status(404).json({ success: false, detail: 'No photo found' });
    }

    // Server-side only: fetch Google URL (may contain key) and stream opaque bytes
    const imgRes = await fetch(photoUrl);
    if (!imgRes.ok) {
      return res.status(502).json({ detail: 'Photo fetch failed' });
    }

    const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
    // Reject accidental HTML/JSON error pages from Google
    if (!contentType.startsWith('image/') && !contentType.includes('octet-stream')) {
      return res.status(502).json({ detail: 'Upstream did not return an image' });
    }

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    // Prevent third-party embedding of our billed proxy if desired (same-origin imgs still work)
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(200).send(buffer);
  } catch {
    return res.status(502).json({ detail: 'Gateway unreachable' });
  }
}
