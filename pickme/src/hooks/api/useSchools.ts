import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type { Paginated, School } from "@/lib/api-types";
import { qk } from "@/lib/query-client";

/** Shared reference data — searchable, not family-scoped. */
export function useSchools(search?: string) {
  return useQuery({
    queryKey: qk.schools(search),
    queryFn: () =>
      api.get<Paginated<School>>("/schools/", search ? { search } : undefined),
    select: (page) => page.results,
  });
}

export interface CreateSchoolInput {
  name: string;
  address: string;
  timezone: string;
  default_dismissal_time: string;
  lat?: number;
  lng?: number;
  early_dismissal_days?: Record<string, string>;
  phone?: string;
}

export function useCreateSchool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSchoolInput) => api.post<School>("/schools/", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schools"] }),
  });
}
