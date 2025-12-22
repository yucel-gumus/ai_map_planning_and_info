import type { Location, Line } from '../types';
import { exportDayPlan as exportPlan } from '../utils/export.utils';

interface PlannerHookState {
    isPlannerMode: boolean;
    dayPlanItinerary: Location[];
}

const state: PlannerHookState = {
    isPlannerMode: false,
    dayPlanItinerary: [],
};

type ModeChangeCallback = (isPlannerMode: boolean) => void;
const subscribers: ModeChangeCallback[] = [];

export function onModeChange(callback: ModeChangeCallback): () => void {
    subscribers.push(callback);
    return () => {
        const index = subscribers.indexOf(callback);
        if (index > -1) {
            subscribers.splice(index, 1);
        }
    };
}

function notifySubscribers(): void {
    subscribers.forEach(callback => callback(state.isPlannerMode));
}

export function isPlannerMode(): boolean {
    return state.isPlannerMode;
}

export function setPlannerMode(value: boolean): void {
    state.isPlannerMode = value;
    notifySubscribers();
}

export function togglePlannerMode(): boolean {
    state.isPlannerMode = !state.isPlannerMode;
    notifySubscribers();
    return state.isPlannerMode;
}

export function getDayPlanItinerary(): Location[] {
    return state.dayPlanItinerary;
}

export function setDayPlanItinerary(itinerary: Location[]): void {
    state.dayPlanItinerary = itinerary;
}

export function addToDayPlan(location: Location): void {
    state.dayPlanItinerary.push(location);
}

export function clearDayPlan(): void {
    state.dayPlanItinerary = [];
}

export function sortDayPlanItinerary(): void {
    state.dayPlanItinerary.sort(
        (a, b) =>
            (a.sequence || Infinity) - (b.sequence || Infinity) ||
            (a.time || '').localeCompare(b.time || '')
    );
}

export function exportDayPlan(lines: Line[]): void {
    if (state.dayPlanItinerary.length === 0) return;
    exportPlan(state.dayPlanItinerary, lines);
}

export function resetPlanner(): void {
    state.isPlannerMode = false;
    state.dayPlanItinerary = [];
}

export function getPlaceholderText(): string {
    return state.isPlannerMode
        ? "Günlük plan oluştur... (örn.'İstanbul'da bir gün')"
        : 'Yerler, tarih, etkinlikler keşfedin veya herhangi bir konum hakkında sorun...';
}
