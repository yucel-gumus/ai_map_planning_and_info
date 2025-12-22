/**
 * LocationCard Component
 * @module components/Cards/LocationCard
 */

import { createElement } from '../../utils/dom.utils';
import { generatePlaceholderImage } from '../../utils/transport.utils';
import type { Location } from '../../types';

/**
 * Location card elementi oluşturur
 * @param location - Location bilgisi
 * @param index - Card index
 * @param isPlannerMode - Planner modu aktif mi
 * @param isActive - Aktif card mı
 * @param onClick - Click callback
 * @returns Card elementi
 */
export function createLocationCard(
    location: Location,
    index: number,
    isPlannerMode: boolean,
    isActive: boolean,
    onClick: (index: number) => void
): HTMLDivElement {
    const card = createElement('div', { className: 'location-card' });

    if (isPlannerMode) {
        card.classList.add('day-planner-card');
    }

    if (isActive) {
        card.classList.add('card-active');
    }

    const imageUrl = generatePlaceholderImage(location.name);
    let cardContent = `<div class="card-image" style="background-image: url('${imageUrl}')"></div>`;

    // Planner mode badges
    if (isPlannerMode) {
        if (location.sequence) {
            cardContent += `<div class="card-sequence-badge">${location.sequence}</div>`;
        }
        if (location.time) {
            cardContent += `<div class="card-time-badge">${location.time}</div>`;
        }
    }

    // Card content
    cardContent += `
    <div class="card-content">
      <h3 class="card-title">${location.name}</h3>
      <p class="card-description">${location.description}</p>
      ${isPlannerMode && location.duration ? `<div class="card-duration">${location.duration}</div>` : ''}
      <div class="card-coordinates">
        ${location.position.lat.toFixed(5)}, ${location.position.lng.toFixed(5)}
      </div>
    </div>
  `;

    card.innerHTML = cardContent;

    // Click handler
    card.addEventListener('click', () => onClick(index));

    return card;
}

/**
 * Carousel dot elementi oluşturur
 * @param index - Dot index
 * @param isActive - Aktif mi
 * @returns Dot elementi
 */
export function createCarouselDot(_index: number, isActive: boolean): HTMLDivElement {
    const dot = createElement('div', { className: 'carousel-dot' });

    if (isActive) {
        dot.classList.add('active');
    }

    return dot;
}
