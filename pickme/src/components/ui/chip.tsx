import { Pressable } from "react-native";

import { cn } from "@/lib/cn";
import { Text } from "./text";

/**
 * Selectable pill. Selected = primary fill; unselected = card-secondary. Used
 * for multi-choice grids like a child's default pickup method.
 */
export function Chip({
  label,
  selected,
  onPress,
  className,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      className={cn(
        "h-10 items-center justify-center rounded-[8px] px-4",
        selected ? "bg-primary" : "bg-card-secondary",
        className,
      )}
    >
      <Text
        className={cn(
          "text-[12px] font-bold",
          selected ? "text-primary-foreground" : "text-foreground",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
