/**
 * ModeToggle Component
 * @module components/Search/ModeToggle
 */

import { $, on } from '../../utils/dom.utils';
import {
    isPlannerMode,
    setPlannerMode,
    getPlaceholderText
} from '../../hooks/usePlanner';
import { hideTimeline } from '../../hooks/useTimeline';

// ─────────────────────────────────────────────────────────────────────────────
// DOM Elements
// ─────────────────────────────────────────────────────────────────────────────

let toggleElement: HTMLInputElement | null = null;
let promptElement: HTMLTextAreaElement | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// Event Handlers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Toggle change handler
 */
function handleToggleChange(): void {
    if (!toggleElement || !promptElement) return;

    const newMode = toggleElement.checked;
    setPlannerMode(newMode);

    // Placeholder güncelle
    promptElement.placeholder = getPlaceholderText();

    // Planner modu kapatıldığında timeline'ı gizle
    if (!newMode) {
        hideTimeline();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ModeToggle'ı başlatır
 */
export function initModeToggle(): void {
    toggleElement = $<HTMLInputElement>('#planner-mode-toggle');
    promptElement = $<HTMLTextAreaElement>('#prompt-input');

    if (toggleElement) {
        on(toggleElement, 'change', handleToggleChange);

        // Initial state
        toggleElement.checked = isPlannerMode();
    }
}

/**
 * Mode toggle state'ini döndürür
 */
export function getModeToggleState(): boolean {
    return toggleElement?.checked ?? false;
}

/**
 * Mode toggle state'ini set eder
 */
export function setModeToggleState(value: boolean): void {
    if (toggleElement) {
        toggleElement.checked = value;
        setPlannerMode(value);
    }
}
