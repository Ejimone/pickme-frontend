import { useRouter } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import { Pressable, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";

/**
 * Top bar for auth + onboarding screens: a back chevron and, when `step` is
 * given, a segmented progress indicator (v2 mockups use 3 segments).
 */
export function AuthHeader({
  step,
  total = 3,
  onBack,
}: {
  step?: number;
  total?: number;
  onBack?: () => void;
}) {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <View className="gap-4 pb-2">
      <Pressable
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace("/(auth)/welcome")))}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        className="h-8 w-8 items-center justify-center"
      >
        <CaretLeft size={24} color={colors.foreground} weight="bold" />
      </Pressable>
      {step ? (
        <View className="flex-row gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <View
              key={i}
              style={{ backgroundColor: i < step ? colors.foreground : colors.border }}
              className="h-1 w-9 rounded-full"
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
