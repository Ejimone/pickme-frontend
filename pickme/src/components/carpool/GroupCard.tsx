import { CaretRight } from "phosphor-react-native";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/hooks/useTheme";
import type { CarpoolGroup } from "@/lib/api-types";

/**
 * Carpool group list item: name, school/member summary, and the invite code.
 */
export function GroupCard({
  group,
  schoolName,
  subtitle,
  onPress,
}: {
  group: CarpoolGroup;
  schoolName?: string;
  subtitle?: string;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
      className="flex-row items-center gap-3 rounded-[10px] bg-card-secondary px-4 py-4"
    >
      <View className="flex-1">
        <Text className="text-[15px] font-bold text-foreground">{group.name}</Text>
        <Text variant="caption" className="mt-1">
          {subtitle ?? [schoolName, `Code ${group.invite_code}`].filter(Boolean).join(" · ")}
        </Text>
      </View>
      <CaretRight size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}
