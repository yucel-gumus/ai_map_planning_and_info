/**
 * useTimeline Hook - Timeline Visibility ve Interaction
 * @module hooks/useTimeline
 */

import { $, addClass, removeClass, show, hide } from '../utils/dom.utils';
import { getPopUps, getBounds, fitBounds } from './useMap';
import { UI_TIMING } from '../constants/ui.constants';

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────

interface TimelineHookState {
    isVisible: boolean;
    activeItemIndex: number | null;
}

const state: TimelineHookState = {
    isVisible: false,
    activeItemIndex: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// DOM Elements (lazy loaded)
// ─────────────────────────────────────────────────────────────────────────────

let elements: {
    timelineContainer: HTMLDivElement | null;
    timeline: HTMLDivElement | null;
    mapContainer: HTMLDivElement | null;
    mapOverlay: HTMLDivElement | null;
} | null = null;

/**
 * DOM elementlerini lazy load eder
 */
function getElements() {
    if (!elements) {
        elements = {
            timelineContainer: $<HTMLDivElement>('#timeline-container'),
            timeline: $<HTMLDivElement>('#timeline'),
            mapContainer: $<HTMLDivElement>('#map-container'),
            mapOverlay: $<HTMLDivElement>('#map-overlay'),
        };
    }
    return elements;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Timeline görünür mü
 */
export function isTimelineVisible(): boolean {
    return state.isVisible;
}

/**
 * Aktif timeline item index'ini döndürür
 */
export function getActiveTimelineIndex(): number | null {
    return state.activeItemIndex;
}

/**
 * Timeline'ı gösterir
 */
export function showTimeline(): void {
    const { timelineContainer, mapContainer, mapOverlay } = getElements();

    if (!timelineContainer) return;

    show(timelineContainer);
    state.isVisible = true;

    setTimeout(() => {
        addClass(timelineContainer, 'visible');

        if (window.innerWidth > 768) {
            addClass(mapContainer, 'map-container-shifted');
            adjustInterfaceForTimeline();
            window.dispatchEvent(new Event('resize'));
        } else {
            addClass(mapOverlay, 'visible');
        }
    }, UI_TIMING.DRAWER_SLIDE_DELAY);
}

/**
 * Timeline'ı gizler
 */
export function hideTimeline(): void {
    const { timelineContainer, mapContainer, mapOverlay } = getElements();

    if (!timelineContainer) return;

    removeClass(timelineContainer, 'visible');
    removeClass(mapContainer, 'map-container-shifted');
    removeClass(mapOverlay, 'visible');
    adjustInterfaceForTimeline();
    state.isVisible = false;

    setTimeout(() => {
        hide(timelineContainer);
        window.dispatchEvent(new Event('resize'));
    }, UI_TIMING.ANIMATION_NORMAL);
}

/**
 * Timeline görünürlüğünü toggle eder
 */
export function toggleTimeline(): void {
    if (state.isVisible) {
        hideTimeline();
    } else {
        showTimeline();
    }
}

/**
 * Timeline harita görünümünü ayarlar
 */
function adjustInterfaceForTimeline(): void {
    const bounds = getBounds();
    // Google Maps LatLngBounds: use isEmpty() (Leaflet had isValid())
    if (bounds && !bounds.isEmpty()) {
        setTimeout(() => {
            fitBounds();
        }, UI_TIMING.RESIZE_INVALIDATE_DELAY);
    }
}

/**
 * Belirli bir timeline item'ını highlight eder
 * @param cardIndex - Card index
 */
export function highlightTimelineItem(cardIndex: number): void {
    const { timeline } = getElements();

    if (!timeline) return;

    const timelineItems = timeline.querySelectorAll(
        '.timeline-content:not(.transport)'
    );

    timelineItems.forEach(item => item.classList.remove('active'));

    const popUps = getPopUps();
    const location = popUps[cardIndex];

    if (!location) return;

    for (const item of timelineItems) {
        const title = item.querySelector('.timeline-title');
        if (title && title.textContent === location.name) {
            item.classList.add('active');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            state.activeItemIndex = cardIndex;
            break;
        }
    }
}

/**
 * Timeline'ı temizler
 */
export function clearTimeline(): void {
    const { timeline } = getElements();
    if (timeline) {
        timeline.innerHTML = '';
    }
    state.activeItemIndex = null;
}

/**
 * Timeline state'ini reset eder
 */
export function resetTimeline(): void {
    clearTimeline();
    hideTimeline();
    state.isVisible = false;
    state.activeItemIndex = null;
}

/**
 * Timeline element'ini döndürür
 */
export function getTimelineElement(): HTMLDivElement | null {
    return getElements().timeline;
}
