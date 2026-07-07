import { ChatCircle } from "phosphor-react-native";
import { FlatList, View } from "react-native";

import { EmptyState } from "@/components/shared/EmptyState";
import { Screen } from "@/components/shared/Screen";
import { ThreadRow } from "@/components/chat/ThreadRow";
import { useCarpoolGroups } from "@/hooks/api/useCarpool";
import { useChatThreads } from "@/hooks/api/useChat";
import type { ChatThread } from "@/lib/api-types";

/** Conversation list — group + trip threads. */
export default function ChatTab() {
  const threads = useChatThreads();
  const groups = useCarpoolGroups();

  function title(thread: ChatThread): string {
    if (thread.context_type === "carpool_group" && thread.carpool_group) {
      return groups.data?.find((g) => g.id === thread.carpool_group)?.name ?? "Carpool group";
    }
    return "Trip chat";
  }

  const data = threads.data ?? [];

  return (
    <Screen title="Chat" padded={false}>
      <FlatList
        data={data}
        keyExtractor={(t) => t.id}
        contentContainerClassName="px-5 pb-8"
        ItemSeparatorComponent={() => <View className="ml-[64px] h-px bg-border" />}
        ListEmptyComponent={
          <View className="pt-10">
            <EmptyState
              Icon={ChatCircle}
              title="No conversations yet"
              message="Group and trip threads appear here once you join a carpool or start a trip."
            />
          </View>
        }
        renderItem={({ item }) => <ThreadRow title={title(item)} timestamp={item.created_at} />}
      />
    </Screen>
  );
}
