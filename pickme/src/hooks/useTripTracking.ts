import { useAuth } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import type { SOSAlert, Trip } from "@/lib/api-types";
import { qk } from "@/lib/query-client";
import { createReconnectingSocket, type ReconnectingSocket } from "@/lib/ws";

/**
 * Live trip channel. Follows the golden rule from FRONTEND-ARCHITECTURE.md:
 * socket events are written straight into the TanStack Query cache (the screen
 * reads `useTripLatestLocation` / `useTrip`), and the hook holds no trip state
 * of its own — only transient connection + SOS-takeover flags.
 */
export function useTripTracking(tripId?: string) {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  const [connected, setConnected] = useState(false);
  const [sos, setSos] = useState<SOSAlert | null>(null);
  const sockRef = useRef<ReconnectingSocket | null>(null);

  useEffect(() => {
    if (!tripId) return;
    const sock = createReconnectingSocket({
      path: `/ws/trips/${tripId}/`,
      getToken: () => getToken(),
      onOpen: () => setConnected(true),
      onClose: () => setConnected(false),
      onMessage: (raw) => {
        const msg = raw as Record<string, unknown>;
        switch (msg.type) {
          case "location_update":
            qc.setQueryData(qk.tripLatestLocation(tripId), {
              id: Date.now(),
              lat: String(msg.lat),
              lng: String(msg.lng),
              speed: (msg.speed as number) ?? null,
              heading: (msg.heading as number) ?? null,
              recorded_at: msg.recorded_at,
            });
            break;
          case "stop_status_update":
          case "trip_status_update":
            qc.setQueryData<Trip | undefined>(qk.trip(tripId), (prev) => prev);
            qc.invalidateQueries({ queryKey: qk.trip(tripId) });
            qc.invalidateQueries({ queryKey: ["pickup-events"] });
            break;
          case "sos_alert":
            setSos(msg.sos as SOSAlert);
            qc.invalidateQueries({ queryKey: ["sos-alerts"] });
            break;
        }
      },
    });
    sockRef.current = sock;
    return () => {
      sock.close();
      sockRef.current = null;
    };
  }, [tripId, getToken, qc]);

  const send = useCallback((data: unknown) => sockRef.current?.send(data), []);

  return { connected, sos, dismissSos: () => setSos(null), send };
}
