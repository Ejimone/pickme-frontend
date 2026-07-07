import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { Screen } from "@/components/shared/Screen";

/**
 * Auth entry — Clerk social sign-in. One SSO flow covers both new and returning
 * users, so there's no separate password form.
 */
export default function SignIn() {
  return (
    <Screen>
      <View className="flex-1 justify-between py-8">
        <View className="flex-1 justify-center gap-3">
          <Text variant="display">PickMe</Text>
          <Text variant="body" className="text-muted-foreground">
            Coordinate school pickups, carpools, and live trips with your family.
          </Text>
        </View>

        <View className="gap-4">
          <OAuthButtons />
          <Text variant="caption" className="text-center text-muted-foreground">
            By continuing you agree to our Terms and Privacy Policy.
          </Text>
        </View>
      </View>
    </Screen>
  );
}
