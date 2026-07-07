import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type { Family, FamilyMember, Paginated, UUID } from "@/lib/api-types";
import { qk } from "@/lib/query-client";

/** Families the current user belongs to. */
export function useFamilies() {
  return useQuery({
    queryKey: qk.families(),
    queryFn: () => api.get<Paginated<Family>>("/families/"),
    select: (page) => page.results,
  });
}

export function useFamily(id: UUID) {
  return useQuery({
    queryKey: qk.family(id),
    queryFn: () => api.get<Family>(`/families/${id}/`),
    enabled: !!id,
  });
}

export function useFamilyMembers(id: UUID) {
  return useQuery({
    queryKey: qk.familyMembers(id),
    queryFn: () => api.get<Paginated<FamilyMember>>(`/families/${id}/members/`),
    select: (page) => page.results,
    enabled: !!id,
  });
}

export function useCreateFamily() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.post<Family>("/families/", { name }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.families() }),
  });
}

/** Email a co-parent an invite to join the family. */
export function useInviteMember() {
  return useMutation({
    mutationFn: ({ familyId, email }: { familyId: UUID; email: string }) =>
      api.post(`/families/${familyId}/members/invite`, { email }),
  });
}
