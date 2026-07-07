import { Minus, Plus } from "phosphor-react-native";
import { Pressable, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { Text } from "./text";

/**
 * Compact −/value/+ numeric stepper (e.g. a family's rotation weight).
 */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  const { colors } = useTheme();
  const set = (next: number) => onChange(Math.max(min, Math.min(max, next)));
  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        onPress={() => set(value - 1)}
        disabled={value <= min}
        hitSlop={6}
        accessibilityLabel="Decrease"
        className="h-8 w-8 items-center justify-center rounded-full bg-card-secondary"
        style={value <= min ? { opacity: 0.4 } : undefined}
      >
        <Minus size={16} color={colors.foreground} weight="bold" />
      </Pressable>
      <Text className="min-w-6 text-center text-[15px] font-bold text-foreground tabular-nums">
        {value}
      </Text>
      <Pressable
        onPress={() => set(value + 1)}
        disabled={value >= max}
        hitSlop={6}
        accessibilityLabel="Increase"
        className="h-8 w-8 items-center justify-center rounded-full bg-card-secondary"
        style={value >= max ? { opacity: 0.4 } : undefined}
      >
        <Plus size={16} color={colors.foreground} weight="bold" />
      </Pressable>
    </View>
  );
}
