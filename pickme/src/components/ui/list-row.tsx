import { CaretRight } from "phosphor-react-native";
import { Pressable, View } from "react-native";

import { cn } from "@/lib/cn";
import { useTheme } from "@/hooks/useTheme";
import { Text } from "./text";

/**
 * A tappable settings/detail row: optional leading icon, title (+ subtitle),
 * optional right-aligned value or custom accessory, and a chevron when tappable.
 */
export function ListRow({
  icon,
  title,
  subtitle,
  value,
  accessory,
  onPress,
  showChevron = true,
  destructive = false,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  accessory?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  className?: string;
}) {
  const { colors } = useTheme();
  const content = (
    <View className={cn("flex-row items-center gap-3 px-4 py-3.5", className)}>
      {icon}
      <View className="flex-1">
        <Text
          className={cn(
            "text-[15px] font-bold",
            destructive ? "text-destructive" : "text-foreground",
          )}
        >
          {title}
        </Text>
        {subtitle ? <Text variant="caption">{subtitle}</Text> : null}
      </View>
      {value ? <Text variant="caption" className="text-[13px]">{value}</Text> : null}
      {accessory}
      {onPress && showChevron ? (
        <CaretRight size={18} color={colors.mutedForeground} />
      ) : null}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => (pressed ? { opacity: 0.7 } : undefined)}>
      {content}
    </Pressable>
  );
}
