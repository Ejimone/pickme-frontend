import { create } from "zustand";

import type { UUID } from "@/lib/api-types";

/**
 * Ephemeral live-trip session state (placeholder for the Trip stage).
 * Holds only what must survive outside the Query cache: which trip is active,
 * socket status, and any driver-side pings queued while offline.
 */
type SocketStatus = "idle" | "connecting" | "open" | "reconnecting" | "closed";

interface TripSessionState {
  activeTripId: UUID | null;
  socketStatus: SocketStatus;
  setActiveTrip: (id: UUID | null) => void;
  setSocketStatus: (status: SocketStatus) => void;
}

export const useTripSession = create<TripSessionState>((set) => ({
  activeTripId: null,
  socketStatus: "idle",
  setActiveTrip: (activeTripId) => set({ activeTripId }),
  setSocketStatus: (socketStatus) => set({ socketStatus }),
}));
