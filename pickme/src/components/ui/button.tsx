import { ActivityIndicator, Pressable, type PressableProps, View } from "react-native";

import { cn } from "@/lib/cn";
import { Text } from "./text";

/**
 * The Uber CTA. One primary action per screen: full-width black (white in dark).
 * 48px min height, radius 8, min 44pt touch target.
 */
export type ButtonVariant =
  | "primary" // black fill (white in dark) — the signature CTA
  | "secondary" // gray card-secondary fill
  | "outline" // thin border, transparent
  | "ghost" // no chrome
  | "destructive"; // red — SOS only

export type ButtonSize = "default" | "sm" | "lg";

const CONTAINER: Record<ButtonVariant, string> = {
  primary: "bg-primary",
  secondary: "bg-card-secondary",
  outline: "border border-border bg-transparent",
  ghost: "bg-transparent",
  destructive: "bg-destructive",
};

const LABEL_COLOR: Record<ButtonVariant, string> = {
  primary: "text-primary-foreground",
  secondary: "text-foreground",
  outline: "text-foreground",
  ghost: "text-foreground",
  destructive: "text-white",
};

const SIZE: Record<ButtonSize, string> = {
  default: "h-12 px-5",
  sm: "h-10 px-4",
  lg: "h-[52px] px-6",
};

export interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  /** Optional leading icon (e.g. a Phosphor icon element). */
  icon?: React.ReactNode;
  className?: string;
}

export function Button({
  label,
  variant = "primary",
  size = "default",
  loading = false,
  fullWidth = true,
  icon,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={cn(
        "flex-row items-center justify-center gap-2 rounded-lg",
        SIZE[size],
        CONTAINER[variant],
        fullWidth && "w-full",
        isDisabled && "opacity-50",
        className,
      )}
      style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? undefined : undefined} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text variant="label" className={cn("text-[15px]", LABEL_COLOR[variant])}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
