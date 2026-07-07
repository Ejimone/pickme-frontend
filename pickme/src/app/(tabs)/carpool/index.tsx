import { Car } from "phosphor-react-native";

import { EmptyState } from "@/components/shared/EmptyState";
import { Screen } from "@/components/shared/Screen";

export default function CarpoolTab() {
  return (
    <Screen title="Carpool">
      <EmptyState
        Icon={Car}
        title="Carpool groups"
        message="Groups, rotation calendar, and swaps arrive in the next build stage."
      />
    </Screen>
  );
}
