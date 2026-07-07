import { forwardRef } from "react";
import { TextInput, type TextInputProps, View } from "react-native";

import { cn } from "@/lib/cn";
import { colors } from "@/lib/theme";
import { useTheme } from "@/hooks/useTheme";
import { Text } from "./text";

export interface FieldProps extends TextInputProps {
  /** Uppercase label above the field (e.g. "EMAIL"). */
  label?: string;
  error?: string;
  containerClassName?: string;
  /** Trailing element rendered inside the field row (e.g. a show/hide toggle). */
  trailing?: React.ReactNode;
}

/**
 * Filled form field from the v2 mockups: uppercase muted label, #F6F6F6 fill,
 * no border, 52px tall, radius 10. Used across auth + onboarding.
 */
export const Field = forwardRef<TextInput, FieldProps>(function Field(
  { label, error, className, containerClassName, trailing, ...props },
  ref,
) {
  const { name } = useTheme();
  return (
    <View className={cn("gap-2", containerClassName)}>
      {label ? (
        <Text className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
          {label}
        </Text>
      ) : null}
      <View
        className={cn(
          "h-[52px] flex-row items-center rounded-[10px] bg-card-secondary px-4",
          error && "border border-destructive",
        )}
      >
        <TextInput
          ref={ref}
          placeholderTextColor={colors[name].mutedForeground}
          className={cn("flex-1 text-[14px] text-foreground", className)}
          {...props}
        />
        {trailing}
      </View>
      {error ? (
        <Text variant="caption" className="text-destructive">
          {error}
        </Text>
      ) : null}
    </View>
  );
});
