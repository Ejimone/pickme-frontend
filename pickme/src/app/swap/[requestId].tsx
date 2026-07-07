import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowsLeftRight } from "phosphor-react-native";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { Screen } from "@/components/shared/Screen";

/**
 * Swap-request respond — deep-link target from a `swap_request` push.
 * Placeholder until the Carpool build stage wires accept/reject.
 */
export default function SwapRespond() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const router = useRouter();
  return (
    <Screen title="Swap request">
      <EmptyState
        Icon={ArrowsLeftRight}
        title="Swap respond coming soon"
        message={`Request ${requestId ?? ""} — accept/reject lands with Carpool.`}
      />
      <Button label="Back" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}
