/// <reference types="@types/google.maps" />

/**
 * Google Maps Platform Map Service
 * @module services/map.service
 * @description Native Google Maps JavaScript API: markers, real road routes, Street View, place photos
 */

import type { Location, LocationArgs, LineArgs, Line } from '../types';
import {
    DEFAULT_MAP_OPTIONS,
    GOOGLE_MAPS_API_KEY,
    DEFAULT_POLYLINE_COLOR,
    PLANNER_POLYLINE_COLOR
} from '../constants';
import { fetchLocationImage } from './image.service';
import { generatePlaceholderImage } from '../utils/transport.utils';

let googleMapsScriptPromise: Promise<void> | null = null;

/**
 * Dynamically loads the Google Maps JavaScript API script if not already present
 */
export function loadGoogleMapsScript(): Promise<void> {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
        return Promise.resolve();
    }

    if (googleMapsScriptPromise) {
        return googleMapsScriptPromise;
    }

    googleMapsScriptPromise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve());
            existingScript.addEventListener('error', (e) => reject(e));
            return;
        }

        if (!GOOGLE_MAPS_API_KEY) {
            reject(new Error('VITE_GOOGLE_MAPS_API_KEY tanımlı değil'));
            return;
        }

        const script = document.createElement('script');
        // places + geometry + drawing-ready libraries
        script.src =
            `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}` +
            `&libraries=places,geometry&language=tr&region=TR&v=weekly`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = (err) => reject(err);
        document.head.appendChild(script);
    });

    return googleMapsScriptPromise;
}

/**
 * Generates a custom SVG Marker Data URL with sequence number or icon
 */
