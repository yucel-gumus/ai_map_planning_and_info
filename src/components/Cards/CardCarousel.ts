/**
 * CardCarousel Component
 * @module components/Cards/CardCarousel
 */

import { $, on, show, hide, setHTML } from '../../utils/dom.utils';
import {
    getPopUps,
    setActiveCardIndex,
    panTo,
    closeAllPopups,
    openPopup,
    navigateCards
} from '../../hooks/useMap';
import { isPlannerMode } from '../../hooks/usePlanner';
import { highlightTimelineItem } from '../../hooks/useTimeline';
import { createLocationCard, createCarouselDot } from './LocationCard';


// ─────────────────────────────────────────────────────────────────────────────
// DOM Elements
// ─────────────────────────────────────────────────────────────────────────────

let cardCarousel: HTMLDivElement | null = null;
let cardContainer: HTMLDivElement | null = null;
let carouselIndicators: HTMLDivElement | null = null;
let prevButton: HTMLButtonElement | null = null;
let nextButton: HTMLButtonElement | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// Card Rendering
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Location card'larını render eder
 */
export function renderCards(): void {
    const popUps = getPopUps();

    if (!cardContainer || !carouselIndicators || popUps.length === 0) return;

    // Clear existing
    setHTML(cardContainer, '');
    setHTML(carouselIndicators, '');

    if (cardCarousel) {
        show(cardCarousel);
    }

    // Create cards and dots
    popUps.forEach((location, index) => {
        const isActive = index === 0;

        // Card
        const card = createLocationCard(
            location,
            index,
            isPlannerMode(),
            isActive,
            handleCardClick
        );
        cardContainer!.appendChild(card);

        // Dot
        const dot = createCarouselDot(index, isActive);
        carouselIndicators!.appendChild(dot);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Card Interaction
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Card click handler
 */
function handleCardClick(index: number): void {
    highlightCard(index);

    const popUps = getPopUps();
    if (popUps[index]) {
        panTo(popUps[index].position);

        if (isPlannerMode()) {
            highlightTimelineItem(index);
        }
    }
}

/**
 * Card'ı highlight eder
 * @param index - Card index
 */
export function highlightCard(index: number): void {
    setActiveCardIndex(index);

    const cards = cardContainer?.querySelectorAll('.location-card');
    if (!cards) return;

    // Card classes
    cards.forEach(card => card.classList.remove('card-active'));
    if (cards[index]) {
        cards[index].classList.add('card-active');

        // Scroll to card
        const cardElement = cards[index] as HTMLElement;
        const cardWidth = cardElement.offsetWidth;
        const containerWidth = cardContainer!.offsetWidth;
        const scrollPosition = cardElement.offsetLeft - containerWidth / 2 + cardWidth / 2;
        cardContainer!.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }

    // Dot classes
    const dots = carouselIndicators?.querySelectorAll('.carousel-dot');
    if (dots) {
        dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    }

    // Popup handling
    closeAllPopups();
    openPopup(index);

    // Timeline highlight
    if (isPlannerMode()) {
        highlightTimelineItem(index);
    }
}

/**
 * Card navigasyonu
 */
function handleNavigate(direction: number): void {
    const newIndex = navigateCards(direction);

    if (newIndex !== null) {
        highlightCard(newIndex);
        const popUps = getPopUps();
        if (popUps[newIndex]) {
            panTo(popUps[newIndex].position);
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CardCarousel'ı başlatır
 */
export function initCardCarousel(): void {
    cardCarousel = $<HTMLDivElement>('.card-carousel');
    cardContainer = $<HTMLDivElement>('#card-container');
    carouselIndicators = $<HTMLDivElement>('#carousel-indicators');
    prevButton = $<HTMLButtonElement>('#prev-card');
    nextButton = $<HTMLButtonElement>('#next-card');

    // Event listeners
    if (prevButton) {
        on(prevButton, 'click', () => handleNavigate(-1));
    }

    if (nextButton) {
        on(nextButton, 'click', () => handleNavigate(1));
    }
}

/**
 * Carousel'ı gizler
 */
export function hideCarousel(): void {
    if (cardCarousel) {
        hide(cardCarousel);
    }
}

/**
 * Carousel'ı gösterir
 */
export function showCarousel(): void {
    if (cardCarousel) {
        show(cardCarousel);
    }
}

/**
 * Carousel'ı temizler
 */
export function clearCarousel(): void {
    if (cardContainer) {
        setHTML(cardContainer, '');
    }
    if (carouselIndicators) {
        setHTML(carouselIndicators, '');
    }
    hideCarousel();
}
