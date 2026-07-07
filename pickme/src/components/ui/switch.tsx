import { Switch as RNSwitch, type SwitchProps } from "react-native";

import { useTheme } from "@/hooks/useTheme";

/** Themed toggle — active track uses the black/white primary, not an accent. */
export function Switch(props: SwitchProps) {
  const { colors } = useTheme();
  return (
    <RNSwitch
      trackColor={{ false: colors.muted, true: colors.primary }}
      thumbColor={colors.background}
      ios_backgroundColor={colors.muted}
      {...props}
    />
  );
}
