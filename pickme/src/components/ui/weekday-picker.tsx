import { Pressable, View } from "react-native";

import { cn } from "@/lib/cn";
import { Text } from "./text";

// Backend weekday convention: 0 = Monday … 6 = Sunday (PICKME_API_REFERENCE §5).
const DAYS = [
  { value: 0, label: "M" },
  { value: 1, label: "T" },
  { value: 2, label: "W" },
  { value: 3, label: "T" },
  { value: 4, label: "F" },
  { value: 5, label: "S" },
  { value: 6, label: "S" },
];

/**
 * Toggleable M–S day selector for cycle/driving days. `value` is the set of
 * selected weekday numbers (0=Mon).
 */
export function WeekdayPicker({
  value,
  onChange,
}: {
  value: number[];
  onChange: (days: number[]) => void;
}) {
  const toggle = (day: number) =>
    onChange(
      value.includes(day) ? value.filter((d) => d !== day) : [...value, day].sort(),
    );

  return (
    <View className="flex-row gap-2">
      {DAYS.map((d, i) => {
        const selected = value.includes(d.value);
        return (
          <Pressable
            key={i}
            onPress={() => toggle(d.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={cn(
              "h-10 w-10 items-center justify-center rounded-full",
              selected ? "bg-primary" : "bg-card-secondary",
            )}
          >
            <Text
              className={cn(
                "text-[14px] font-bold",
                selected ? "text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {d.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
