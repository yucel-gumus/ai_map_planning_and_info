/// <reference types="@types/google.maps" />
import type { Location, LocationArgs, LineArgs, Line } from '../types';
import { getMapServiceAsync, MapService } from '../services/map.service';

interface MapHookState {
    mapService: MapService | null;
    activeCardIndex: number;
}

const state: MapHookState = {
    mapService: null,
    activeCardIndex: 0,
};

export async function initializeMap(containerId: string): Promise<void> {
    state.mapService = await getMapServiceAsync(containerId);
}

export function getMap(): MapService {
    if (!state.mapService) {
        throw new Error('Map henüz başlatılmadı. initializeMap() önce çağrılmalı.');
    }
    return state.mapService;
}

export function getGoogleMap(): google.maps.Map {
    return getMap().getMap();
}

export function getPopUps(): Location[] {
    return getMap().getPopUps();
}

export function getLines(): Line[] {
    return getMap().getLines();
}

export function getMarkers(): google.maps.Marker[] {
    return getMap().getMarkers();
}

export function getBounds(): google.maps.LatLngBounds {
    return getMap().getBounds();
}

export function getActiveCardIndex(): number {
    return state.activeCardIndex;
}

export function setActiveCardIndex(index: number): void {
    state.activeCardIndex = index;
}

export async function addLocation(args: LocationArgs, isPlannerMode: boolean): Promise<Location> {
    return getMap().addMarker(args, isPlannerMode);
}

export async function addRoute(args: LineArgs, isPlannerMode: boolean): Promise<Line> {
    return getMap().addLine(args, isPlannerMode);
}

export function panTo(position: google.maps.LatLng): void {
    getMap().panTo(position);
}

export function fitBounds(): void {
    getMap().fitBounds();
}

export function closeAllPopups(): void {
    getMap().closeAllPopups();
}

export function openPopup(index: number): void {
    getMap().openPopup(index);
}

export function clearMap(): void {
    getMap().clear();
    state.activeCardIndex = 0;
}

export function invalidateSize(): void {
    getMap().invalidateSize();
}

export function navigateCards(direction: number): number | null {
    const popUps = getPopUps();
    const newIndex = state.activeCardIndex + direction;

    if (newIndex >= 0 && newIndex < popUps.length) {
        state.activeCardIndex = newIndex;
        return newIndex;
    }

    return null;
}
