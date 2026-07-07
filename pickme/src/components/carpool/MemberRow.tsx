import { View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import type { CarpoolGroupMember } from "@/lib/api-types";

export function MemberRow({
  member,
  isYou,
}: {
  member: CarpoolGroupMember;
  isYou?: boolean;
}) {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <Avatar name={member.family_name} size={40} />
      <View className="flex-1">
        <Text className="text-[15px] font-bold text-foreground">
          {member.family_name}
          {isYou ? " (you)" : ""}
        </Text>
        <Text variant="caption" className="capitalize">
          {member.role}
        </Text>
      </View>
      {member.role === "admin" ? (
        <Badge label="Admin" containerClassName="bg-accent/15" textClassName="text-accent" />
      ) : null}
    </View>
  );
}
