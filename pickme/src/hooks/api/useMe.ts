import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type { UserSummary } from "@/lib/api-types";
import { qk } from "@/lib/query-client";

/** The current backend user (id matches `driver`, `sender`, etc. references). */
export function useMe() {
  return useQuery({
    queryKey: qk.me(),
    queryFn: () => api.get<UserSummary>("/me/"),
    staleTime: 5 * 60_000,
  });
}
