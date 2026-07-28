/**
 * Image Service
 * @module services/image.service
 * @description Resolves high-quality location photos with a safe fallback chain:
 * 1) AI-provided URL (validated, no secrets expected)
 * 2) Same-origin Google photo proxy (/api/places/photo?mode=image) — never exposes Maps keys
 * 3) Wikipedia (TR → EN)
 * 4) Local SVG placeholder
 */

import { generatePlaceholderImage } from '../utils/transport.utils';

const imageCache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

function cacheKey(name: string, lat?: number, lng?: number): string {
    if (lat !== undefined && lng !== undefined && !Number.isNaN(lat) && !Number.isNaN(lng)) {
        return `${name}|${lat.toFixed(5)},${lng.toFixed(5)}`;
    }
    return name;
}

/**
 * Validates if an image URL is accessible and loads properly
 */
function testImageLoad(url: string): Promise<boolean> {
    return new Promise((resolve) => {
        let settled = false;
        const done = (ok: boolean) => {
            if (settled) return;
            settled = true;
            resolve(ok);
        };

        const img = new Image();
        img.onload = () => done(true);
        img.onerror = () => done(false);
        img.src = url;
        setTimeout(() => done(false), 8000);
    });
}

/**
 * Sanitizes location name for search queries (removes parenthetical notes)
 */
function cleanQuery(name: string): string {
    return name
        .replace(/\(.*?\)/g, '')
        .replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Same-origin Places photo stream URL.
 * Server fetches Google (with key) and returns image bytes only — no key in the browser.
 */
function buildPlacesPhotoStreamUrl(name: string, lat?: number, lng?: number): string {
    const params = new URLSearchParams({
        name,
        mode: 'image',
    });
    if (lat !== undefined && lng !== undefined && !Number.isNaN(lat) && !Number.isNaN(lng)) {
        params.set('lat', String(lat));
        params.set('lng', String(lng));
    }
    return `/api/places/photo?${params.toString()}`;
}

/**
 * True if URL is a raw Google Maps/Places/Static/Street View URL that may embed key=
 * We never use these as <img src> (key leak / billing abuse).
 */
function isGoogleMapsKeyBearingUrl(url: string): boolean {
    try {
        const u = new URL(url);
        if (!u.hostname.endsWith('googleapis.com') && !u.hostname.endsWith('google.com')) {
            return false;
        }
        return (
            u.pathname.includes('/maps/') ||
            u.pathname.includes('/place/') ||
            u.searchParams.has('key')
        );
    } catch {
        return false;
    }
}

/**
 * Try same-origin Google photo proxy only (no JSON→Google-URL fallback).
 */
async function fetchGooglePlacesImage(
    query: string,
    lat?: number,
    lng?: number
): Promise<string | null> {
    const imageProxy = buildPlacesPhotoStreamUrl(query, lat, lng);
    try {
        const isValid = await testImageLoad(imageProxy);
        if (isValid) {
            return imageProxy;
        }
    } catch {
        // fall through
    }
    return null;
}

async function fetchWikipediaImage(query: string, lang: 'tr' | 'en'): Promise<string | null> {
    try {
        const wikiUrl =
            `https://${lang}.wikipedia.org/w/api.php?action=query&generator=search` +
            `&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=pageimages` +
            `&pithumbsize=800&format=json&origin=*`;
        const response = await fetch(wikiUrl);

        if (!response.ok) return null;

        const data = await response.json();
        const pages = data?.query?.pages;
        if (!pages) return null;

        const firstPageKey = Object.keys(pages)[0];
        const firstPage = pages[firstPageKey];
        const imgUrl = firstPage?.thumbnail?.source as string | undefined;
        if (!imgUrl) return null;

        const isValid = await testImageLoad(imgUrl);
        return isValid ? imgUrl : null;
    } catch {
        return null;
    }
}

/**
 * Fetches real photo URL for a location name & lat/lng coordinates
 */
export async function fetchLocationImage(
    locationName: string,
    aiProvidedUrl?: string,
    lat?: number | string,
    lng?: number | string
): Promise<string> {
    const numLat = lat !== undefined && lat !== null ? Number(lat) : NaN;
    const numLng = lng !== undefined && lng !== null ? Number(lng) : NaN;
    const hasCoords = !Number.isNaN(numLat) && !Number.isNaN(numLng);
    const key = cacheKey(locationName, hasCoords ? numLat : undefined, hasCoords ? numLng : undefined);

    if (imageCache.has(key)) {
        return imageCache.get(key)!;
    }

    if (inflight.has(key)) {
        return inflight.get(key)!;
    }

    const work = (async (): Promise<string> => {
        // 1. AI-provided URL — only if not a Google key-bearing Maps URL
        if (
            aiProvidedUrl &&
            (aiProvidedUrl.startsWith('http://') || aiProvidedUrl.startsWith('https://')) &&
            !isGoogleMapsKeyBearingUrl(aiProvidedUrl)
        ) {
            const isValid = await testImageLoad(aiProvidedUrl);
            if (isValid) {
                imageCache.set(key, aiProvidedUrl);
                return aiProvidedUrl;
            }
        }

        const primaryQuery = cleanQuery(locationName);

        // 2. Google via same-origin image proxy only (server holds Maps key)
        const placesImg = await fetchGooglePlacesImage(
            primaryQuery,
            hasCoords ? numLat : undefined,
            hasCoords ? numLng : undefined
        );
        if (placesImg) {
            imageCache.set(key, placesImg);
            return placesImg;
        }

        // 3. Turkish Wikipedia
        const trWiki = await fetchWikipediaImage(primaryQuery, 'tr');
        if (trWiki) {
            imageCache.set(key, trWiki);
            return trWiki;
        }

        // 4. English Wikipedia
        const enWiki = await fetchWikipediaImage(primaryQuery, 'en');
        if (enWiki) {
            imageCache.set(key, enWiki);
            return enWiki;
        }

        // 5. SVG placeholder
        const fallbackSvg = generatePlaceholderImage(locationName);
        imageCache.set(key, fallbackSvg);
        return fallbackSvg;
    })();

    inflight.set(key, work);
    try {
        return await work;
    } finally {
        inflight.delete(key);
    }
}

/**
 * Prefetch images for a batch of locations
 */
export async function prefetchLocationImages(
    locations: Array<{ name: string; imageUrl?: string; lat?: number | string; lng?: number | string }>
): Promise<void> {
    await Promise.allSettled(
        locations.map((loc) => fetchLocationImage(loc.name, loc.imageUrl, loc.lat, loc.lng))
    );
}

export function clearImageCache(): void {
    imageCache.clear();
    inflight.clear();
}
