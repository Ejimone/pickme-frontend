export interface LatLng {
  lat: number;
  lng: number;
}

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance between two coordinates, in metres (haversine). */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6_371_000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Rough drive-time estimate in whole minutes. Defaults to ~30 km/h (8.3 m/s),
 * a reasonable urban school-run average; pass a live GPS speed when you have one.
 */
export function etaMinutes(meters: number, speedMps?: number | null): number {
  const speed = speedMps && speedMps > 1 ? speedMps : 8.3;
  return Math.max(1, Math.round(meters / speed / 60));
}

/** "4 min away" / "1.2 km away" style label from a distance in metres. */
export function distanceLabel(meters: number): string {
  return meters < 1000
    ? `${Math.round(meters)} m away`
    : `${(meters / 1000).toFixed(1)} km away`;
}
