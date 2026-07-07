import { StatusBar } from "expo-status-bar";
import { View, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { cn } from "@/lib/cn";
import { useTheme } from "@/hooks/useTheme";
import { Text } from "@/components/ui/text";

/**
 * Standard screen frame: safe-area, themed background, optional big Uber title.
 * Content padding is applied by default; pass padded={false} for full-bleed
 * (e.g. the trip map).
 */
export interface ScreenProps extends ViewProps {
  title?: string;
  /** Right-aligned header slot (e.g. a Bell/notifications button). */
  headerRight?: React.ReactNode;
  padded?: boolean;
  edges?: Edge[];
}

export function Screen({
  title,
  headerRight,
  padded = true,
  edges = ["top", "left", "right"],
  className,
  children,
  ...props
}: ScreenProps) {
  const { name } = useTheme();
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-background">
      <StatusBar style={name === "dark" ? "light" : "dark"} />
      {title ? (
        <View className="flex-row items-center justify-between px-5 pb-2 pt-1">
          <Text variant="display">{title}</Text>
          {headerRight}
        </View>
      ) : null}
      <View className={cn("flex-1", padded && "px-5", className)} {...props}>
        {children}
      </View>
    </SafeAreaView>
  );
}
