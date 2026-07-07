import { QueryClient } from "@tanstack/react-query";

import type { ISODate, UUID } from "./api-types";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Hierarchical, invalidation-friendly query keys.
 * Mirrors FRONTEND-ARCHITECTURE.md §5 and PICKME_API_REFERENCE.md §12 so
 * WebSocket cache writes and REST reads target the exact same keys.
 */
export const qk = {
  me: () => ["me"] as const,

  families: () => ["families"] as const,
  family: (id: UUID) => ["families", id] as const,
  familyMembers: (id: UUID) => ["families", id, "members"] as const,

  children: (filters?: { family?: UUID; school?: UUID }) =>
    ["children", filters ?? {}] as const,
  child: (id: UUID) => ["children", id] as const,
  activities: (childId: UUID) => ["children", childId, "activities"] as const,

  schools: (search?: string) => ["schools", { search: search ?? "" }] as const,
  school: (id: UUID) => ["schools", id] as const,

  carpoolGroups: () => ["carpool-groups"] as const,
  carpoolGroup: (id: UUID) => ["carpool-groups", id] as const,
  rotationRule: (groupId: UUID) => ["carpool-groups", groupId, "rotation-rule"] as const,
  assignments: (groupId: UUID, range?: { from?: ISODate; to?: ISODate }) =>
    ["assignments", groupId, range ?? {}] as const,
  swapRequests: () => ["swap-requests"] as const,

  trip: (tripId: UUID) => ["trip", tripId] as const,
  tripLatestLocation: (tripId: UUID) => ["trip", tripId, "latest-location"] as const,

  pickupEvents: (filters?: { date?: ISODate; family?: UUID }) =>
    ["pickup-events", filters ?? {}] as const,

  threads: () => ["threads"] as const,
  messages: (threadId: UUID) => ["messages", threadId] as const,

  notifications: (filters?: { unread?: boolean }) =>
    ["notifications", filters ?? {}] as const,
  notificationPreferences: () => ["notification-preferences"] as const,

  sosAlerts: (filters?: { status?: string }) => ["sos-alerts", filters ?? {}] as const,
} as const;
