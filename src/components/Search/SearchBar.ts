/**
 * SearchBar Component
 * @module components/Search/SearchBar
 */

import { $, addClass, removeClass, on, setHTML } from '../../utils/dom.utils';
import { isPlannerMode } from '../../hooks/usePlanner';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type SearchCallback = (query: string, isPlannerMode: boolean) => Promise<void>;
type ResetCallback = () => void;

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────

let onSearchCallback: SearchCallback | null = null;
let onResetCallback: ResetCallback | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// DOM Elements
// ─────────────────────────────────────────────────────────────────────────────

let promptInput: HTMLTextAreaElement | null = null;
let generateButton: HTMLButtonElement | null = null;
let resetButton: HTMLButtonElement | null = null;
let loadingOverlay: HTMLDivElement | null = null;
let errorMessage: HTMLDivElement | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// Event Handlers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Search işlemini gerçekleştirir
 */
async function handleSearch(): Promise<void> {
    if (!promptInput || !onSearchCallback) return;

    const query = promptInput.value.trim();
    if (!query) return;

    showLoading();
    clearError();

    try {
        await onSearchCallback(query, isPlannerMode());
        promptInput.value = '';
    } catch (error) {
        showError(error instanceof Error ? error.message : 'Bir hata oluştu');
    } finally {
        hideLoading();
    }
}

/**
 * Enter key handler
 */
function handleKeyDown(e: KeyboardEvent): void {
    if (e.code === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        handleSearch();
    }
}

/**
 * Generate button click handler
 */
function handleGenerateClick(): void {
    handleSearch();
}

/**
 * Reset button click handler
 */
function handleResetClick(): void {
    if (onResetCallback) {
        onResetCallback();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading & Error UI
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Loading state'ini gösterir
 */
export function showLoading(): void {
    addClass(generateButton, 'loading');
    addClass(loadingOverlay, 'visible');
}

/**
 * Loading state'ini gizler
 */
export function hideLoading(): void {
    removeClass(generateButton, 'loading');
    removeClass(loadingOverlay, 'visible');
}

/**
 * Hata mesajını gösterir
 */
export function showError(message: string): void {
    if (errorMessage) {
        setHTML(errorMessage, message);
    }
}

/**
 * Hata mesajını temizler
 */
export function clearError(): void {
    if (errorMessage) {
        setHTML(errorMessage, '');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SearchBar'ı başlatır
 * @param onSearch - Search callback
 * @param onReset - Reset callback
 */
export function initSearchBar(
    onSearch: SearchCallback,
    onReset: ResetCallback
): void {
    // DOM elements
    promptInput = $<HTMLTextAreaElement>('#prompt-input');
    generateButton = $<HTMLButtonElement>('#generate');
    resetButton = $<HTMLButtonElement>('#reset');
    loadingOverlay = $<HTMLDivElement>('#loading-overlay');
    errorMessage = $<HTMLDivElement>('#error-message');

    // Callbacks
    onSearchCallback = onSearch;
    onResetCallback = onReset;

    // Event listeners
    if (promptInput) {
        on(promptInput, 'keydown', handleKeyDown);
    }

    if (generateButton) {
        on(generateButton, 'click', handleGenerateClick);
    }

    if (resetButton) {
        on(resetButton, 'click', handleResetClick);
    }
}

/**
 * Prompt input değerini döndürür
 */
export function getPromptValue(): string {
    return promptInput?.value ?? '';
}

/**
 * Prompt input değerini set eder
 */
export function setPromptValue(value: string): void {
    if (promptInput) {
        promptInput.value = value;
    }
}

/**
 * Prompt input placeholder'ını set eder
 */
export function setPromptPlaceholder(placeholder: string): void {
    if (promptInput) {
        promptInput.placeholder = placeholder;
    }
}
