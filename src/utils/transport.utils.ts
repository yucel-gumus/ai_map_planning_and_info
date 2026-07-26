/**
 * Transport Utility Functions
 * @module utils/transport
 */

import { getTransportIcon as getIcon } from '../constants/map.constants';

export const getTransportIcon = getIcon;

/**
 * Konum adına göre placeholder görsel oluşturur (Strict 60-30-10 Palette SVG)
 * @param locationName - Konum adı
 * @returns Valid SVG Data URL
 */
export function generatePlaceholderImage(locationName: string): string {
    let hash = 0;
    for (let i = 0; i < locationName.length; i++) {
        hash = locationName.charCodeAt(i) + ((hash << 5) - hash);
    }

    const isEven = Math.abs(hash) % 2 === 0;
    const bgFill = isEven ? '#E28B7B' : '#4F9D88';
    const circleFill = isEven ? '#4F9D88' : '#E28B7B';
    const textFill = '#F5E1C8';

    const letter = locationName.charAt(0).toUpperCase() || '?';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180">
  <rect width="300" height="180" fill="${bgFill}"/>
  <circle cx="150" cy="90" r="62" fill="${circleFill}" opacity="0.4"/>
  <circle cx="150" cy="90" r="42" fill="${circleFill}" opacity="0.75"/>
  <text x="150" y="102" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="52" font-weight="800" fill="${textFill}" text-anchor="middle" dominant-baseline="middle">${letter}</text>
</svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

/**
 * Koordinatları formatlar
 */
export function formatCoordinates(lat: number, lng: number, precision: number = 5): string {
    return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
}

/**
 * Saat formatını kontrol eder ve formatlar
 */
export function formatTime(time?: string): string {
    if (!time) return 'Esnek';

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(time)) {
        return time;
    }

    return time;
}

/**
 * Süre formatını kontrol eder ve formatlar
 */
export function formatDuration(duration?: string): string | null {
    if (!duration) return null;
    return duration;
}
