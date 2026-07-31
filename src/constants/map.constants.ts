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
    center: { lat: 39.9334, lng: 32.8597 }, // Ankara, Türkiye
    zoom: 6,
    zoomControl: false,
    minZoom: 3,
    maxZoom: 20,
};

/**
 * Google Maps API Key
 */
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

/**
 * Google Maps Map ID
 */
export const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

/**
 * Desteklenen harita katmanları (OpenStreetMap & Google Maps Platform)
 */
export const TILE_LAYERS = {
    googleHybrid: {
        name: 'Google Hibrit',
        url: `https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}${GOOGLE_MAPS_API_KEY ? `&key=${GOOGLE_MAPS_API_KEY}` : ''}`,
        attribution: '&copy; Google Maps Hybrid',
    },
    googleRoadmap: {
        name: 'Google Haritası',
        url: `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}${GOOGLE_MAPS_API_KEY ? `&key=${GOOGLE_MAPS_API_KEY}` : ''}`,
        attribution: '&copy; Google Maps',
    },
    googleSatellite: {
        name: 'Google Uydu',
        url: `https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}${GOOGLE_MAPS_API_KEY ? `&key=${GOOGLE_MAPS_API_KEY}` : ''}`,
        attribution: '&copy; Google Maps Satellite',
    },
    googleTerrain: {
        name: 'Google Arazi',
        url: `https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}${GOOGLE_MAPS_API_KEY ? `&key=${GOOGLE_MAPS_API_KEY}` : ''}`,
        attribution: '&copy; Google Maps Terrain',
    },
    openstreetmap: {
        name: 'OpenStreetMap',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors',
    },
};

/**
 * Varsayılan harita tile URL ve attribution
 */
export const TILE_LAYER_URL = TILE_LAYERS.googleHybrid.url;
export const TILE_LAYER_ATTRIBUTION = TILE_LAYERS.googleHybrid.attribution;

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
