import { useLocalSearchParams, useRouter } from "expo-router";
import { NavigationArrow } from "phosphor-react-native";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { Screen } from "@/components/shared/Screen";

/**
 * Live trip tracking — placeholder. The real screen (map + driver marker +
 * stops bottom sheet + SOS + WS hook) lands in the Trip build stage.
 */
export default function TripScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  return (
    <Screen title="Live trip">
      <EmptyState
        Icon={NavigationArrow}
        title="Live tracking coming soon"
        message={`Trip ${tripId ?? ""} will show the map, driver location, and stops here.`}
      />
      <Button label="Back" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}
