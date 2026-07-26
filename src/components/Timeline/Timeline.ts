/**
 * Timeline Component (Top Right Floating Actions: Export Plan & AI Re-Plan)
 * @module components/Timeline/Timeline
 */

import { $, on } from '../../utils/dom.utils';
import {
    exportDayPlan as exportPlan,
    onExcludeChange,
    getExcludedLocations,
    isPlannerMode
} from '../../hooks/usePlanner';
import { getLines } from '../../hooks/useMap';

let exportButton: HTMLButtonElement | null = null;
type RePlanCallback = (excludedLocations: string[]) => void;
let onRePlanRequested: RePlanCallback | null = null;

/**
 * Renders only the Top-Right Floating Actions Bar (Export & AI Re-Plan)
 */
export function renderTimeline(): void {
    const actionsBar = $('#planner-actions-bar');
    if (!actionsBar) return;

    if (!isPlannerMode()) {
        (actionsBar as HTMLElement).style.display = 'none';
        return;
    }

    (actionsBar as HTMLElement).style.display = 'flex';

    const excluded = getExcludedLocations();
    let replanBar = $('#timeline-replan-bar');

    if (excluded.length > 0) {
        if (!replanBar) {
            replanBar = document.createElement('div');
            replanBar.id = 'timeline-replan-bar';
            replanBar.className = 'timeline-replan-bar';
            actionsBar.appendChild(replanBar);
        }

        replanBar.innerHTML = `
            <div class="replan-info">
              <span class="replan-badge"><i class="fas fa-filter"></i> <strong>${excluded.length}</strong> Mekan Çıkarıldı</span>
            </div>
            <button id="btn-trigger-replan" class="btn-replan-action">
              <i class="fas fa-magic"></i> Yapay Zeka ile Planı Güncelle
            </button>
        `;
        (replanBar as HTMLElement).style.display = 'flex';

        const replanBtn = replanBar.querySelector('#btn-trigger-replan');
        replanBtn?.addEventListener('click', () => {
            if (onRePlanRequested) {
                onRePlanRequested(getExcludedLocations());
            }
        });
    } else if (replanBar) {
        (replanBar as HTMLElement).style.display = 'none';
    }
}

/**
 * Initializes Timeline / Planner Action Bar
 */
export function initTimeline(
    _cardHighlightCallback?: (index: number) => void,
    rePlanCallback?: RePlanCallback
): void {
    exportButton = $<HTMLButtonElement>('#export-plan');

    if (rePlanCallback) {
        onRePlanRequested = rePlanCallback;
    }

    onExcludeChange(() => renderTimeline());

    if (exportButton) {
        on(exportButton, 'click', () => {
            exportPlan(getLines());
        });
    }
}

export function showTimelineWithContent(): void {
    renderTimeline();
}

export function showTimeline(): void {
    renderTimeline();
}

export function hideTimeline(): void {
    const actionsBar = $('#planner-actions-bar');
    if (actionsBar) (actionsBar as HTMLElement).style.display = 'none';
}

export function highlightTimelineItem(_index: number): void {
    // Floating top right bar requires no list item highlighting
}
