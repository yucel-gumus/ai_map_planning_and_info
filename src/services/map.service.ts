import * as L from 'leaflet';
import type { Location, LocationArgs, LineArgs, Line } from '../types';
import {
    DEFAULT_MAP_OPTIONS,
    TILE_LAYER_URL,
    TILE_LAYER_ATTRIBUTION,
    POLYLINE_OPTIONS,
    POPUP_OPTIONS
} from '../constants';
import { fetchLocationImage } from './image.service';
import { generatePlaceholderImage } from '../utils/transport.utils';

export class MapService {
    private map: L.Map;
    private bounds: L.LatLngBounds;
    private markers: L.Marker[] = [];
    private lines: Line[] = [];
    private popUps: Location[] = [];
    private points: L.LatLngExpression[] = [];

    constructor(containerId: string) {
        this.bounds = L.latLngBounds([]);
        this.map = this.initializeMap(containerId);
    }

    private initializeMap(containerId: string): L.Map {
        const map = L.map(containerId, DEFAULT_MAP_OPTIONS);
        L.tileLayer(TILE_LAYER_URL, {
            attribution: TILE_LAYER_ATTRIBUTION,
            minZoom: DEFAULT_MAP_OPTIONS.minZoom,
            maxZoom: DEFAULT_MAP_OPTIONS.maxZoom,
        }).addTo(map);
        return map;
    }

    getMap(): L.Map {
        return this.map;
    }

    getBounds(): L.LatLngBounds {
        return this.bounds;
    }

    getMarkers(): L.Marker[] {
        return this.markers;
    }

    getLines(): Line[] {
        return this.lines;
    }

    getPopUps(): Location[] {
        return this.popUps;
    }

    async addMarker(args: LocationArgs, isPlannerMode: boolean): Promise<Location> {
        const lat = Number(args.lat);
        const lng = Number(args.lng);
        const latlng = L.latLng(lat, lng);

        this.points.push(latlng);
        this.bounds.extend(latlng);

        const customIcon = L.divIcon({
            className: 'custom-map-marker',
            html: `<div class="marker-pin-wrapper">${args.sequence ? args.sequence : '<i class="fas fa-map-marker-alt"></i>'}</div>`,
            iconSize: [38, 38],
            iconAnchor: [19, 19],
        });

        const marker = L.marker(latlng, {
            title: args.name,
            icon: customIcon,
        }).addTo(this.map);

        this.markers.push(marker);

        this.map.panTo(latlng);
        if (this.bounds.isValid()) {
            this.map.fitBounds(this.bounds);
        }

        let timeInfo = '';
        if (args.time) {
            timeInfo = `<div class="popup-time-info">
                    <i class="fas fa-clock"></i> ${args.time}
                    ${args.duration ? ` • ${args.duration}` : ''}
                  </div>`;
        }

        const popupContent = `<div class="popup-bubble"><b>${args.name}</b><br/>${args.description}${timeInfo}</div>`;
        const popup = L.popup(POPUP_OPTIONS).setContent(popupContent);
        marker.bindPopup(popup);

        if (!isPlannerMode) {
            marker.openPopup();
        }

        const locationInfo: Location = {
            name: args.name,
            description: args.description,
            position: latlng,
            popup,
            marker,
            time: args.time,
            duration: args.duration,
            sequence: args.sequence,
            day: args.day,
            imageUrl: args.imageUrl || generatePlaceholderImage(args.name),
        };

        // Asynchronously fetch and validate real photo from AI or Wikipedia API
        fetchLocationImage(args.name, args.imageUrl).then(imgUrl => {
            if (imgUrl) {
                locationInfo.imageUrl = imgUrl;
                const updateCardDOM = () => {
                    const cardImg = document.querySelector(`.location-card[data-name="${CSS.escape(args.name)}"] .card-image`);
                    if (cardImg) {
                        (cardImg as HTMLElement).style.backgroundImage = `url('${imgUrl}')`;
                    }
                };
                updateCardDOM();
                setTimeout(updateCardDOM, 300);
                setTimeout(updateCardDOM, 1000);
            }
        });

        this.popUps.push(locationInfo);
        return locationInfo;
    }

    async addLine(args: LineArgs, isPlannerMode: boolean): Promise<Line> {
        const startLat = Number(args.start.lat);
        const startLng = Number(args.start.lng);
        const endLat = Number(args.end.lat);
        const endLng = Number(args.end.lng);

        const start = L.latLng(startLat, startLng);
        const end = L.latLng(endLat, endLng);

        this.points.push(start);
        this.points.push(end);
        this.bounds.extend(start);
        this.bounds.extend(end);

        if (this.bounds.isValid()) {
            this.map.fitBounds(this.bounds);
        }

        const options = isPlannerMode
            ? { ...POLYLINE_OPTIONS.planner }
            : { ...POLYLINE_OPTIONS.default };

        const poly = L.polyline([start, end], options).addTo(this.map);

        const lineInfo: Line = {
            poly,
            name: args.name,
            transport: args.transport,
            travelTime: args.travelTime,
        };

        this.lines.push(lineInfo);
        return lineInfo;
    }

    panTo(position: L.LatLng): void {
        this.map.panTo(position);
    }

    fitBounds(): void {
        if (this.bounds && this.bounds.isValid()) {
            this.map.fitBounds(this.bounds, { padding: [50, 50], maxZoom: 16 });
        }
    }

    closeAllPopups(): void {
        this.markers.forEach(marker => marker.closePopup());
    }

    openPopup(index: number): void {
        if (this.markers[index]) {
            this.markers[index].openPopup();
        }
    }

    clear(): void {
        this.markers.forEach(marker => marker.remove());
        this.markers = [];
        this.lines.forEach(line => line.poly.remove());
        this.lines = [];
        this.popUps.forEach(popup => popup.popup.remove());
        this.popUps = [];
        this.points = [];
        this.bounds = L.latLngBounds([]);
    }

    invalidateSize(): void {
        this.map.invalidateSize();
    }
}

let mapServiceInstance: MapService | null = null;

export function getMapService(containerId?: string): MapService {
    if (!mapServiceInstance) {
        if (!containerId) {
            throw new Error('Container ID gerekli');
        }
        mapServiceInstance = new MapService(containerId);
    }
    return mapServiceInstance;
}

export function resetMapService(): void {
    mapServiceInstance = null;
}
