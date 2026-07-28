/**
 * Security Network Interceptor for Google Maps.
 *
 * Intercepts all fetch & XMLHttpRequest calls targeting maps.googleapis.com,
 * strips the x-goog-api-key header from browser network traffic,
 * and reroutes requests to pages-bff reverse proxy.
 */

const BFF_BASE = 'https://pages-bff.vercel.app';
const PROXY_TARGET = `${BFF_BASE}/api/maps/proxy`;

export function setupMapsNetworkInterceptor() {
  if (typeof window === 'undefined') return;

  // 1. Intercept fetch
  const originalFetch = window.fetch;
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    if (urlStr.includes('maps.googleapis.com')) {
      urlStr = urlStr.replace('https://maps.googleapis.com/maps/api', PROXY_TARGET);
      urlStr = urlStr.replace('https://maps.googleapis.com', PROXY_TARGET);

      const headers = new Headers(init?.headers);
      headers.delete('x-goog-api-key');

      const newInit: RequestInit = {
        ...init,
        headers,
      };

      if (typeof input === 'string') {
        input = urlStr;
      } else if (input instanceof URL) {
        input = new URL(urlStr);
      } else {
        input = new Request(urlStr, newInit);
      }

      return originalFetch.call(this, input, newInit);
    }

    return originalFetch.call(this, input, init);
  };

  // 2. Intercept XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

  XMLHttpRequest.prototype.open = function (
    this: XMLHttpRequest,
    method: string,
    url: string | URL,
    async: boolean = true,
    username?: string | null,
    password?: string | null
  ) {
    let urlStr = typeof url === 'string' ? url : url.toString();

    if (urlStr.includes('maps.googleapis.com')) {
      urlStr = urlStr.replace('https://maps.googleapis.com/maps/api', PROXY_TARGET);
      urlStr = urlStr.replace('https://maps.googleapis.com', PROXY_TARGET);
    }

    return originalOpen.call(this, method, urlStr, async, username, password);
  };

  XMLHttpRequest.prototype.setRequestHeader = function (
    this: XMLHttpRequest,
    header: string,
    value: string
  ) {
    if (header.toLowerCase() === 'x-goog-api-key') {
      // Strip x-goog-api-key header from browser network calls
      return;
    }
    return originalSetRequestHeader.call(this, header, value);
  };
}
