import { useEffect, useState } from "react";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import type { PickupEvent } from "@/lib/api-types";
import { formatClockTime, formatCountdown, secondsUntil } from "@/lib/date";

/**
 * Header hero for Today: the next upcoming pickup with a live-ticking countdown
 * (tabular numerals, updates in place — no layout shift).
 */
export function DismissalCountdown({ events }: { events: PickupEvent[] }) {
  const [, force] = useState(0);

  // Re-render each minute so the countdown stays fresh.
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const next = events
    .filter((e) => e.scheduled_time && secondsUntil(e.scheduled_time) > -300)
    .sort(
      (a, b) =>
        new Date(a.scheduled_time!).getTime() -
        new Date(b.scheduled_time!).getTime(),
    )[0];

  if (!next) return null;

  return (
    <View className="mb-2 gap-1 rounded-lg bg-card-secondary px-4 py-3">
      <Text variant="caption">Next pickup</Text>
      <View className="flex-row items-baseline gap-2">
        <Text variant="numericHero">{formatCountdown(next.scheduled_time)}</Text>
        <Text variant="body" className="text-muted-foreground">
          {next.child_name} · {formatClockTime(next.scheduled_time)}
        </Text>
      </View>
    </View>
  );
}
