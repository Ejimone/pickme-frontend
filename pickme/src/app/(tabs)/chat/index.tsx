import { ChatCircle } from "phosphor-react-native";

import { EmptyState } from "@/components/shared/EmptyState";
import { Screen } from "@/components/shared/Screen";

export default function ChatTab() {
  return (
    <Screen title="Chat">
      <EmptyState
        Icon={ChatCircle}
        title="No conversations yet"
        message="Group and trip threads will appear here once chat is wired up."
      />
    </Screen>
  );
}
