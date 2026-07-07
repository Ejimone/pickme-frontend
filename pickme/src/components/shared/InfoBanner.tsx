import { View } from "react-native";

import { cn } from "@/lib/cn";
import { Text } from "@/components/ui/text";

type Tone = "info" | "success" | "warning" | "danger";

const TONE_BG: Record<Tone, string> = {
  info: "bg-accent/10",
  success: "bg-success/10",
  warning: "bg-warning/20",
  danger: "bg-destructive/10",
};

/**
 * Tinted informational card (the "Join a carpool?" hint, schedule notices).
 */
export function InfoBanner({
  title,
  message,
  tone = "info",
  className,
}: {
  title?: string;
  message: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <View className={cn("rounded-[10px] px-4 py-4", TONE_BG[tone], className)}>
      {title ? (
        <Text className="text-[14px] font-bold text-foreground">{title}</Text>
      ) : null}
      <Text variant="caption" className={cn(title && "mt-1.5")}>
        {message}
      </Text>
    </View>
  );
}