function createMarkerSvgIcon(sequence?: number): string {
    const text = sequence !== undefined && sequence !== null ? String(sequence) : '●';
    const bg = '#4F9D88';
    const border = '#E28B7B';
    const textColor = '#F5E1C8';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
  <circle cx="22" cy="22" r="18" fill="${bg}" stroke="${border}" stroke-width="3" />
  <text x="22" y="27" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="${sequence != null ? 15 : 12}" font-weight="800" fill="${textColor}" text-anchor="middle">${text}</text>
</svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

function resolveTravelMode(transport?: string): google.maps.TravelMode {
    const t = (transport || '').toLowerCase();
    if (t.includes('yürü') || t.includes('walk') || t.includes('yaya')) {
        return google.maps.TravelMode.WALKING;
    }
    if (t.includes('bisiklet') || t.includes('bike') || t.includes('cycle')) {
        return google.maps.TravelMode.BICYCLING;
    }
    if (
        t.includes('toplu') ||
        t.includes('transit') ||
        t.includes('bus') ||
        t.includes('otobüs') ||
        t.includes('metro') ||
        t.includes('tren')
    ) {
        return google.maps.TravelMode.TRANSIT;
    }
    return google.maps.TravelMode.DRIVING;
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function buildInfoWindowHtml(args: {
    name: string;
    description: string;
    time?: string;
    duration?: string;
    lat: number;
    lng: number;
    imageUrl?: string;
    rating?: number;
}): string {
    const safeName = escapeHtml(args.name);
    const safeDesc = escapeHtml(args.description);
    const jsName = args.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

    let timeInfo = '';
    if (args.time) {
        timeInfo = `<div class="popup-time-info">
            <i class="fas fa-clock"></i> ${escapeHtml(args.time)}
            ${args.duration ? ` • ${escapeHtml(args.duration)}` : ''}
          </div>`;
    }

    const imgBlock = args.imageUrl
        ? `<div class="popup-photo" style="background-image:url('${args.imageUrl.replace(/'/g, "%27")}')"></div>`
        : `<div class="popup-photo popup-photo-placeholder"><i class="fas fa-map-marker-alt"></i></div>`;

    const ratingBlock =
        args.rating != null
            ? `<div class="popup-rating"><i class="fas fa-star"></i> ${args.rating.toFixed(1)}</div>`
            : '';

    return `<div class="popup-bubble">
      ${imgBlock}
      <div class="popup-body">
        <b class="popup-title">${safeName}</b>
        ${ratingBlock}
        <span class="popup-desc">${safeDesc}</span>
        ${timeInfo}
        <div class="popup-actions">
          <button class="btn-pano-trigger" type="button"
            onclick="window.__openStreetView('${jsName}', ${args.lat}, ${args.lng})">
            <i class="fas fa-street-view"></i> 360° Sokak Görünümü
          </button>
        </div>
      </div>
    </div>`;
}

export class MapService {
    private map: google.maps.Map;
    private bounds: google.maps.LatLngBounds;
    private markers: google.maps.Marker[] = [];
    private lines: Line[] = [];
    private popUps: Location[] = [];
    private points: google.maps.LatLng[] = [];
    private activeInfoWindow: google.maps.InfoWindow | null = null;
    private routeLabels: google.maps.Marker[] = [];

    constructor(containerId: string) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Harita konteynırı bulunamadı: #${containerId}`);
        }
        this.bounds = new google.maps.LatLngBounds();
        this.map = this.initializeMap(container);
    }

    private initializeMap(container: HTMLElement): google.maps.Map {
        const mapOptions: google.maps.MapOptions = {
            center: DEFAULT_MAP_OPTIONS.center,
            zoom: DEFAULT_MAP_OPTIONS.zoom,
            mapTypeId: google.maps.MapTypeId.TERRAIN,
            zoomControl: false,
            // No map type picker — always terrain
            mapTypeControl: false,
            // Pegman on main map pulls Street View tiles; keep off to avoid quota spikes
            streetViewControl: false,
            fullscreenControl: false,
            // No camera rotate/tilt controls
            rotateControl: false,
            cameraControl: false,
            tilt: 0,
            heading: 0,
            scaleControl: true,
            gestureHandling: 'greedy',
            clickableIcons: false,
        };

        return new google.maps.Map(container, mapOptions);
    }

    getMap(): google.maps.Map {
        return this.map;
    }

    getBounds(): google.maps.LatLngBounds {
        return this.bounds;
    }

    getMarkers(): google.maps.Marker[] {
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
        const latlng = new google.maps.LatLng(lat, lng);

        this.points.push(latlng);
        this.bounds.extend(latlng);

        const iconUrl = createMarkerSvgIcon(args.sequence);

        const marker = new google.maps.Marker({
            position: latlng,
            map: this.map,
            title: args.name,
            animation: google.maps.Animation.DROP,
            icon: {
                url: iconUrl,
                scaledSize: new google.maps.Size(42, 42),
                anchor: new google.maps.Point(21, 21),
            },
            zIndex: args.sequence ?? 1,
        });

        this.markers.push(marker);

        this.map.panTo(latlng);
        if (!this.bounds.isEmpty()) {
            this.map.fitBounds(this.bounds, 64);
        }

        const initialHtml = buildInfoWindowHtml({
            name: args.name,
            description: args.description,
            time: args.time,
            duration: args.duration,
            lat,
            lng,
            imageUrl: args.imageUrl,
        });

        const infoWindow = new google.maps.InfoWindow({
            content: initialHtml,
            maxWidth: 300,
        });

        marker.addListener('click', () => {
            if (this.activeInfoWindow) {
                this.activeInfoWindow.close();
            }
            infoWindow.open(this.map, marker);
            this.activeInfoWindow = infoWindow;
        });

        if (!isPlannerMode) {
            infoWindow.open(this.map, marker);
            this.activeInfoWindow = infoWindow;
        }

        const locationInfo: Location = {
            name: args.name,
            description: args.description,
            position: latlng,
            popup: infoWindow,
            marker,
            time: args.time,
            duration: args.duration,
            sequence: args.sequence,
            day: args.day,
            imageUrl: args.imageUrl || generatePlaceholderImage(args.name),
        };

        // Async: real Places / Street View photo → update card + InfoWindow
        fetchLocationImage(args.name, args.imageUrl, lat, lng).then((imgUrl) => {
            if (!imgUrl) return;

            locationInfo.imageUrl = imgUrl;

            const updateCardDOM = () => {
                const cardImg = document.querySelector(
                    `.location-card[data-name="${CSS.escape(args.name)}"] .card-image`
                );
                if (cardImg) {
                    (cardImg as HTMLElement).style.backgroundImage = `url('${imgUrl}')`;
                    cardImg.classList.add('card-image-loaded');
                }
            };
            updateCardDOM();
            setTimeout(updateCardDOM, 300);
            setTimeout(updateCardDOM, 1000);

            // Refresh InfoWindow content with photo
            infoWindow.setContent(
                buildInfoWindowHtml({
                    name: args.name,
                    description: args.description,
                    time: args.time,
                    duration: args.duration,
                    lat,
                    lng,
                    imageUrl: imgUrl,
                })
            );
        });

        this.popUps.push(locationInfo);
        return locationInfo;
    }

    /**
     * Draws a route between two points using Google Directions (real roads).
     * Falls back to geodesic straight line if Directions fails.
     */
    async addLine(args: LineArgs, isPlannerMode: boolean): Promise<Line> {
        const startLat = Number(args.start.lat);
        const startLng = Number(args.start.lng);
        const endLat = Number(args.end.lat);
        const endLng = Number(args.end.lng);

        const start = new google.maps.LatLng(startLat, startLng);
        const end = new google.maps.LatLng(endLat, endLng);

        this.points.push(start);
        this.points.push(end);
        this.bounds.extend(start);
        this.bounds.extend(end);

        if (!this.bounds.isEmpty()) {
            this.map.fitBounds(this.bounds, 64);
        }

        const strokeColor = isPlannerMode ? PLANNER_POLYLINE_COLOR : DEFAULT_POLYLINE_COLOR;

        const poly = new google.maps.Polyline({
            path: [start, end],
            geodesic: true,
            strokeColor,
            strokeOpacity: 0.92,
            strokeWeight: isPlannerMode ? 6 : 5,
            map: this.map,
            icons: [
                {
                    icon: {
                        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                        scale: 3,
                        strokeColor,
                        fillColor: strokeColor,
                        fillOpacity: 1,
                    },
                    offset: '50%',
                    repeat: '120px',
                },
            ],
        });

        const lineInfo: Line = {
            poly,
            name: args.name,
            transport: args.transport,
            travelTime: args.travelTime,
        };

        try {
            const directionsService = new google.maps.DirectionsService();
            const travelMode = resolveTravelMode(args.transport);

            const result = await new Promise<google.maps.DirectionsResult | null>((resolve) => {
                directionsService.route(
                    {
                        origin: start,
                        destination: end,
                        travelMode,
                        provideRouteAlternatives: false,
                        unitSystem: google.maps.UnitSystem.METRIC,
                        region: 'TR',
                    },
                    (res, status) => {
                        if (status === google.maps.DirectionsStatus.OK && res) {
                            resolve(res);
                        } else {
                            // Transit often fails in small towns — retry as driving
                            if (travelMode === google.maps.TravelMode.TRANSIT) {
                                directionsService.route(
                                    {
                                        origin: start,
                                        destination: end,
                                        travelMode: google.maps.TravelMode.DRIVING,
                                        unitSystem: google.maps.UnitSystem.METRIC,
                                        region: 'TR',
                                    },
                                    (res2, status2) => {
                                        resolve(
                                            status2 === google.maps.DirectionsStatus.OK && res2
                                                ? res2
                                                : null
                                        );
                                    }
                                );
                            } else {
                                resolve(null);
                            }
                        }
                    }
                );
            });

            if (result?.routes?.[0]) {
                const route = result.routes[0];
                if (route.overview_path?.length) {
                    poly.setPath(route.overview_path);
                }

                const leg = route.legs?.[0];
                if (leg) {
                    if (leg.duration?.text) {
                        lineInfo.travelTime = leg.duration.text;
                    }
                    if (leg.distance?.text) {
                        lineInfo.distance = leg.distance.text;
                    }

                    // Midpoint label with duration + distance
                    this.addRouteLabel(
                        leg,
                        args.transport || 'Seyahat',
                        lineInfo.travelTime,
                        lineInfo.distance
                    );
                }
            }
        } catch {
            // Straight geodesic fallback already set
        }

        this.lines.push(lineInfo);
        return lineInfo;
    }

    private addRouteLabel(
        leg: google.maps.DirectionsLeg,
        transport: string,
        travelTime?: string,
        distance?: string
    ): void {
        const steps = leg.steps;
        if (!steps?.length) return;

        // Pick a point roughly in the middle of the leg
        const midStep = steps[Math.floor(steps.length / 2)];
        const pos = midStep?.start_location || leg.start_location;
        if (!pos) return;

        const labelParts = [transport];
        if (travelTime) labelParts.push(travelTime);
        if (distance) labelParts.push(distance);
        const labelText = labelParts.join(' · ');

        const labelSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="28">
  <rect x="1" y="1" rx="10" ry="10" width="198" height="26" fill="#193630" stroke="#4F9D88" stroke-width="2" opacity="0.92"/>
  <text x="100" y="18" text-anchor="middle" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="11" font-weight="700" fill="#F5E1C8">${escapeHtml(labelText).slice(0, 40)}</text>
</svg>`;

        const labelMarker = new google.maps.Marker({
            position: pos,
            map: this.map,
            clickable: false,
            zIndex: 0,
            icon: {
                url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(labelSvg)}`,
                scaledSize: new google.maps.Size(200, 28),
                anchor: new google.maps.Point(100, 14),
            },
        });

        this.routeLabels.push(labelMarker);
    }

    panTo(position: google.maps.LatLng): void {
        this.map.panTo(position);
    }

    fitBounds(): void {
        if (this.bounds && !this.bounds.isEmpty()) {
            this.map.fitBounds(this.bounds, 64);
        }
    }

    closeAllPopups(): void {
        if (this.activeInfoWindow) {
            this.activeInfoWindow.close();
            this.activeInfoWindow = null;
        }
    }

    openPopup(index: number): void {
        if (this.popUps[index]?.popup && this.markers[index]) {
            if (this.activeInfoWindow) {
                this.activeInfoWindow.close();
            }
            this.popUps[index].popup!.open(this.map, this.markers[index]);
            this.activeInfoWindow = this.popUps[index].popup!;
            this.map.panTo(this.popUps[index].position);
        }
    }

    clear(): void {
        this.markers.forEach((marker) => marker.setMap(null));
        this.markers = [];
        this.lines.forEach((line) => line.poly.setMap(null));
        this.lines = [];
        this.routeLabels.forEach((m) => m.setMap(null));
        this.routeLabels = [];
        if (this.activeInfoWindow) {
            this.activeInfoWindow.close();
            this.activeInfoWindow = null;
        }
        this.popUps = [];
        this.points = [];
        this.bounds = new google.maps.LatLngBounds();
    }

    private streetViewPanorama: google.maps.StreetViewPanorama | null = null;
    private streetViewCloseCleanup: (() => void) | null = null;

    openStreetViewPanorama(name: string, lat: number, lng: number): void {
        const modal = document.getElementById('streetview-modal');
        const panoContainer = document.getElementById('streetview-pano');
        const titleEl = document.getElementById('streetview-title');
        const closeBtn = document.getElementById('streetview-close');

        if (!modal || !panoContainer) return;

        // Tear down any previous Street View session first
        this.streetViewCloseCleanup?.();

        if (titleEl) {
            titleEl.innerHTML = `<i class="fas fa-street-view"></i> 360° Google Street View — ${escapeHtml(name)}`;
        }

        modal.style.display = 'flex';
        modal.classList.add('visible');

        // Loading only — do NOT construct StreetViewPanorama until coverage is known.
        // Creating with position + setPosition later double-fetched tiles (429).
        panoContainer.innerHTML = `
          <div class="streetview-unavailable streetview-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Street View yükleniyor…</p>
          </div>`;

        const position = { lat, lng };
        let cancelled = false;
        const sv = new google.maps.StreetViewService();

        sv.getPanorama(
            {
                location: position,
                radius: 120,
                source: google.maps.StreetViewSource.OUTDOOR,
                preference: google.maps.StreetViewPreference.NEAREST,
            },
            (data, status) => {
                if (cancelled) return;

                if (status !== google.maps.StreetViewStatus.OK || !data?.location?.latLng) {
                    panoContainer.innerHTML = `
                      <div class="streetview-unavailable">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Bu konumda Street View kapsaması bulunamadı.</p>
                        <p class="streetview-hint">Yakın bir cadde veya plaj denenebilir.</p>
                      </div>`;
                    this.streetViewPanorama = null;
                    return;
                }

                panoContainer.innerHTML = '';
                this.streetViewPanorama = new google.maps.StreetViewPanorama(panoContainer, {
                    position: data.location.latLng,
                    pano: data.location.pano,
                    pov: { heading: 34, pitch: 10 },
                    zoom: 1,
                    addressControl: true,
                    showRoadLabels: true,
                    motionTracking: false,
                    linksControl: true,
                    enableCloseButton: false,
                    clickToGo: true,
                });
            }
        );

        const closeHandler = () => {
            cancelled = true;
            modal.style.display = 'none';
            modal.classList.remove('visible');
            if (this.streetViewPanorama) {
                this.streetViewPanorama.setVisible(false);
                this.streetViewPanorama = null;
            }
            panoContainer.innerHTML = '';
            closeBtn?.removeEventListener('click', closeHandler);
            modal.removeEventListener('click', backdropHandler);
            this.streetViewCloseCleanup = null;
        };

        const backdropHandler = (e: Event) => {
            if (e.target === modal) closeHandler();
        };

        closeBtn?.addEventListener('click', closeHandler);
        modal.addEventListener('click', backdropHandler);
        this.streetViewCloseCleanup = closeHandler;
    }

    invalidateSize(): void {
        google.maps.event.trigger(this.map, 'resize');
    }
}

// Global window handler for InfoWindow button clicks
if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).__openStreetView = (
        name: string,
        lat: number,
        lng: number
    ) => {
        if (mapServiceInstance) {
            mapServiceInstance.openStreetViewPanorama(name, lat, lng);
        }
    };
}

let mapServiceInstance: MapService | null = null;

export async function getMapServiceAsync(containerId?: string): Promise<MapService> {
    await loadGoogleMapsScript();
    if (!mapServiceInstance) {
        if (!containerId) {
            throw new Error('Container ID gerekli');
        }
        mapServiceInstance = new MapService(containerId);
    }
    return mapServiceInstance;
}

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
