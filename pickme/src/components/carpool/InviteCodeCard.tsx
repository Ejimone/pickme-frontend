import * as Clipboard from "expo-clipboard";
import { Check, Copy, ShareNetwork } from "phosphor-react-native";
import { useState } from "react";
import { Pressable, Share, View } from "react-native";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/hooks/useTheme";

/**
 * Shows a group's invite code with copy + native-share actions. Sharing the
 * code is the primary way to invite parents (they redeem it via "Join with a
 * code"); an email invite is available separately once the backend supports it.
 */
export function InviteCodeCard({
  code,
  groupName,
}: {
  code: string;
  groupName: string;
}) {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);

  async function copy() {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function share() {
    Share.share({
      message: `Join our "${groupName}" carpool on PickMe. Open the app → Carpool → Join with a code, and enter: ${code}`,
    });
  }

  return (
    <View className="rounded-[10px] bg-card-secondary px-4 py-4">
      <Text className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
        Invite code
      </Text>
      <Text className="mt-2 text-[28px] font-bold tracking-[4px] text-foreground">
        {code}
      </Text>
      <Text variant="caption" className="mt-1">
        Share this code so other parents can join the group.
      </Text>
      <View className="mt-4 flex-row gap-3">
        <Pressable
          onPress={share}
          className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-[10px] bg-primary"
        >
          <ShareNetwork size={17} color={colors.primaryForeground} weight="bold" />
          <Text className="text-[14px] font-bold text-primary-foreground">Share invite</Text>
        </Pressable>
        <Pressable
          onPress={copy}
          className="h-11 w-11 items-center justify-center rounded-[10px] border border-border"
          accessibilityLabel="Copy code"
        >
          {copied ? (
            <Check size={18} color={colors.success} weight="bold" />
          ) : (
            <Copy size={18} color={colors.foreground} />
          )}
        </Pressable>
      </View>
    </View>
  );
}
