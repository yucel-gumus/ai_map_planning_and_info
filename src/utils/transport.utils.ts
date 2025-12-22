/**
 * Transport Utility Functions
 * @module utils/transport
 */

import { getTransportIcon as getIcon } from '../constants/map.constants';

// Re-export getTransportIcon from constants
export const getTransportIcon = getIcon;

/**
 * Konum adına göre placeholder görsel oluşturur
 * @param locationName - Konum adı
 * @returns SVG data URL
 */
export function generatePlaceholderImage(locationName: string): string {
    // Basit hash fonksiyonu
    let hash = 0;
    for (let i = 0; i < locationName.length; i++) {
        hash = locationName.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Hash'e göre renk oluştur
    const hue = Math.abs(hash) % 360;
    const saturation = 60 + (Math.abs(hash) % 30);
    const lightness = 50 + (Math.abs(hash) % 20);

    // İlk harfi al
    const letter = locationName.charAt(0).toUpperCase() || '?';

    // SVG oluştur
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180">
      <rect width="300" height="180" fill="hsl(${hue}, ${saturation}%, ${lightness}%)" />
      <text x="150" y="95" font-family="Arial, sans-serif" font-size="72" fill="white" text-anchor="middle" dominant-baseline="middle">${letter}</text>
    </svg>
  `;

    return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
}

/**
 * Koordinatları formatlar
 * @param lat - Latitude
 * @param lng - Longitude
 * @param precision - Decimal precision (varsayılan: 5)
 * @returns Formatlanmış koordinat string'i
 */
export function formatCoordinates(lat: number, lng: number, precision: number = 5): string {
    return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
}

/**
 * Saat formatını kontrol eder ve formatlar
 * @param time - Saat string'i
 * @returns Formatlanmış saat veya 'Esnek'
 */
export function formatTime(time?: string): string {
    if (!time) return 'Esnek';

    // HH:MM formatını kontrol et
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(time)) {
        return time;
    }

    return time;
}

/**
 * Süre formatını kontrol eder ve formatlar
 * @param duration - Süre string'i
 * @returns Formatlanmış süre veya null
 */
export function formatDuration(duration?: string): string | null {
    if (!duration) return null;
    return duration;
}
