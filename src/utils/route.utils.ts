/**
 * Route Optimization and Geographic Utilities
 * @module utils/route
 */

import type { LocationArgs, LineArgs } from '../types';

/**
 * Calculates Haversine distance in kilometers between two lat/lng coordinates
 */
export function calculateHaversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Estimates travel time based on distance in km and transport mode
 */
export function estimateTravelTime(
    distanceKm: number,
    transport: string = 'Araç'
): string {
    const mode = transport.toLowerCase();
    let speed = 40; // Default driving speed km/h (considering coastal/town roads)

    if (mode.includes('yürü') || mode.includes('walk')) {
        speed = 4;
    } else if (mode.includes('bisiklet') || mode.includes('bike')) {
        speed = 15;
    } else if (mode.includes('tekne') || mode.includes('boat')) {
        speed = 18;
    }

    const minutes = Math.round((distanceKm / speed) * 60);

    if (minutes <= 3) return '3 dakika';
    if (minutes < 60) return `${minutes} dakika`;
    const hours = (minutes / 60).toFixed(1).replace('.0', '');
    return `${hours} saat`;
}

/**
 * Determines appropriate transport mode based on distance
 */
export function determineTransportMode(distanceKm: number, currentMode?: string): string {
    if (currentMode && (currentMode.toLowerCase().includes('tekne') || currentMode.toLowerCase().includes('boat'))) {
        return 'Tekne';
    }
    if (distanceKm <= 1.2) {
        return 'Yürüme';
    }
    return 'Araç';
}

/**
 * Optimizes a list of locations for a single day using Nearest Neighbor TSP
 */
export function optimizeDayLocations(locations: LocationArgs[]): LocationArgs[] {
    if (locations.length <= 1) {
        return locations.map((loc, idx) => ({ ...loc, sequence: idx + 1 }));
    }

    // Sort initially by sequence or time if available to pick logical start
    const sorted = [...locations].sort((a, b) => {
        const seqA = a.sequence || Infinity;
        const seqB = b.sequence || Infinity;
        if (seqA !== seqB) return seqA - seqB;
        return (a.time || '').localeCompare(b.time || '');
    });

    // Extract time strings to preserve chronological times
    const times = sorted.map(l => l.time).filter((t): t is string => Boolean(t));
    times.sort((a, b) => a.localeCompare(b));

    const optimized: LocationArgs[] = [];
    const unvisited = [...sorted];

    // Pick start location (first in sequence/time)
    let current = unvisited.shift()!;
    optimized.push(current);

    while (unvisited.length > 0) {
        const currentLat = Number(current.lat);
        const currentLng = Number(current.lng);

        let nearestIdx = 0;
        let minDistance = Infinity;

        for (let i = 0; i < unvisited.length; i++) {
            const candLat = Number(unvisited[i].lat);
            const candLng = Number(unvisited[i].lng);
            const dist = calculateHaversineDistance(currentLat, currentLng, candLat, candLng);

            if (dist < minDistance) {
                minDistance = dist;
                nearestIdx = i;
            }
        }

        current = unvisited.splice(nearestIdx, 1)[0];
        optimized.push(current);
    }

    // Re-assign sequence numbers and chronological times
    return optimized.map((loc, idx) => ({
        ...loc,
        sequence: idx + 1,
        time: times[idx] || loc.time,
    }));
}

/**
 * Calculates geographic centroid (average lat/lng) of a cluster of locations
 */
export function calculateCentroid(locations: LocationArgs[]): { lat: number; lng: number } {
    if (locations.length === 0) return { lat: 0, lng: 0 };
    let sumLat = 0;
    let sumLng = 0;
    locations.forEach(loc => {
        sumLat += Number(loc.lat);
        sumLng += Number(loc.lng);
    });
    return { lat: sumLat / locations.length, lng: sumLng / locations.length };
}

/**
 * Optimizes inter-day regional cluster order using Nearest Neighbor TSP across day centroids
 */
export function optimizeInterDayOrder(dayMap: Map<number, LocationArgs[]>): Map<number, LocationArgs[]> {
    const dayKeys = Array.from(dayMap.keys()).sort((a, b) => a - b);
    if (dayKeys.length <= 2) return dayMap;

    // Day 1 stays as Day 1 (city center / trip start)
    const day1Locs = dayMap.get(dayKeys[0]) || [];
    const currentCentroid = calculateCentroid(day1Locs);

    const unvisitedDays = dayKeys.slice(1);
    const orderedDayClusters: LocationArgs[][] = [day1Locs];

    let currLat = currentCentroid.lat;
    let currLng = currentCentroid.lng;

    while (unvisitedDays.length > 0) {
        let nearestDayIdx = 0;
        let minDistance = Infinity;

        for (let i = 0; i < unvisitedDays.length; i++) {
            const dayNum = unvisitedDays[i];
            const locs = dayMap.get(dayNum) || [];
            const centroid = calculateCentroid(locs);
            const dist = calculateHaversineDistance(currLat, currLng, centroid.lat, centroid.lng);

            if (dist < minDistance) {
                minDistance = dist;
                nearestDayIdx = i;
            }
        }

        const pickedDayNum = unvisitedDays.splice(nearestDayIdx, 1)[0];
        const pickedLocs = dayMap.get(pickedDayNum) || [];
        orderedDayClusters.push(pickedLocs);

        const newCentroid = calculateCentroid(pickedLocs);
        currLat = newCentroid.lat;
        currLng = newCentroid.lng;
    }

    // Re-build day map with new optimized day numbers (1, 2, 3...)
    const newDayMap = new Map<number, LocationArgs[]>();
    orderedDayClusters.forEach((clusterLocs, idx) => {
        const newDayNum = idx + 1;
        const remappedLocs = clusterLocs.map(loc => ({ ...loc, day: newDayNum }));
        newDayMap.set(newDayNum, remappedLocs);
    });

    return newDayMap;
}

