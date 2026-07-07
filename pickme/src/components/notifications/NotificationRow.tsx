import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/hooks/useTheme";
import type { Notification, NotificationType } from "@/lib/api-types";
import { formatClockTime } from "@/lib/date";

// Dot color follows the status-color law: green=done, yellow=pending action,
// blue=informational/live, red=alert, gray=neutral reminder.
const TONE: Record<NotificationType, keyof ReturnType<typeof useTheme>["colors"]> = {
  driver_arrived: "success",
  pickup_reminder: "mutedForeground",
  swap_request: "warning",
  chat_message: "accent",
  schedule_change: "accent",
  sos: "destructive",
};

export function NotificationRow({
  notification,
  onPress,
}: {
  notification: Notification;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const dot = colors[TONE[notification.type]];
  const unread = !notification.is_read;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}
      className={`flex-row items-center gap-3 rounded-[10px] px-3 py-3.5 ${
        unread ? "bg-card-secondary" : ""
      }`}
    >
      <View style={{ backgroundColor: dot }} className="h-3.5 w-3.5 rounded-full" />
      <View className="flex-1">
        <Text className="text-[15px] font-bold text-foreground">{notification.title}</Text>
        <Text variant="caption" className="mt-0.5">
          {notification.body}
          {notification.body ? " · " : ""}
          {formatClockTime(notification.created_at)}
        </Text>
      </View>
      {unread ? (
        <View style={{ backgroundColor: colors.accent }} className="h-2.5 w-2.5 rounded-full" />
      ) : null}
    </Pressable>
  );
}
