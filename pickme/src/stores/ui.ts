import { create } from "zustand";

export type ThemePreference = "system" | "light" | "dark";

interface UiState {
  /** "system" follows the OS; light/dark are manual overrides (Settings). */
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
}

// In-memory only for this pass; persistence (secure-store) lands with Settings.
export const useUiStore = create<UiState>((set) => ({
  themePreference: "system",
  setThemePreference: (themePreference) => set({ themePreference }),
}));
