/**
 * Google Maps Security & Initialization.
 *
 * Direct communication with Google Maps Platform using the domain-restricted Maps API Key.
 * Proxying Maps JS SDK traffic through backend is deprecated to preserve Google Auth & performance.
 */
export function setupMapsNetworkInterceptor() {
  // No-op: Google Maps JS SDK uses domain-restricted key fetched dynamically from /api/maps/config.
}
