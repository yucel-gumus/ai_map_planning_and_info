/**
 * TimelineItem Component (Minimalist Compact Stream)
 * @module components/Timeline/TimelineItem
 */

import { createElement } from '../../utils/dom.utils';
import type { Location } from '../../types';
import {
    toggleExcludedLocation,
    isExcludedLocation
} from '../../hooks/usePlanner';

/**
 * Compact Timeline item elementi oluşturur (Sadeleştirilmiş Şık Akış)
 */
export function createTimelineItem(
    item: Location,
    index: number,
    onItemClick: (index: number, itemName: string) => void,
    onActionChange?: () => void
): HTMLDivElement {
    const timelineItem = createElement('div', { className: 'timeline-item' });
    const timeDisplay = item.time || 'Esnek';
    const isExcluded = isExcludedLocation(item.name);

    if (isExcluded) timelineItem.classList.add('item-status-excluded');

    timelineItem.innerHTML = `
    <div class="timeline-time">
      ${item.day ? `<span class="timeline-day-pill">${item.day}. Gün</span>` : ''}
      <span class="timeline-hour-text">${timeDisplay}</span>
    </div>
    <div class="timeline-connector">
      <div class="timeline-dot"></div>
      <div class="timeline-line"></div>
    </div>
    <div class="timeline-content timeline-compact-node" data-index="${index}">
      <div class="timeline-compact-main">
        <span class="timeline-title">${item.name}</span>
        ${item.duration ? `<span class="timeline-duration-badge">${item.duration}</span>` : ''}
      </div>
      <button class="timeline-btn-action btn-exclude ${isExcluded ? 'is-active' : ''}" title="Plandan Çıkar">
        <i class="fas ${isExcluded ? 'fa-minus-circle' : 'fa-ban'}"></i>
      </button>
    </div>
  `;

    const excludeBtn = timelineItem.querySelector('.btn-exclude');

    excludeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const active = toggleExcludedLocation(item.name);
        if (active) {
            timelineItem.classList.add('item-status-excluded');
        } else {
            timelineItem.classList.remove('item-status-excluded');
        }
        if (onActionChange) onActionChange();
    });

    const timelineContent = timelineItem.querySelector('.timeline-content');
    if (timelineContent) {
        timelineContent.addEventListener('click', () => {
            onItemClick(index, item.name);
        });
    }

    return timelineItem;
}

/**
 * Transport item elementi oluşturur (Compact Stream)
 */
export function createTransportItem(
    transportType: string,
    transportIcon: string,
    routeName: string,
    travelTime?: string,
    distance?: string
): HTMLDivElement {
    const transportItem = createElement('div', {
        className: 'timeline-item transport-item'
    });

    const meta = [travelTime, distance].filter(Boolean).join(' · ');

    transportItem.innerHTML = `
    <div class="timeline-time"></div>
    <div class="timeline-connector">
      <div class="timeline-dot transport-dot"></div>
      <div class="timeline-line"></div>
    </div>
    <div class="timeline-content transport timeline-compact-node">
      <div class="timeline-compact-main">
        <i class="fas fa-${transportIcon}"></i>
        <span class="timeline-title">${transportType || 'Seyahat'}</span>
        ${meta ? `<span class="timeline-duration-badge">${meta}</span>` : ''}
      </div>
      <span class="transport-route-name">${routeName}</span>
    </div>
  `;

    return transportItem;
}
