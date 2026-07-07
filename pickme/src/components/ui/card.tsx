import { View, type ViewProps } from "react-native";

import { cn } from "@/lib/cn";

/** Flat card — 8px radius, 1px border in light, lifted surface in dark. No shadow. */
export function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn(
        "rounded-lg border border-border bg-card p-4",
        className,
      )}
      {...props}
    />
  );
}

export function CardRow({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn("flex-row items-center gap-3", className)}
      {...props}
    />
  );
}
