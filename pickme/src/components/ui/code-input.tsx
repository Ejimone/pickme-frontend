import { useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { cn } from "@/lib/cn";
import { Text } from "./text";

/**
 * Boxed code entry (invite codes, OTP). Renders `length` cells backed by one
 * hidden input. `value` is uppercased for alnum invite codes when `alphanumeric`.
 */
export function CodeInput({
  value,
  onChange,
  length = 6,
  alphanumeric = false,
  autoFocus = false,
}: {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  alphanumeric?: boolean;
  autoFocus?: boolean;
}) {
  const ref = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const cells = Array.from({ length });

  return (
    <Pressable onPress={() => ref.current?.focus()} className="relative">
      <View className="flex-row justify-between">
        {cells.map((_, i) => {
          const char = value[i] ?? "";
          const active = focused && i === Math.min(value.length, length - 1);
          return (
            <View
              key={i}
              className={cn(
                "h-14 flex-1 items-center justify-center rounded-[10px] bg-card-secondary",
                i > 0 && "ml-2",
                (active || char) && "border-2 border-foreground",
              )}
            >
              <Text className="text-[20px] font-bold text-foreground">{char}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(t) => {
          const cleaned = (alphanumeric ? t.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() : t.replace(/\D/g, "")).slice(0, length);
          onChange(cleaned);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        keyboardType={alphanumeric ? "default" : "number-pad"}
        autoCapitalize="characters"
        autoComplete={alphanumeric ? "off" : "one-time-code"}
        maxLength={length}
        className="absolute h-14 w-full opacity-0"
      />
    </Pressable>
  );
}
