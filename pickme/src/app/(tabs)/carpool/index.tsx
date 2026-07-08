import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { GroupCard } from "@/components/carpool/GroupCard";
import { InfoBanner } from "@/components/shared/InfoBanner";
import { Screen } from "@/components/shared/Screen";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/code-input";
import { Text } from "@/components/ui/text";
import { useCarpoolGroups, useJoinCarpoolGroup } from "@/hooks/api/useCarpool";
import { useFamilies } from "@/hooks/api/useFamilies";
import { useSchools } from "@/hooks/api/useSchools";

// Backend invite codes are 8 alphanumeric chars (e.g. "K7MNP2QR").
const INVITE_CODE_LENGTH = 8;

/** Carpool groups list + create + join-by-code (v2 "Carpool groups" screen). */
export default function CarpoolTab() {
  const router = useRouter();
  const groups = useCarpoolGroups();
  const schools = useSchools();
  const families = useFamilies();
  const joinGroup = useJoinCarpoolGroup();
  const [code, setCode] = useState("");
  const [joinError, setJoinError] = useState<string>();

  const familyId = families.data?.[0]?.id;

  async function onJoin() {
    if (!familyId || code.length < INVITE_CODE_LENGTH) return;
    setJoinError(undefined);
    try {
      const res = await joinGroup.mutateAsync({
        invite_code: code,
        family: familyId,
      });
      setCode("");
      if (res.group?.id) router.push(`/carpool/${res.group.id}`);
    } catch {
      setJoinError("That code didn't match an open group.");
    }
  }

  const data = groups.data ?? [];

  return (
    <Screen title="Carpool" padded={false}>
      <ScrollView contentContainerClassName="px-5 pb-10">
        {data.length > 0 ? (
          <View className="gap-3">
            {data.map((g) => (
              <GroupCard
                key={g.id}
                group={g}
                schoolName={schools.data?.find((s) => s.id === g.school)?.name}
                onPress={() => router.push(`/carpool/${g.id}`)}
              />
            ))}
          </View>
        ) : (
          <InfoBanner
            title="No carpool groups yet"
            message="Create a group for a school run, or join one with a code another parent shared."
          />
        )}

        <View className="mt-4">
          <Button
            label="Create a carpool group"
            onPress={() => router.push("/carpool/create")}
          />
        </View>

        <View className="mt-6 rounded-[10px] border border-border p-4">
          <SectionHeader title="Join with an invite code" />
          <Text variant="caption" className="mb-3 mt-1">
            Enter the {INVITE_CODE_LENGTH}-character code another parent shared
            with you.
          </Text>
          <CodeInput
            value={code}
            onChange={setCode}
            length={INVITE_CODE_LENGTH}
            alphanumeric
          />
          {joinError ? (
            <Text variant="caption" className="mt-2 text-destructive">
              {joinError}
            </Text>
          ) : null}
          <View className="mt-3">
            <Button
              label="Join group"
              loading={joinGroup.isPending}
              disabled={code.length < INVITE_CODE_LENGTH || !familyId}
              onPress={onJoin}
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
