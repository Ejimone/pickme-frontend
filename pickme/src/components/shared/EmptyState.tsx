import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/hooks/useTheme";
import type { PhosphorIcon } from "@/lib/status";

/** Consistent empty state: Phosphor icon + one-line copy + optional action. */
export function EmptyState({
  Icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  Icon: PhosphorIcon;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8 py-16">
      <Icon size={40} color={colors.mutedForeground} weight="regular" />
      <Text variant="title" className="text-center">
        {title}
      </Text>
      {message ? (
        <Text variant="body" className="text-center text-muted-foreground">
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View className="mt-2 w-full max-w-xs">
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