/**
 * Groups and optimizes all locations across days, merging micro-cluster places into same day if ultra-close (< 1.5 km)
 */
export function optimizeItineraryLocations(locations: LocationArgs[]): LocationArgs[] {
    if (locations.length === 0) return [];

    // Group locations by day
    let dayMap = new Map<number, LocationArgs[]>();

    locations.forEach(loc => {
        const dayNum = loc.day || 1;
        if (!dayMap.has(dayNum)) {
            dayMap.set(dayNum, []);
        }
        dayMap.get(dayNum)!.push({ ...loc, day: dayNum });
    });

    // Apply Inter-Day Regional Order Optimization across day centroids
    dayMap = optimizeInterDayOrder(dayMap);

    // Check micro-cluster relocation (e.g. Can Yücel Evi & Eski Datça within 1.5km but assigned to different days)
    const dayKeys = Array.from(dayMap.keys()).sort((a, b) => a - b);

    for (let d = dayKeys.length - 1; d >= 1; d--) {
        const currentDay = dayKeys[d];
        const dayLocs = dayMap.get(currentDay) || [];

        for (let i = dayLocs.length - 1; i >= 0; i--) {
            const targetLoc = dayLocs[i];
            const targetLat = Number(targetLoc.lat);
            const targetLng = Number(targetLoc.lng);

            for (let targetDay of dayKeys) {
                if (targetDay === currentDay) continue;
                const earlierLocs = dayMap.get(targetDay) || [];

                if (earlierLocs.length >= 4) continue; // Don't overload a single day

                const matchesUltraClose = earlierLocs.some(loc => {
                    const dist = calculateHaversineDistance(
                        targetLat,
                        targetLng,
                        Number(loc.lat),
                        Number(loc.lng)
                    );
                    return dist <= 1.5; // Walking distance / same neighborhood
                });

                if (matchesUltraClose) {
                    // Move to earlier day cluster
                    dayLocs.splice(i, 1);
                    targetLoc.day = targetDay;
                    earlierLocs.push(targetLoc);
                    break;
                }
            }
        }
    }

    // Now optimize intra-day TSP order for each day
    const resultLocations: LocationArgs[] = [];

    dayKeys.forEach(dayNum => {
        const dayLocs = dayMap.get(dayNum) || [];
        if (dayLocs.length > 0) {
            const optimizedDayLocs = optimizeDayLocations(dayLocs);
            resultLocations.push(...optimizedDayLocs);
        }
    });

    return resultLocations;
}

/**
 * Generates accurate route polylines (lines) between consecutive daily locations
 */
export function generateRouteLinesForItinerary(
    locations: LocationArgs[],
    existingLines: LineArgs[] = []
): LineArgs[] {
    const lines: LineArgs[] = [];

    // Group locations by day
    const dayMap = new Map<number, LocationArgs[]>();

    locations.forEach(loc => {
        const dayNum = loc.day || 1;
        if (!dayMap.has(dayNum)) {
            dayMap.set(dayNum, []);
        }
        dayMap.get(dayNum)!.push(loc);
    });

    dayMap.forEach((dayLocs) => {
        // Sort by sequence
        dayLocs.sort((a, b) => (a.sequence || 1) - (b.sequence || 1));

        for (let i = 0; i < dayLocs.length - 1; i++) {
            const startLoc = dayLocs[i];
            const endLoc = dayLocs[i + 1];

            const startLat = Number(startLoc.lat);
            const startLng = Number(startLoc.lng);
            const endLat = Number(endLoc.lat);
            const endLng = Number(endLoc.lng);

            const dist = calculateHaversineDistance(startLat, startLng, endLat, endLng);

            // Find existing line matching start and end names or coordinates if present
            const matchedExisting = existingLines.find(line => {
                const sLat = Number(line.start.lat);
                const sLng = Number(line.start.lng);
                const eLat = Number(line.end.lat);
                const eLng = Number(line.end.lng);
                return (
                    (Math.abs(sLat - startLat) < 0.01 && Math.abs(sLng - startLng) < 0.01 &&
                     Math.abs(eLat - endLat) < 0.01 && Math.abs(eLng - endLng) < 0.01)
                );
            });

            const transport = matchedExisting?.transport || determineTransportMode(dist);
            const travelTime = matchedExisting?.travelTime || estimateTravelTime(dist, transport);
            const name = `${startLoc.name} ➔ ${endLoc.name}`;

            lines.push({
                name,
                start: { lat: startLoc.lat, lng: startLoc.lng },
                end: { lat: endLoc.lat, lng: endLoc.lng },
                transport,
                travelTime,
            });
        }
    });

    return lines;
}
