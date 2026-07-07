import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type { Child, Paginated, UUID } from "@/lib/api-types";
import { qk } from "@/lib/query-client";

export function useChildren(filters?: { family?: UUID; school?: UUID }) {
  return useQuery({
    queryKey: qk.children(filters),
    queryFn: () =>
      api.get<Paginated<Child>>("/children/", {
        family: filters?.family,
        school: filters?.school,
      }),
    select: (page) => page.results,
  });
}

export function useChild(id: UUID) {
  return useQuery({
    queryKey: qk.child(id),
    queryFn: () => api.get<Child>(`/children/${id}/`),
    enabled: !!id,
  });
}

export interface CreateChildInput {
  family: UUID;
  full_name: string;
  school?: UUID | null;
  grade?: string | null;
  color_tag?: string | null;
  photo_url?: string | null;
  date_of_birth?: string | null;
  notes?: string;
}

export function useCreateChild() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateChildInput) => api.post<Child>("/children/", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["children"] }),
  });
}
