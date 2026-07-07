import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type { Paginated, SOSAlert, UUID } from "@/lib/api-types";
import { qk } from "@/lib/query-client";

export function useSOSAlerts(filters?: { status?: "active" | "resolved" }) {
  return useQuery({
    queryKey: qk.sosAlerts(filters),
    queryFn: () =>
      api.get<Paginated<SOSAlert>>("/sos-alerts/", filters?.status ? { status: filters.status } : undefined),
    select: (page) => page.results,
  });
}

export function useRaiseSOS() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { trip: UUID; lat?: number; lng?: number; message?: string }) =>
      api.post<SOSAlert>("/sos-alerts/", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sos-alerts"] }),
  });
}

export function useResolveSOS() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => api.post<SOSAlert>(`/sos-alerts/${id}/resolve/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sos-alerts"] }),
  });
}
