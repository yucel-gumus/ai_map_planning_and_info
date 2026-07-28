/**
 * MapContainer Component
 * @module components/Map/MapContainer
 */

import { initializeMap, getGoogleMap } from '../../hooks/useMap';

/**
 * Map container'ı başlatır (Google Maps API)
 * @param containerId - Container element ID (varsayılan: 'map')
 */
export async function initMapContainer(containerId: string = 'map'): Promise<void> {
    await initializeMap(containerId);
}

/**
 * Google Maps instance'ını export eder
 */
export { getGoogleMap };
