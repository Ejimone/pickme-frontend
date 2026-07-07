import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useFamilies } from "@/hooks/api/useFamilies";

/**
 * Post-auth router. The root auth gate (in _layout) guarantees only signed-in
 * users reach here, so this just decides onboarding vs. the app once families
 * resolve:
 *   no family yet → (onboarding)/create-family
 *   has a family  → (tabs) Today
 */
export default function Index() {
  const { isSignedIn } = useAuth();
  const families = useFamilies();

  // Not signed in → the root gate is already redirecting to (auth); hold.
  if (!isSignedIn || families.isLoading) return <Splash />;

  if (families.data && families.data.length === 0) {
    return <Redirect href="/(onboarding)/create-family" />;
  }
  return <Redirect href="/(tabs)" />;
}

function Splash() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator />
    </View>
  );
}
