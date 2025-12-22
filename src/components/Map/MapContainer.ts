/**
 * MapContainer Component
 * @module components/Map/MapContainer
 */

import { initializeMap, getLeafletMap } from '../../hooks/useMap';

/**
 * Map container'ı başlatır
 * @param containerId - Container element ID (varsayılan: 'map')
 */
export function initMapContainer(containerId: string = 'map'): void {
    initializeMap(containerId);
}

/**
 * Map container'ı export eder
 */
export { getLeafletMap };
