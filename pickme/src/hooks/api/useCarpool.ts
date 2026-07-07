import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type {
  CarpoolAssignment,
  CarpoolGroup,
  CarpoolGroupMember,
  CarpoolRotationRule,
  ISODate,
  Paginated,
  UUID,
} from "@/lib/api-types";
import { qk } from "@/lib/query-client";

export function useCarpoolGroups() {
  return useQuery({
    queryKey: qk.carpoolGroups(),
    queryFn: () => api.get<Paginated<CarpoolGroup>>("/carpool-groups/"),
    select: (page) => page.results,
  });
}

export function useCarpoolGroup(id: UUID | undefined) {
  return useQuery({
    queryKey: qk.carpoolGroup(id ?? ""),
    queryFn: () => api.get<CarpoolGroup>(`/carpool-groups/${id}/`),
    enabled: !!id,
  });
}

export function useGroupMembers(id: UUID | undefined) {
  return useQuery({
    queryKey: qk.carpoolGroupMembers(id ?? ""),
    queryFn: () =>
      api.get<Paginated<CarpoolGroupMember>>(`/carpool-groups/${id}/members/`),
    select: (page) => page.results,
    enabled: !!id,
  });
}

export function useCreateCarpoolGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { school: UUID; name: string; family: UUID }) =>
      api.post<CarpoolGroup>("/carpool-groups/", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.carpoolGroups() }),
  });
}

export function useJoinCarpoolGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { invite_code: string; family: UUID }) =>
      api.post<{ group: CarpoolGroup }>("/carpool-groups/join/", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.carpoolGroups() }),
  });
}

/**
 * Email a parent an invite to a carpool group.
 * NOTE: requires the backend endpoint described in CARPOOL_BACKEND_PROMPT.md
 * (`POST /carpool-groups/{id}/invite/`). Until that ships, share the invite
 * code directly (the group detail screen's Share button works today).
 */
export function useInviteToCarpoolGroup(groupId: UUID) {
  return useMutation({
    mutationFn: (email: string) =>
      api.post(`/carpool-groups/${groupId}/invite/`, { email }),
  });
}

/**
 * Leave a group (remove your own family's membership).
 * NOTE: requires `POST /carpool-groups/{id}/leave/` from the backend prompt.
 */
export function useLeaveCarpoolGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groupId: UUID) => api.post(`/carpool-groups/${groupId}/leave/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.carpoolGroups() }),
  });
}

export function useRotationRule(groupId: UUID | undefined) {
  return useQuery({
    queryKey: qk.rotationRule(groupId ?? ""),
    queryFn: () =>
      api.get<CarpoolRotationRule>(`/carpool-groups/${groupId}/rotation-rule/`),
    enabled: !!groupId,
    retry: false,
  });
}

export interface RotationRuleInput {
  rotation_type: "round_robin" | "weighted" | "manual_only";
  cycle_days: number[];
  start_date: ISODate;
  order: { family: UUID; position: number; weight?: number }[];
}

export function usePutRotationRule(groupId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RotationRuleInput) =>
      api.put<CarpoolRotationRule>(`/carpool-groups/${groupId}/rotation-rule/`, input),
    onSuccess: (rule) => qc.setQueryData(qk.rotationRule(groupId), rule),
  });
}

export function useAssignments(groupId: UUID | undefined, range?: { from?: ISODate; to?: ISODate }) {
  return useQuery({
    queryKey: qk.assignments(groupId ?? "", range),
    queryFn: () =>
      api.get<Paginated<CarpoolAssignment>>(
        `/carpool-groups/${groupId}/assignments/`,
        range,
      ),
    select: (page) => page.results,
    enabled: !!groupId,
  });
}

export function useGenerateAssignments(groupId: UUID) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (range: { from: ISODate; to: ISODate }) =>
      api.post<{ created: CarpoolAssignment[] }>(
        `/carpool-groups/${groupId}/assignments/generate/`,
        range,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignments", groupId] }),
  });
}
