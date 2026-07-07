import { Image } from "expo-image";
import { View } from "react-native";

import { cn } from "@/lib/cn";
import { Text } from "./text";

/**
 * Avatar with initials fallback and an optional per-child `color_tag` ring
 * (thin, muted — identity label, never competes with status color).
 */
export interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: number;
  /** Hex from child.color_tag; draws a 2px ring when set. */
  ringColor?: string | null;
  className?: string;
}

function initials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[1]?.[0] ?? "") : "");
}

export function Avatar({ uri, name, size = 44, ringColor, className }: AvatarProps) {
  const ringStyle = ringColor
    ? { borderWidth: 2, borderColor: ringColor, padding: 2 }
    : undefined;
  const inner = size - (ringColor ? 8 : 0);

  return (
    <View
      style={[{ width: size, height: size, borderRadius: size / 2 }, ringStyle]}
      className={cn("items-center justify-center", className)}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: inner, height: inner, borderRadius: inner / 2 }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{ width: inner, height: inner, borderRadius: inner / 2 }}
          className="items-center justify-center bg-card-secondary"
        >
          <Text variant="label" className="uppercase text-muted-foreground">
            {initials(name)}
          </Text>
        </View>
      )}
    </View>
  );
}
