import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/hooks/useTheme";
import { statusMeta, type StatusTone } from "@/lib/status";

/**
 * The one place status enums become color. Reused on Today, Trip, and Rotation
 * so the status language is byte-identical everywhere. Tone → color is the law:
 * blue=live, green=done, yellow=pending (dark text always), red=alert, gray=neutral.
 */

const TONE_CONTAINER: Record<StatusTone, string> = {
  live: "bg-accent/15",
  done: "bg-success/15",
  pending: "bg-warning/20",
  alert: "bg-destructive/15",
  neutral: "bg-card-secondary",
};

const TONE_TEXT: Record<StatusTone, string> = {
  live: "text-accent",
  done: "text-success",
  // Yellow badges keep DARK text in both modes (never white) — §6.
  pending: "text-black",
  alert: "text-destructive",
  neutral: "text-muted-foreground",
};

const TONE_ICON: Record<StatusTone, keyof ReturnType<typeof useTheme>["colors"]> = {
  live: "accent",
  done: "success",
  pending: "foreground", // dark icon on yellow, matches text
  alert: "destructive",
  neutral: "mutedForeground",
};

export function StatusBadge({
  status,
  showIcon = true,
}: {
  status: string;
  showIcon?: boolean;
}) {
  const { colors } = useTheme();
  const meta = statusMeta(status);
  const iconColor =
    meta.tone === "pending" ? "#000000" : colors[TONE_ICON[meta.tone]];

  return (
    <Badge
      label={meta.label}
      containerClassName={TONE_CONTAINER[meta.tone]}
      textClassName={TONE_TEXT[meta.tone]}
      icon={
        showIcon ? <meta.Icon size={13} color={iconColor} weight="fill" /> : undefined
      }
    />
  );
}
