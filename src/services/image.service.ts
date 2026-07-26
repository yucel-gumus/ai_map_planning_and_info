/**
 * Image Service
 * @module services/image.service
 * @description Fetches real high-resolution photos for historic landmarks, cities, and attractions via verified AI links & MediaWiki Search API.
 */

import { generatePlaceholderImage } from '../utils/transport.utils';

const imageCache = new Map<string, string>();

/**
 * Validates if an image URL is accessible and loads properly
 */
function testImageLoad(url: string): Promise<boolean> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
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
 * Fetches real photo URL for a location name
 */
export async function fetchLocationImage(locationName: string, aiProvidedUrl?: string): Promise<string> {
    if (imageCache.has(locationName)) {
        return imageCache.get(locationName)!;
    }

    // 1. Verify AI-provided image URL if available
    if (aiProvidedUrl && (aiProvidedUrl.startsWith('http://') || aiProvidedUrl.startsWith('https://'))) {
        const isValid = await testImageLoad(aiProvidedUrl);
        if (isValid) {
            imageCache.set(locationName, aiProvidedUrl);
            return aiProvidedUrl;
        }
    }

    const primaryQuery = cleanQuery(locationName);

    // 2. Try Turkish Wikipedia Search + PageImages API
    try {
        const wikiUrl = `https://tr.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(primaryQuery)}&gsrlimit=1&prop=pageimages&pithumbsize=600&format=json&origin=*`;
        const response = await fetch(wikiUrl);
        
        if (response.ok) {
            const data = await response.json();
            const pages = data?.query?.pages;
            if (pages) {
                const firstPageKey = Object.keys(pages)[0];
                const firstPage = pages[firstPageKey];
                if (firstPage?.thumbnail?.source) {
                    const imgUrl = firstPage.thumbnail.source;
                    const isValid = await testImageLoad(imgUrl);
                    if (isValid) {
                        imageCache.set(locationName, imgUrl);
                        return imgUrl;
                    }
                }
            }
        }
    } catch {
        // Ignore API error
    }

    // 3. Try English Wikipedia Search API for global landmarks
    try {
        const enWikiUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(primaryQuery)}&gsrlimit=1&prop=pageimages&pithumbsize=600&format=json&origin=*`;
        const response = await fetch(enWikiUrl);
        
        if (response.ok) {
            const data = await response.json();
            const pages = data?.query?.pages;
            if (pages) {
                const firstPageKey = Object.keys(pages)[0];
                const firstPage = pages[firstPageKey];
                if (firstPage?.thumbnail?.source) {
                    const imgUrl = firstPage.thumbnail.source;
                    const isValid = await testImageLoad(imgUrl);
                    if (isValid) {
                        imageCache.set(locationName, imgUrl);
                        return imgUrl;
                    }
                }
            }
        }
    } catch {
        // Ignore error
    }

    // 4. Crisp 60-30-10 SVG Placeholder Fallback (Zero CORS network errors)
    const fallbackSvg = generatePlaceholderImage(locationName);
    imageCache.set(locationName, fallbackSvg);
    return fallbackSvg;
}
