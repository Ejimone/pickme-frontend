import { Pressable, View } from "react-native";

import { cn } from "@/lib/cn";
import { Text } from "./text";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

/**
 * Single-row equal-width segmented selector (rotation type, driver mode, etc.).
 * Selected segment is the primary fill; the rest sit on the card-secondary track.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <View className={cn("flex-row rounded-[10px] bg-card-secondary p-1", className)}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={cn(
              "h-10 flex-1 items-center justify-center rounded-[8px]",
              selected && "bg-primary",
            )}
          >
            <Text
              className={cn(
                "text-[13px] font-bold",
                selected ? "text-primary-foreground" : "text-foreground",
              )}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
