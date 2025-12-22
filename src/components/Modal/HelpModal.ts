/**
 * HelpModal Component
 * @module components/Modal/HelpModal
 */

import { $, on, addClass, removeClass } from '../../utils/dom.utils';

// ─────────────────────────────────────────────────────────────────────────────
// DOM Elements
// ─────────────────────────────────────────────────────────────────────────────

let helpButton: HTMLButtonElement | null = null;
let helpModal: HTMLDivElement | null = null;
let helpCloseButton: HTMLButtonElement | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// Modal Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Help modal'ı gösterir
 */
export function showHelpModal(): void {
    if (helpModal) {
        addClass(helpModal, 'visible');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Help modal'ı gizler
 */
export function hideHelpModal(): void {
    if (helpModal) {
        removeClass(helpModal, 'visible');
        document.body.style.overflow = 'auto';
    }
}

/**
 * Modal backdrop click handler
 */
function handleBackdropClick(e: MouseEvent): void {
    if (e.target === helpModal) {
        hideHelpModal();
    }
}

/**
 * Escape key handler
 */
function handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
        hideHelpModal();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * HelpModal'ı başlatır
 */
export function initHelpModal(): void {
    helpButton = $<HTMLButtonElement>('#help-button');
    helpModal = $<HTMLDivElement>('#help-modal');
    helpCloseButton = $<HTMLButtonElement>('#help-close');

    // Event listeners
    if (helpButton) {
        on(helpButton, 'click', showHelpModal);
    }

    if (helpCloseButton) {
        on(helpCloseButton, 'click', hideHelpModal);
    }

    if (helpModal) {
        on(helpModal, 'click', handleBackdropClick);
    }

    // Global escape key handler
    document.addEventListener('keydown', handleKeyDown);
}

/**
 * Help modal görünür mü
 */
export function isHelpModalVisible(): boolean {
    return helpModal?.classList.contains('visible') ?? false;
}
