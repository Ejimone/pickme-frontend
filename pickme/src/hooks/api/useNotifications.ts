import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type { Notification, Paginated, UUID } from "@/lib/api-types";
import { qk } from "@/lib/query-client";

export function useNotifications(filters?: { unread?: boolean }) {
  return useQuery({
    queryKey: qk.notifications(filters),
    queryFn: () =>
      api.get<Paginated<Notification>>(
        "/notifications/",
        filters?.unread ? { is_read: false } : undefined,
      ),
    select: (page) => page.results,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: UUID) => api.post<Notification>(`/notifications/${id}/read/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
