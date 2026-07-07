import { Text as RNText, type TextProps } from "react-native";

import { cn } from "@/lib/cn";

/**
 * Typographic scale from FRONTEND-ARCHITECTURE.md §6 — oversized bold headlines
 * against quiet regular body, the Uber weight-contrast move. Uses the Inter
 * family variants registered in tailwind.config.js.
 */
export type TextVariant =
  | "display" // 28 / Bold — screen titles ("Today")
  | "title" // 18 / Bold — card headings, driver name
  | "body" // 15 / Regular — default
  | "label" // 13 / Medium — buttons, badges, tabs
  | "caption" // 12 / Regular, muted — timestamps
  | "numericHero"; // 24 / Bold, tabular — ETA / countdown

const VARIANT: Record<TextVariant, string> = {
  display: "font-bold text-[28px] leading-tight text-foreground",
  title: "font-bold text-[18px] text-foreground",
  body: "font-sans text-[15px] text-foreground",
  label: "font-medium text-[13px] text-foreground",
  caption: "font-sans text-[12px] text-muted-foreground",
  numericHero: "font-bold text-[24px] text-foreground tabular-nums",
};

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
}

export function Text({ variant = "body", className, ...props }: AppTextProps) {
  return <RNText className={cn(VARIANT[variant], className)} {...props} />;
}
