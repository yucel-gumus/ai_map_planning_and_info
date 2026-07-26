import type { Location, Line } from '../types';
import { exportDayPlan as exportPlan } from '../utils/export.utils';

interface PlannerHookState {
    isPlannerMode: boolean;
    dayPlanItinerary: Location[];
    visitedLocations: Set<string>;
    excludedLocations: Set<string>;
    activeDayFilter: number | 'all';
    noticeMessage: string | null;
}

const state: PlannerHookState = {
    isPlannerMode: false,
    dayPlanItinerary: [],
    visitedLocations: new Set<string>(),
    excludedLocations: new Set<string>(),
    activeDayFilter: 'all',
    noticeMessage: null,
};

type ModeChangeCallback = (isPlannerMode: boolean) => void;
const subscribers: ModeChangeCallback[] = [];

type FilterChangeCallback = (day: number | 'all') => void;
const filterSubscribers: FilterChangeCallback[] = [];

type ExcludeChangeCallback = (excluded: string[]) => void;
const excludeSubscribers: ExcludeChangeCallback[] = [];

export function onModeChange(callback: ModeChangeCallback): () => void {
    subscribers.push(callback);
    return () => {
        const index = subscribers.indexOf(callback);
        if (index > -1) {
            subscribers.splice(index, 1);
        }
    };
}

export function onFilterChange(callback: FilterChangeCallback): () => void {
    filterSubscribers.push(callback);
    return () => {
        const index = filterSubscribers.indexOf(callback);
        if (index > -1) {
            filterSubscribers.splice(index, 1);
        }
    };
}

export function onExcludeChange(callback: ExcludeChangeCallback): () => void {
    excludeSubscribers.push(callback);
    return () => {
        const index = excludeSubscribers.indexOf(callback);
        if (index > -1) {
            excludeSubscribers.splice(index, 1);
        }
    };
}

function notifySubscribers(): void {
    subscribers.forEach(callback => callback(state.isPlannerMode));
}

function notifyFilterSubscribers(): void {
    filterSubscribers.forEach(callback => callback(state.activeDayFilter));
}

function notifyExcludeSubscribers(): void {
    excludeSubscribers.forEach(callback => callback(Array.from(state.excludedLocations)));
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
    state.visitedLocations.clear();
    state.excludedLocations.clear();
    state.activeDayFilter = 'all';
    state.noticeMessage = null;
    notifyExcludeSubscribers();
    notifyFilterSubscribers();
}

export function sortDayPlanItinerary(): void {
    state.dayPlanItinerary.sort(
        (a, b) =>
            (a.day || 1) - (b.day || 1) ||
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
    state.visitedLocations.clear();
    state.excludedLocations.clear();
    state.activeDayFilter = 'all';
    state.noticeMessage = null;
    notifyExcludeSubscribers();
    notifyFilterSubscribers();
}

export function getPlaceholderText(): string {
    return state.isPlannerMode
        ? "Çoklu gün seyahat planı.('İstanbul 3 günlük gezisi' veya 'Fethiye 5 gün')"
        : 'Yerler, tarih, etkinlikler keşfedin veya herhangi bir konum hakkında sorun...';
}

/* Visited & Excluded Places Management */
export function toggleVisitedLocation(name: string): boolean {
    if (state.visitedLocations.has(name)) {
        state.visitedLocations.delete(name);
        return false;
    } else {
        state.visitedLocations.add(name);
        state.excludedLocations.delete(name); // Visited is not excluded, it's marked
        return true;
    }
}

export function isVisitedLocation(name: string): boolean {
    return state.visitedLocations.has(name);
}

export function toggleExcludedLocation(name: string): boolean {
    let result = false;
    if (state.excludedLocations.has(name)) {
        state.excludedLocations.delete(name);
        result = false;
    } else {
        state.excludedLocations.add(name);
        state.visitedLocations.delete(name);
        result = true;
    }
    notifyExcludeSubscribers();
    return result;
}

export function isExcludedLocation(name: string): boolean {
    return state.excludedLocations.has(name);
}

export function getExcludedLocations(): string[] {
    return Array.from(state.excludedLocations);
}

export function getVisitedLocations(): string[] {
    return Array.from(state.visitedLocations);
}

export function clearExclusions(): void {
    state.excludedLocations.clear();
    notifyExcludeSubscribers();
}

/* Day Filter Management */
export function setDayFilter(day: number | 'all'): void {
    state.activeDayFilter = day;
    notifyFilterSubscribers();
}

export function getDayFilter(): number | 'all' {
    return state.activeDayFilter;
}

export function getUniqueDays(): number[] {
    const days = new Set<number>();
    state.dayPlanItinerary.forEach(loc => {
        if (loc.day && loc.day > 0) {
            days.add(loc.day);
        }
    });
    return Array.from(days).sort((a, b) => a - b);
}

/* Capacity Notice Management */
export function setNoticeMessage(msg: string | null): void {
    state.noticeMessage = msg;
}

export function getNoticeMessage(): string | null {
    return state.noticeMessage;
}
