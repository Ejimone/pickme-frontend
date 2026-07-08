import * as Location from "expo-location";
import { useEffect, useState } from "react";

import type { LatLng } from "@/lib/geo";

/**
 * The current device's foreground location, for showing a watcher's own
 * "you are here" dot on the live map. Low-frequency (the watcher isn't the one
 * being tracked). Returns null until permission is granted and a fix arrives.
 */
export function useMyLocation(active: boolean): LatLng | null {
  const [location, setLocation] = useState<LatLng | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let sub: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled || status !== "granted") return;
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 25, timeInterval: 10_000 },
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      );
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [active]);

  return location;
}
