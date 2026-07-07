import { Pressable } from "react-native";

import { cn } from "@/lib/cn";

/**
 * Circular icon-only button (header actions, map recenter, back). Pass the
 * Phosphor icon element as a child.
 */
export function IconButton({
  children,
  onPress,
  variant = "ghost",
  size = 40,
  accessibilityLabel,
  className,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "ghost" | "filled" | "surface";
  size?: number;
  accessibilityLabel?: string;
  className?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={cn(
        "items-center justify-center",
        variant === "filled" && "bg-primary",
        variant === "surface" && "bg-card-secondary",
        className,
      )}
    >
      {children}
    </Pressable>
  );
}
