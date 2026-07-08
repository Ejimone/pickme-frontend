/**
 * TS mirror of the global.css design tokens, for the places NativeWind
 * classNames can't reach: native APIs (StatusBar, tab bar), the Leaflet map
 * markers, and reanimated color interpolation. Keep in lockstep with
 * global.css (FRONTEND-ARCHITECTURE.md §6).
 */

export const colors = {
  light: {
    background: "#FFFFFF",
    foreground: "#000000",
    card: "#FFFFFF",
    cardSecondary: "#F6F6F6",
    primary: "#000000",
    primaryForeground: "#FFFFFF",
    muted: "#EEEEEE",
    mutedForeground: "#757575",
    border: "#E2E2E2",
    accent: "#276EF1", // blue — live / interactive
    success: "#05A357", // green — done
    warning: "#FFC043", // yellow — pending (dark text)
    destructive: "#E11900", // red — SOS / missed only
  },
  dark: {
    background: "#141414",
    foreground: "#FFFFFF",
    card: "#1F1F1F",
    cardSecondary: "#333333",
    primary: "#FFFFFF",
    primaryForeground: "#000000",
    muted: "#333333",
    mutedForeground: "#AFAFAF",
    border: "#333333",
    accent: "#3B82F6",
    success: "#1FB574",
    warning: "#FFC043",
    destructive: "#F0442E",
  },
} as const;

export type ThemeName = keyof typeof colors;
export type ThemeColors = (typeof colors)[ThemeName];

/**
 * Desaturated 8-swatch set for per-child `color_tag` avatar rings — identity
 * labels that never compete with the status colors (§6).
 */
export const CHILD_COLOR_TAGS = [
  "#4F86C6", // muted blue
  "#5B9A7B", // sage
  "#C98A5E", // clay
  "#9B7EC0", // lavender
  "#C46B7E", // rose
  "#7E9B4F", // olive
  "#5EA9C9", // teal
  "#B58A3E", // ochre
] as const;

export const RADIUS = 8;

/** Text on a yellow warning badge is always dark, in both modes. */
export const WARNING_FOREGROUND = "#000000";
