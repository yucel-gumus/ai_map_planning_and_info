/**
 * Harita Planlama Uygulaması - TypeScript Type Definitions
 * @module types
 */

import * as L from 'leaflet';

// ─────────────────────────────────────────────────────────────────────────────
// Location Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Temel konum bilgisi interface'i
 */
export interface Location {
    name: string;
    description: string;
    position: L.LatLng;
    popup: L.Popup;
    marker?: L.Marker;
    time?: string;
    duration?: string;
    sequence?: number;
}

/**
 * API'den gelen konum argümanları
 */
export interface LocationArgs {
    name: string;
    description: string;
    lat: string;
    lng: string;
    time?: string;
    duration?: string;
    sequence?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Line/Route Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Haritadaki çizgi/rota bilgisi
 */
export interface Line {
    poly: L.Polyline;
    name: string;
    transport?: string;
    travelTime?: string;
}

/**
 * API'den gelen çizgi argümanları
 */
export interface LineArgs {
    name: string;
    start: {
        lat: string;
        lng: string;
    };
    end: {
        lat: string;
        lng: string;
    };
    transport?: string;
    travelTime?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Map State Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Harita state'i
 */
export interface MapState {
    points: L.LatLngExpression[];
    markers: L.Marker[];
    lines: Line[];
    popUps: Location[];
    bounds: L.LatLngBounds;
    activeCardIndex: number;
}

/**
 * Harita başlatma seçenekleri
 */
export interface MapOptions {
    center: L.LatLngExpression;
    zoom: number;
    zoomControl: boolean;
    maxZoom: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Planner Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Planner state'i
 */
export interface PlannerState {
    isPlannerMode: boolean;
    dayPlanItinerary: Location[];
}

/**
 * Timeline item (day planner için)
 */
export interface TimelineItem {
    name: string;
    description: string;
    time?: string;
    duration?: string;
    sequence?: number;
    position: L.LatLng;
}

// ─────────────────────────────────────────────────────────────────────────────
// Transport Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Desteklenen transport tipleri
 */
export type TransportType =
    | 'walking'
    | 'driving'
    | 'public_transit'
    | 'bus'
    | 'train'
    | 'metro'
    | 'bicycle'
    | 'taxi'
    | 'boat'
    | 'plane'
    | 'unknown';

/**
 * Transport icon mapping
 */
export interface TransportIconMap {
    [key: string]: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI State Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Timeline UI state'i
 */
export interface TimelineState {
    isVisible: boolean;
    activeItemIndex: number | null;
}

/**
 * Card Carousel state'i
 */
export interface CarouselState {
    isVisible: boolean;
    activeIndex: number;
    cards: Location[];
}

// ─────────────────────────────────────────────────────────────────────────────
// API Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AI servisi yanıt tipi
 */
export interface GenerateResult {
    success: boolean;
    locations: Location[];
    lines: Line[];
    textResponse?: string;
    error?: string;
}

/**
 * Function call tipi (Gemini API)
 */
export interface FunctionCall {
    name: 'location' | 'line';
    args: LocationArgs | LineArgs;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOM Element Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uygulama DOM elementleri
 */
export interface AppElements {
    // Map
    mapContainer: HTMLDivElement | null;
    map: HTMLDivElement | null;
    mapOverlay: HTMLDivElement | null;

    // Search
    searchContainer: HTMLDivElement | null;
    promptInput: HTMLTextAreaElement | null;
    generateButton: HTMLButtonElement | null;
    resetButton: HTMLButtonElement | null;

    // Cards
    cardCarousel: HTMLDivElement | null;
    cardContainer: HTMLDivElement | null;
    carouselIndicators: HTMLDivElement | null;
    prevCardButton: HTMLButtonElement | null;
    nextCardButton: HTMLButtonElement | null;

    // Timeline
    timelineContainer: HTMLDivElement | null;
    timeline: HTMLDivElement | null;
    closeTimelineButton: HTMLButtonElement | null;
    exportPlanButton: HTMLButtonElement | null;
    timelineToggle: HTMLButtonElement | null;

    // Mode
    plannerModeToggle: HTMLInputElement | null;

    // Modal
    helpButton: HTMLButtonElement | null;
    helpModal: HTMLDivElement | null;
    helpCloseButton: HTMLButtonElement | null;

    // Loading/Error
    loadingOverlay: HTMLDivElement | null;
    errorMessage: HTMLDivElement | null;
}
