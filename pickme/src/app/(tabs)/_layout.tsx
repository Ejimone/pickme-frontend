import { Tabs } from "expo-router";
import {
  Car,
  ChatCircle,
  GearSix,
  House,
  type IconProps,
  UsersThree,
} from "phosphor-react-native";
import type { ColorValue } from "react-native";

import { useTheme } from "@/hooks/useTheme";

export default function TabsLayout() {
  const { colors } = useTheme();

  // expo-router hands us a ColorValue; phosphor wants a string — the runtime
  // value is a hex string, so coerce at the boundary.
  const icon =
    (Icon: React.ComponentType<IconProps>) =>
    ({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) => (
      <Icon color={color as string} size={size} weight={focused ? "fill" : "regular"} />
    );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.foreground,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 10, fontFamily: "Inter_500Medium" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Today", tabBarIcon: icon(House) }}
      />
      <Tabs.Screen
        name="carpool/index"
        options={{ title: "Carpool", tabBarIcon: icon(Car) }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{ title: "Chat", tabBarIcon: icon(ChatCircle) }}
      />
      <Tabs.Screen
        name="family/index"
        options={{ title: "Family", tabBarIcon: icon(UsersThree) }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{ title: "Settings", tabBarIcon: icon(GearSix) }}
      />
    </Tabs>
  );
}
