import { useColorScheme } from "nativewind";
import { useEffect } from "react";

import { colors, type ThemeColors, type ThemeName } from "@/lib/theme";
import { useUiStore } from "@/stores/ui";

/**
 * Push the user's theme preference (Settings) into NativeWind. "system" makes
 * NativeWind follow the OS. Mount once, high in the tree (root layout).
 */
export function useThemeSync() {
  const preference = useUiStore((s) => s.themePreference);
  const { setColorScheme } = useColorScheme();
  useEffect(() => {
    setColorScheme(preference);
  }, [preference, setColorScheme]);
}

/** Active theme name + its TS token map (for native/maps/reanimated consumers). */
export function useTheme(): { name: ThemeName; colors: ThemeColors } {
  const { colorScheme } = useColorScheme();
  const name: ThemeName = colorScheme === "dark" ? "dark" : "light";
  return { name, colors: colors[name] };
}
