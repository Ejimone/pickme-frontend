import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type {
  ISODate,
  Paginated,
  PickupEvent,
  PickupEventStatus,
  PickupMethod,
  UUID,
} from "@/lib/api-types";
import { todayISO } from "@/lib/date";
import { qk } from "@/lib/query-client";

/** The "Today" screen — one row per child across your families' schools. */
export function usePickupEvents(filters?: { date?: ISODate; family?: UUID }) {
  const date = filters?.date ?? todayISO();
  const resolved = { date, family: filters?.family };
  return useQuery({
    queryKey: qk.pickupEvents(resolved),
    queryFn: () =>
      api.get<Paginated<PickupEvent>>("/pickup-events/", {
        date,
        family: filters?.family,
      }),
    select: (page) => page.results,
  });
}

export function useUpdatePickupEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      id: UUID;
      status?: PickupEventStatus;
      pickup_method?: PickupMethod;
    }) => {
      const { id, ...body } = input;
      return api.patch<PickupEvent>(`/pickup-events/${id}/`, body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pickup-events"] }),
  });
}
