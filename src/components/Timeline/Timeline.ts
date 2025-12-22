/**
 * Timeline Component
 * @module components/Timeline/Timeline
 */

import { $, on, setHTML } from '../../utils/dom.utils';
import { getTransportIcon } from '../../constants/map.constants';
import {
    showTimeline as show,
    hideTimeline as hide,
    getTimelineElement,
    highlightTimelineItem
} from '../../hooks/useTimeline';
import {
    getDayPlanItinerary,
    isPlannerMode,
    exportDayPlan as exportPlan
} from '../../hooks/usePlanner';
import { getLines, getPopUps, panTo, setActiveCardIndex } from '../../hooks/useMap';
import { createTimelineItem, createTransportItem } from './TimelineItem';
import type { Location, Line } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// DOM Elements
// ─────────────────────────────────────────────────────────────────────────────

let closeButton: HTMLButtonElement | null = null;
let exportButton: HTMLButtonElement | null = null;
let timelineToggle: HTMLButtonElement | null = null;
let mapOverlay: HTMLDivElement | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// Callbacks
// ─────────────────────────────────────────────────────────────────────────────

type CardHighlightCallback = (index: number) => void;
let onCardHighlight: CardHighlightCallback | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// Event Handlers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Timeline item click handler
 */
function handleTimelineItemClick(_index: number, itemName: string): void {
    const popUps = getPopUps();
    const popupIndex = popUps.findIndex((p) => p.name === itemName);

    if (popupIndex !== -1) {
        setActiveCardIndex(popupIndex);
        panTo(popUps[popupIndex].position);

        if (onCardHighlight) {
            onCardHighlight(popupIndex);
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Timeline Rendering
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Timeline'ı render eder
 */
export function renderTimeline(): void {
    const timeline = getTimelineElement();
    const itinerary = getDayPlanItinerary();
    const lines = getLines();

    if (!timeline || itinerary.length === 0) return;

    setHTML(timeline, '');

    // Timeline items oluştur
    itinerary.forEach((item, index) => {
        const timelineItem = createTimelineItem(
            item,
            index,
            handleTimelineItemClick
        );
        timeline.appendChild(timelineItem);
    });

    // Transport items ekle (eğer planner modundaysa)
    if (lines.length > 0 && isPlannerMode()) {
        addTransportItems(timeline, itinerary, lines);
    }
}

/**
 * Transport items'ları timeline'a ekler
 */
function addTransportItems(
    timeline: HTMLDivElement,
    itinerary: Location[],
    lines: Line[]
): void {
    const timelineItems = timeline.querySelectorAll('.timeline-item');

    for (let i = 0; i < timelineItems.length - 1; i++) {
        const currentItem = itinerary[i];
        const nextItem = itinerary[i + 1];

        const connectingLine = lines.find(
            (line) =>
                line.name.includes(currentItem.name) ||
                line.name.includes(nextItem.name)
        );

        if (
            connectingLine &&
            (connectingLine.transport || connectingLine.travelTime)
        ) {
            const transportIcon = getTransportIcon(connectingLine.transport || 'travel');
            const transportItem = createTransportItem(
                connectingLine.transport || 'Seyahat',
                transportIcon,
                connectingLine.name,
                connectingLine.travelTime
            );
            timelineItems[i].after(transportItem);
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Timeline'ı başlatır
 * @param cardHighlightCallback - Card highlight callback
 */
export function initTimeline(cardHighlightCallback: CardHighlightCallback): void {
    closeButton = $<HTMLButtonElement>('#close-timeline');
    exportButton = $<HTMLButtonElement>('#export-plan');
    timelineToggle = $<HTMLButtonElement>('#timeline-toggle');
    mapOverlay = $<HTMLDivElement>('#map-overlay');

    onCardHighlight = cardHighlightCallback;

    // Event listeners
    if (closeButton) {
        on(closeButton, 'click', hide);
    }

    if (timelineToggle) {
        on(timelineToggle, 'click', show);
    }

    if (mapOverlay) {
        on(mapOverlay, 'click', hide);
    }

    if (exportButton) {
        on(exportButton, 'click', () => {
            exportPlan(getLines());
        });
    }
}

/**
 * Timeline'ı gösterir ve render eder
 */
export function showTimelineWithContent(): void {
    renderTimeline();
    show();
}

// Re-export hooks functions
export { show as showTimeline, hide as hideTimeline, highlightTimelineItem };
