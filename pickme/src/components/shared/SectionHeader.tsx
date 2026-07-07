import { Pressable, View } from "react-native";

import { cn } from "@/lib/cn";
import { Text } from "@/components/ui/text";

/**
 * A section title (16px bold) with an optional accent action on the right,
 * matching the v2 screen section headers ("Activities" + "Edit", etc.).
 */
export function SectionHeader({
  title,
  actionLabel,
  onAction,
  className,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <View className={cn("flex-row items-center justify-between", className)}>
      <Text className="text-[16px] font-bold text-foreground">{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text className="text-[13px] font-bold text-accent">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
