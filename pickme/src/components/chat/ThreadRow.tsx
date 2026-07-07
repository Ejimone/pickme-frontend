import { Pressable, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { formatClockTime } from "@/lib/date";

/**
 * A conversation list row: group avatar, title, last-message preview, time, and
 * an unread count badge. Title/preview/time are passed in since a ChatThread
 * only carries context ids — the screen resolves display strings.
 */
export function ThreadRow({
  title,
  preview,
  timestamp,
  unreadCount = 0,
  onPress,
}: {
  title: string;
  preview?: string;
  timestamp?: string | null;
  unreadCount?: number;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
      className="flex-row items-center gap-3 py-3"
    >
      <Avatar name={title} size={52} />
      <View className="flex-1">
        <Text className="text-[14px] font-bold text-foreground" numberOfLines={1}>
          {title}
        </Text>
        {preview ? (
          <Text variant="caption" className="mt-1" numberOfLines={1}>
            {preview}
          </Text>
        ) : null}
      </View>
      <View className="items-end gap-1.5">
        {timestamp ? (
          <Text className="text-[11px] text-muted-foreground">
            {formatClockTime(timestamp)}
          </Text>
        ) : null}
        {unreadCount > 0 ? (
          <View className="h-[22px] min-w-[22px] items-center justify-center rounded-full bg-accent px-1.5">
            <Text className="text-[11px] font-bold text-white">{unreadCount}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
