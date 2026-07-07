import { CaretRight } from "phosphor-react-native";
import { Pressable, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useTheme } from "@/hooks/useTheme";
import type { PickupEvent } from "@/lib/api-types";
import { formatClockTime } from "@/lib/date";
import { PICKUP_METHOD_LABEL } from "@/lib/status";

/**
 * A single Today pickup row: color-ring avatar, name, school + method subtitle,
 * status pill under the name, and the scheduled time on the right. Rows are
 * separated by hairlines (no card chrome) per the v2 Today design.
 */
export function PickupRow({
  event,
  subtitle,
  colorTag,
  photoUrl,
  onPress,
}: {
  event: PickupEvent;
  subtitle?: string | null;
  colorTag?: string | null;
  photoUrl?: string | null;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const sub = subtitle || PICKUP_METHOD_LABEL[event.pickup_method];

  const body = (
    <View className="flex-row items-center gap-3 py-3">
      <Avatar uri={photoUrl} name={event.child_name} size={52} ringColor={colorTag} />
      <View className="flex-1 gap-1">
        <Text className="text-[16px] font-bold text-foreground">{event.child_name}</Text>
        <Text variant="caption">{sub}</Text>
        <View className="self-start pt-0.5">
          <StatusBadge status={event.status} showIcon={false} />
        </View>
      </View>
      <View className="items-end gap-1">
        <Text className="text-[16px] font-bold text-foreground">
          {formatClockTime(event.scheduled_time)}
        </Text>
        {onPress ? <CaretRight size={16} color={colors.mutedForeground} /> : null}
      </View>
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => (pressed ? { opacity: 0.9 } : undefined)}>
      {body}
    </Pressable>
  );
}
