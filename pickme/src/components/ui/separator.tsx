import { View, type ViewProps } from "react-native";

import { cn } from "@/lib/cn";

/** Hairline divider — the Uber list idiom for dense rows. */
export function Separator({ className, ...props }: ViewProps) {
  return <View className={cn("h-px w-full bg-border", className)} {...props} />;
}
