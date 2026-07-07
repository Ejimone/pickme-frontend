import { CaretRight } from "phosphor-react-native";
import { Pressable, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useTheme } from "@/hooks/useTheme";
import type { PickupEvent } from "@/lib/api-types";
import { formatClockTime } from "@/lib/date";
import { PICKUP_METHOD_ICON, PICKUP_METHOD_LABEL } from "@/lib/status";

/**
 * Per-child Today row: color-tag avatar ring, name, resolved pickup time +
 * method icon, and the StatusBadge. Tappable when a live trip is attached.
 */
export function ChildPickupCard({
  event,
  colorTag,
  photoUrl,
  onPress,
}: {
  event: PickupEvent;
  colorTag?: string | null;
  photoUrl?: string | null;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const MethodIcon = PICKUP_METHOD_ICON[event.pickup_method];
  const isLive = event.status === "en_route" || event.status === "arrived";

  const body = (
    <Card className={isLive ? "border-accent" : undefined}>
      <View className="flex-row items-center gap-3">
        <Avatar
          uri={photoUrl}
          name={event.child_name}
          size={48}
          ringColor={colorTag}
        />
        <View className="flex-1 gap-1">
          <Text variant="title">{event.child_name}</Text>
          <View className="flex-row items-center gap-1.5">
            <MethodIcon size={14} color={colors.mutedForeground} />
            <Text variant="caption">
              {PICKUP_METHOD_LABEL[event.pickup_method]} ·{" "}
              {formatClockTime(event.scheduled_time)}
            </Text>
          </View>
        </View>
        <View className="items-end gap-1">
          <StatusBadge status={event.status} />
          {onPress ? (
            <CaretRight size={16} color={colors.mutedForeground} />
          ) : null}
        </View>
      </View>
    </Card>
  );

  if (!onPress) return body;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => (pressed ? { opacity: 0.9 } : undefined)}
    >
      {body}
    </Pressable>
  );
}
