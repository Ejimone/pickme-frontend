import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type { Activity, Paginated, UUID } from "@/lib/api-types";
import { qk } from "@/lib/query-client";

export function useActivities(childId: UUID | undefined) {
  return useQuery({
    queryKey: qk.activities(childId ?? ""),
    queryFn: () =>
      api.get<Paginated<Activity>>(`/children/${childId}/activities/`),
    select: (page) => page.results,
    enabled: !!childId,
  });
}

export interface CreateActivityInput {
  name: string;
  day_of_week: number;
  start_time: string;
  end_time?: string;
  location_name?: string;
  location_lat?: number;
  location_lng?: number;
}

export function useCreateActivity(childId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateActivityInput) =>
      api.post<Activity>(`/children/${childId}/activities/`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.activities(childId) }),
  });
}
