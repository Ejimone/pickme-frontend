import { useRouter } from "expo-router";
import { Bell } from "phosphor-react-native";
import { FlatList, Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { EmptyState } from "@/components/shared/EmptyState";
import { Screen } from "@/components/shared/Screen";
import { NotificationRow } from "@/components/notifications/NotificationRow";
import { useMarkNotificationRead, useNotifications } from "@/hooks/api/useNotifications";
import type { Notification } from "@/lib/api-types";

/** Activity feed. Tapping a row marks it read and deep-links by notification type. */
export default function NotificationsScreen() {
  const router = useRouter();
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();

  function onPress(n: Notification) {
    if (!n.is_read) markRead.mutate(n.id);
    const data = n.data as Record<string, string>;
    switch (n.type) {
      case "swap_request":
        if (data.swap_request_id) router.push(`/swap/${data.swap_request_id}`);
        break;
      case "driver_arrived":
        if (data.trip_id) router.push(`/trip/${data.trip_id}`);
        break;
      case "chat_message":
        router.push("/(tabs)/chat");
        break;
      default:
        break;
    }
  }

  const data = notifications.data ?? [];
  const hasUnread = data.some((n) => !n.is_read);

  return (
    <Screen padded={false}>
      <View className="flex-row items-center justify-between px-5 pb-2 pt-1">
        <Text className="text-[30px] font-bold text-foreground">Activity</Text>
        {hasUnread ? (
          <Pressable
            onPress={() => data.filter((n) => !n.is_read).forEach((n) => markRead.mutate(n.id))}
            hitSlop={8}
          >
            <Text className="text-[13px] font-bold text-accent">Clear all</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={data}
        keyExtractor={(n) => n.id}
        contentContainerClassName="px-3 pb-8"
        ListEmptyComponent={
          <View className="px-2 pt-10">
            <EmptyState
              Icon={Bell}
              title="No activity yet"
              message="Pickup updates, swaps, and trip alerts will show up here."
            />
          </View>
        }
        renderItem={({ item }) => (
          <NotificationRow notification={item} onPress={() => onPress(item)} />
        )}
      />
    </Screen>
  );
}
