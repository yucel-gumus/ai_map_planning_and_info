/**
 * TimelineItem Component
 * @module components/Timeline/TimelineItem
 */

import { createElement } from '../../utils/dom.utils';
import type { Location } from '../../types';

/**
 * Timeline item elementi oluşturur
 * @param item - Location bilgisi
 * @param index - Item index
 * @param onItemClick - Click callback
 * @returns Timeline item elementi
 */
export function createTimelineItem(
    item: Location,
    index: number,
    onItemClick: (index: number, itemName: string) => void
): HTMLDivElement {
    const timelineItem = createElement('div', { className: 'timeline-item' });
    const timeDisplay = item.time || 'Esnek';

    timelineItem.innerHTML = `
    <div class="timeline-time">${timeDisplay}</div>
    <div class="timeline-connector">
      <div class="timeline-dot"></div>
      <div class="timeline-line"></div>
    </div>
    <div class="timeline-content" data-index="${index}">
      <div class="timeline-title">${item.name}</div>
      <div class="timeline-description">${item.description}</div>
      ${item.duration ? `<div class="timeline-duration">${item.duration}</div>` : ''}
    </div>
  `;

    const timelineContent = timelineItem.querySelector('.timeline-content');
    if (timelineContent) {
        timelineContent.addEventListener('click', () => {
            onItemClick(index, item.name);
        });
    }

    return timelineItem;
}

/**
 * Transport item elementi oluşturur
 * @param transportType - Transport tipi
 * @param transportIcon - Transport icon'u
 * @param routeName - Rota adı
 * @param travelTime - Seyahat süresi
 * @returns Transport item elementi
 */
export function createTransportItem(
    transportType: string,
    transportIcon: string,
    routeName: string,
    travelTime?: string
): HTMLDivElement {
    const transportItem = createElement('div', {
        className: 'timeline-item transport-item'
    });

    transportItem.innerHTML = `
    <div class="timeline-time"></div>
    <div class="timeline-connector">
      <div class="timeline-dot" style="background-color: #999;"></div>
      <div class="timeline-line"></div>
    </div>
    <div class="timeline-content transport">
      <div class="timeline-title">
        <i class="fas fa-${transportIcon}"></i>
        ${transportType || 'Seyahat'}
      </div>
      <div class="timeline-description">${routeName}</div>
      ${travelTime ? `<div class="timeline-duration">${travelTime}</div>` : ''}
    </div>
  `;

    return transportItem;
}
