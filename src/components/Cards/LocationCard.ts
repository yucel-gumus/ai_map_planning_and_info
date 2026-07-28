/**
 * LocationCard Component
 * @module components/Cards/LocationCard
 */

import { createElement } from '../../utils/dom.utils';
import { generatePlaceholderImage, formatPosition } from '../../utils/transport.utils';
import type { Location } from '../../types';
import {
    isVisitedLocation,
    toggleExcludedLocation,
    isExcludedLocation
} from '../../hooks/usePlanner';

/**
 * Location card elementi oluşturur (Çoklu Gün & İnteraktif Eylemler Destekli)
 */
export function createLocationCard(
    location: Location,
    index: number,
    isPlannerMode: boolean,
    isActive: boolean,
    onClick: (index: number) => void,
    onActionChange?: () => void
): HTMLDivElement {
    const card = createElement('div', { className: 'location-card' });

    if (isPlannerMode) {
        card.classList.add('day-planner-card');
    }

    if (isActive) {
        card.classList.add('card-active');
    }

    const isVisited = isVisitedLocation(location.name);
    const isExcluded = isExcludedLocation(location.name);

    if (isVisited) {
        card.classList.add('card-status-visited');
    }
    if (isExcluded) {
        card.classList.add('card-status-excluded');
    }

    card.setAttribute('data-name', location.name);

    const imageUrl = location.imageUrl || generatePlaceholderImage(location.name);
    const lat = typeof location.position.lat === 'function' ? location.position.lat() : Number(location.position.lat);
    const lng = typeof location.position.lng === 'function' ? location.position.lng() : Number(location.position.lng);

    let cardContent = `
      <div class="card-image card-image-loading" style="background-image: url('${imageUrl}')">
        <button type="button" class="card-streetview-btn" title="360° Sokak Görünümü" data-action="streetview">
          <i class="fas fa-street-view"></i>
        </button>
      </div>`;

    // Planner mode badges & Day badges
    if (isPlannerMode) {
        if (location.day) {
            cardContent += `<div class="card-day-badge">${location.day}. Gün</div>`;
        }
        if (location.sequence) {
            cardContent += `<div class="card-sequence-badge">${location.sequence}</div>`;
        }
        if (location.time) {
            cardContent += `<div class="card-time-badge">${location.time}</div>`;
        }
    }

    // Card content body with action buttons
    cardContent += `
    <div class="card-content">
      <h3 class="card-title">${location.name}</h3>
      <p class="card-description">${location.description}</p>
      ${isPlannerMode && location.duration ? `<div class="card-duration">${location.duration}</div>` : ''}
      
      ${isPlannerMode ? `
      <div class="card-action-bar">
        <button class="card-action-btn btn-exclude ${isExcluded ? 'is-active' : ''}" data-action="exclude" title="Bu mekanı plandan çıkar ve alternatif öner">
          <i class="fas ${isExcluded ? 'fa-minus-circle' : 'fa-ban'}"></i> ${isExcluded ? 'Çıkarıldı' : 'Çıkar'}
        </button>
      </div>` : ''}

      <div class="card-coordinates">
        ${formatPosition(location.position)}
      </div>
    </div>
  `;

    card.innerHTML = cardContent;

    // Action button click listener
    const excludeBtn = card.querySelector('.btn-exclude');

    excludeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const active = toggleExcludedLocation(location.name);
        if (active) {
            card.classList.add('card-status-excluded');
        } else {
            card.classList.remove('card-status-excluded');
        }
        if (onActionChange) onActionChange();
    });

    const svBtn = card.querySelector('[data-action="streetview"]');
    svBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const openSv = (window as unknown as Record<string, unknown>).__openStreetView as
            | ((n: string, la: number, ln: number) => void)
            | undefined;
        if (openSv && !Number.isNaN(lat) && !Number.isNaN(lng)) {
            openSv(location.name, lat, lng);
        }
    });

    // Card select handler
    card.addEventListener('click', () => onClick(index));

    return card;
}

/**
 * Carousel dot elementi oluşturur
 */
export function createCarouselDot(_index: number, isActive: boolean): HTMLDivElement {
    const dot = createElement('div', { className: 'carousel-dot' });

    if (isActive) {
        dot.classList.add('active');
    }

    return dot;
}
