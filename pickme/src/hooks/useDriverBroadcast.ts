import * as Location from "expo-location";
import { useEffect, useState } from "react";

/**
 * When `active` (the current user is the driver on an in-progress trip), watch
 * the device GPS and push `location_update` frames over the trip socket. Returns
 * the permission state so the UI can prompt/explain if it's denied.
 */
export function useDriverBroadcast({
  active,
  send,
}: {
  active: boolean;
  send: (data: unknown) => void;
}) {
  const [permission, setPermission] = useState<"unknown" | "granted" | "denied">(
    "unknown",
  );

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let sub: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== "granted") {
        setPermission("denied");
        return;
      }
      setPermission("granted");
      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 15, // metres
          timeInterval: 5000,
        },
        (pos) => {
          send({
            type: "location_update",
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            speed: pos.coords.speed,
            heading: pos.coords.heading,
            recorded_at: new Date(pos.timestamp).toISOString(),
          });
        },
      );
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [active, send]);

  return { permission };
}
