import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { House } from "phosphor-react-native";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";

/**
 * Brand splash + entry. Always dark (the mockup's black canvas), independent of
 * the app theme. "Get started" → sign-up, "I already have an account" → sign-in.
 */
export default function Welcome() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={["top", "left", "right", "bottom"]}>
        <View className="flex-1 justify-between px-5 pb-6">
          <View className="flex-1 items-center justify-center gap-5">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-white">
              <House size={34} color="#000000" weight="fill" />
            </View>
            <View className="items-center gap-3">
              <Text className="text-center text-[32px] font-bold leading-[38px] text-white">
                School Pickup{"\n"}Coordinator
              </Text>
              <Text className="text-[15px] text-[#afafaf]">
                Every kid. Every school. One app.
              </Text>
            </View>
          </View>

          <View className="gap-3">
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(auth)/sign-up")}
              style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
              className="h-[54px] items-center justify-center rounded-[10px] bg-white"
            >
              <Text className="text-[15px] font-bold text-black">Get started</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(auth)/sign-in")}
              style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
              className="h-[54px] items-center justify-center rounded-[10px] border border-[#333333] bg-[#1f1f1f]"
            >
              <Text className="text-[14px] font-bold text-white">
                I already have an account
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
