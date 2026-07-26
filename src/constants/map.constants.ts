/**
 * Harita Sabitleri
 * @module constants/map
 */

import type { MapOptions, TransportIconMap } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Default Map Options
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Varsayılan harita başlatma seçenekleri
 */
export const DEFAULT_MAP_OPTIONS: MapOptions = {
    center: [39.9334, 32.8597], // Ankara, Türkiye
    zoom: 6,
    zoomControl: false,
    minZoom: 5,  // Sınırlı uzaklaştırma (çok fazla uzaklaşmayı engeller)
    maxZoom: 19, // Derin yakınlaştırma (sokak ve bina seviyesine kadar yakınlaşır)
};

/**
 * OpenStreetMap tile layer URL
 */
export const TILE_LAYER_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

/**
 * Tile layer attribution
 */
export const TILE_LAYER_ATTRIBUTION = '';

// ─────────────────────────────────────────────────────────────────────────────
// Polyline Options
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Genel mod için polyline rengi
 */
export const DEFAULT_POLYLINE_COLOR = '#FFB6A6';

/**
 * Planner mod için polyline rengi
 */
export const PLANNER_POLYLINE_COLOR = '#9BCEC1';

/**
 * Polyline options
 */
export const POLYLINE_OPTIONS = {
    default: {
        color: DEFAULT_POLYLINE_COLOR,
        opacity: 1.0,
        weight: 4,
    },
    planner: {
        color: PLANNER_POLYLINE_COLOR,
        opacity: 1.0,
        weight: 5,
        dashArray: '8, 8',
    },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Transport Icons
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Transport tiplerine göre FontAwesome icon mapping
 */
export const TRANSPORT_ICONS: TransportIconMap = {
    // Walking
    walk: 'walking',
    walking: 'walking',
    yürü: 'walking',
    yaya: 'walking',

    // Driving
    car: 'car-side',
    drive: 'car-side',
    driving: 'car-side',
    araba: 'car-side',
    otomobil: 'car-side',

    // Bus/Transit
    bus: 'bus-alt',
    transit: 'bus-alt',
    public: 'bus-alt',
    otobüs: 'bus-alt',
    toplu: 'bus-alt',

    // Train/Metro
    train: 'train',
    subway: 'train',
    metro: 'train',
    tren: 'train',

    // Bicycle
    bike: 'bicycle',
    bicycle: 'bicycle',
    cycling: 'bicycle',
    bisiklet: 'bicycle',

    // Taxi
    taxi: 'taxi',
    cab: 'taxi',
    taksi: 'taxi',

    // Boat/Ferry
    boat: 'ship',
    ferry: 'ship',
    gemi: 'ship',
    vapur: 'ship',

    // Plane
    plane: 'plane-departure',
    fly: 'plane-departure',
    flight: 'plane-departure',
    uçak: 'plane-departure',

    // Default
    default: 'route',
    travel: 'route',
    seyahat: 'route',
};

/**
 * Transport tipine göre icon adını döndürür
 * @param transportType - Transport tipi
 * @returns FontAwesome icon adı
 */
export function getTransportIcon(transportType: string): string {
    const type = (transportType || '').toLowerCase();

    // Eşleşme ara
    for (const [key, icon] of Object.entries(TRANSPORT_ICONS)) {
        if (type.includes(key)) {
            return icon;
        }
    }

    return TRANSPORT_ICONS.default;
}

// ─────────────────────────────────────────────────────────────────────────────
// Popup Options
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Varsayılan popup seçenekleri
 */
export const POPUP_OPTIONS = {
    className: 'popup-container',
    closeButton: false,
    closeOnClick: false,
} as const;
