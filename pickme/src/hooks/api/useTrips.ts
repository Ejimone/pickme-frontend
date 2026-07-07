import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type {
  ISODate,
  LocationPing,
  Paginated,
  Trip,
  TripStop,
  TripStopStatus,
  UUID,
} from "@/lib/api-types";
import { todayISO } from "@/lib/date";
import { qk } from "@/lib/query-client";

/** Trips you're party to (driver, or a family/group member on a stop). */
export function useTrips(filters?: { date?: ISODate; carpool_group?: UUID }) {
  const date = filters?.date ?? todayISO();
  const resolved = { date, carpool_group: filters?.carpool_group };
  return useQuery({
    queryKey: qk.trips(resolved),
    queryFn: () => api.get<Paginated<Trip>>("/trips/", resolved),
    select: (page) => page.results,
  });
}

export interface CreateTripInput {
  carpool_group: UUID | null;
  date: ISODate;
  tracking_mode: "live_gps" | "status_only";
  stops: { school?: UUID; activity?: UUID; sequence_order: number; children: UUID[] }[];
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTripInput) => api.post<Trip>("/trips/", input),
    onSuccess: (trip) => {
      qc.invalidateQueries({ queryKey: ["trips"] });
      qc.setQueryData(qk.trip(trip.id), trip);
    },
  });
}

export function useTrip(tripId: UUID | undefined) {
  return useQuery({
    queryKey: qk.trip(tripId ?? ""),
    queryFn: () => api.get<Trip>(`/trips/${tripId}/`),
    enabled: !!tripId,
  });
}

/** Initial hydration of the driver's last known position (WS is the live path). */
export function useTripLatestLocation(tripId: UUID | undefined, enabled = true) {
  return useQuery({
    queryKey: qk.tripLatestLocation(tripId ?? ""),
    queryFn: () => api.get<LocationPing>(`/trips/${tripId}/location/latest/`),
    enabled: !!tripId && enabled,
    // 404 until the driver posts a first ping — don't hammer it.
    retry: false,
  });
}

export function useStartTrip(tripId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<Trip>(`/trips/${tripId}/start/`),
    onSuccess: (trip) => qc.setQueryData(qk.trip(tripId), trip),
  });
}

export function useEndTrip(tripId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<Trip>(`/trips/${tripId}/end/`),
    onSuccess: (trip) => qc.setQueryData(qk.trip(tripId), trip),
  });
}

export function useUpdateStop(tripId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { stopId: UUID; status: TripStopStatus; children?: UUID[] }) =>
      api.patch<TripStop>(`/trips/${tripId}/stops/${input.stopId}/`, {
        status: input.status,
        children: input.children,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.trip(tripId) });
      qc.invalidateQueries({ queryKey: ["pickup-events"] });
    },
  });
}

/** REST fallback for posting a driver location ping (WS is primary). */
export function usePostLocation(tripId: UUID) {
  return useMutation({
    mutationFn: (input: {
      lat: number;
      lng: number;
      speed?: number | null;
      heading?: number | null;
      recorded_at: string;
    }) => api.post<LocationPing>(`/trips/${tripId}/location/`, input),
  });
}
