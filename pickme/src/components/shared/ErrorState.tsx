import { WarningCircle } from "phosphor-react-native";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/hooks/useTheme";
import { ApiError } from "@/lib/api-client";

/** Consistent error state; reads the backend envelope message when present. */
export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const { colors } = useTheme();
  const message =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : "Something went wrong.";

  return (
    <View className="flex-1 items-center justify-center gap-3 px-8 py-16">
      <WarningCircle size={40} color={colors.destructive} weight="regular" />
      <Text variant="title" className="text-center">
        Couldn’t load this
      </Text>
      <Text variant="body" className="text-center text-muted-foreground">
        {message}
      </Text>
      {onRetry ? (
        <View className="mt-2 w-full max-w-xs">
          <Button label="Try again" variant="secondary" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}
