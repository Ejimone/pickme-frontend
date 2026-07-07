import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { Screen } from "@/components/shared/Screen";
import { useUiStore, type ThemePreference } from "@/stores/ui";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function SettingsTab() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();
  const preference = useUiStore((s) => s.themePreference);
  const setPreference = useUiStore((s) => s.setThemePreference);

  async function onSignOut() {
    await signOut();
    router.replace("/(auth)/sign-in");
  }

  return (
    <Screen title="Settings">
      <View className="gap-6 pt-2">
        <Card>
          <Text variant="caption">Signed in as</Text>
          <Text variant="title">
            {user?.primaryEmailAddress?.emailAddress ?? "—"}
          </Text>
        </Card>

        <View className="gap-3">
          <Text variant="label" className="text-muted-foreground">
            Appearance
          </Text>
          <Card className="p-0">
            {OPTIONS.map((opt, i) => (
              <View key={opt.value}>
                {i > 0 ? <Separator /> : null}
                <Button
                  label={opt.label}
                  variant={preference === opt.value ? "secondary" : "ghost"}
                  onPress={() => setPreference(opt.value)}
                  className="justify-start rounded-none"
                />
              </View>
            ))}
          </Card>
        </View>

        <Button label="Sign out" variant="outline" onPress={onSignOut} />
      </View>
    </Screen>
  );
}
