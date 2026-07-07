import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Bell, Moon, SignOut } from "phosphor-react-native";
import { View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Text } from "@/components/ui/text";
import { ListRow } from "@/components/ui/list-row";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Screen } from "@/components/shared/Screen";
import { useTheme } from "@/hooks/useTheme";
import { useUiStore, type ThemePreference } from "@/stores/ui";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function SettingsTab() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signOut } = useAuth();
  const { user } = useUser();
  const preference = useUiStore((s) => s.themePreference);
  const setPreference = useUiStore((s) => s.setThemePreference);

  async function onSignOut() {
    await signOut();
    router.replace("/(auth)/welcome");
  }

  return (
    <Screen title="Settings" padded={false}>
      <View className="gap-6 px-5 pt-2">
        <View className="flex-row items-center gap-3 rounded-[10px] bg-card-secondary px-4 py-4">
          <Avatar
            uri={user?.imageUrl}
            name={user?.fullName ?? user?.primaryEmailAddress?.emailAddress}
            size={48}
          />
          <View className="flex-1">
            <Text className="text-[16px] font-bold text-foreground">
              {user?.fullName ?? "Your account"}
            </Text>
            <Text variant="caption">{user?.primaryEmailAddress?.emailAddress ?? "—"}</Text>
          </View>
        </View>

        <View className="gap-3">
          <SectionHeader title="Appearance" />
          <View className="flex-row items-center gap-3">
            <Moon size={20} color={colors.mutedForeground} />
            <SegmentedControl
              className="flex-1"
              options={THEME_OPTIONS}
              value={preference}
              onChange={setPreference}
            />
          </View>
        </View>

        <View className="gap-2">
          <SectionHeader title="General" />
          <View className="overflow-hidden rounded-[10px] bg-card-secondary">
            <ListRow
              icon={<Bell size={20} color={colors.foreground} />}
              title="Notifications"
              onPress={() => router.push("/notifications")}
            />
            <View className="border-t border-border" />
            <ListRow
              icon={<SignOut size={20} color={colors.destructive} />}
              title="Sign out"
              destructive
              showChevron={false}
              onPress={onSignOut}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
}
