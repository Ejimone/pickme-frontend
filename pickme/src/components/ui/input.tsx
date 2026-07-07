import { forwardRef } from "react";
import { TextInput, type TextInputProps, View } from "react-native";

import { cn } from "@/lib/cn";
import { colors } from "@/lib/theme";
import { useTheme } from "@/hooks/useTheme";
import { Text } from "./text";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, className, containerClassName, ...props },
  ref,
) {
  const { name } = useTheme();
  return (
    <View className={cn("gap-1.5", containerClassName)}>
      {label ? (
        <Text variant="label" className="text-muted-foreground">
          {label}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor={colors[name].mutedForeground}
        className={cn(
          "h-12 rounded-lg border border-border bg-card px-4 text-[15px] text-foreground",
          error && "border-destructive",
          className,
        )}
        {...props}
      />
      {error ? (
        <Text variant="caption" className="text-destructive">
          {error}
        </Text>
      ) : null}
    </View>
  );
});
