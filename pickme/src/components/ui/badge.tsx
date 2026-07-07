import { View, type ViewProps } from "react-native";

import { cn } from "@/lib/cn";
import { Text } from "./text";

/**
 * Generic pill. Domain-colored badges (status) compose this via StatusBadge —
 * don't hardcode status colors here, keep the color law in one place.
 */
export interface BadgeProps extends ViewProps {
  label: string;
  /** container classes (bg/border) */
  containerClassName?: string;
  /** text color class */
  textClassName?: string;
  icon?: React.ReactNode;
}

export function Badge({
  label,
  containerClassName,
  textClassName,
  icon,
  className,
  ...props
}: BadgeProps) {
  return (
    <View
      className={cn(
        "flex-row items-center gap-1 self-start rounded-full px-2.5 py-1",
        containerClassName,
        className,
      )}
      {...props}
    >
      {icon}
      <Text variant="label" className={cn("text-[12px]", textClassName)}>
        {label}
      </Text>
    </View>
  );
}
