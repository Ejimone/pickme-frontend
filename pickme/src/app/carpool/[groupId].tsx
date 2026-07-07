import { useLocalSearchParams, useRouter } from "expo-router";
import { Check } from "phosphor-react-native";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from "react-native";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { InviteCodeCard } from "@/components/carpool/InviteCodeCard";
import { MemberRow } from "@/components/carpool/MemberRow";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Text } from "@/components/ui/text";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Screen } from "@/components/shared/Screen";
import {
  useCarpoolGroup,
  useGroupMembers,
  useInviteToCarpoolGroup,
  useLeaveCarpoolGroup,
  useRotationRule,
} from "@/hooks/api/useCarpool";
import { useFamilies } from "@/hooks/api/useFamilies";
import { useSchools } from "@/hooks/api/useSchools";
import { ApiError } from "@/lib/api-client";

const ROTATION_LABEL: Record<string, string> = {
  round_robin: "Round robin",
  weighted: "Weighted",
  manual_only: "Manual only",
};

export default function CarpoolGroupDetail() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const group = useCarpoolGroup(groupId);
  const members = useGroupMembers(groupId);
  const families = useFamilies();
  const schools = useSchools();
  const rotation = useRotationRule(groupId);
  const invite = useInviteToCarpoolGroup(groupId ?? "");
  const leave = useLeaveCarpoolGroup();

  const [email, setEmail] = useState("");
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteError, setInviteError] = useState<string>();

  const familyId = families.data?.[0]?.id;
  const myMembership = members.data?.find((m) => m.family === familyId);
  const isAdmin = myMembership?.role === "admin";
  const schoolName = schools.data?.find((s) => s.id === group.data?.school)?.name;

  async function onInvite() {
    setInviteError(undefined);
    try {
      await invite.mutateAsync(email.trim());
      setInviteSent(true);
      setEmail("");
    } catch (err) {
      // Most likely the endpoint isn't live yet — steer them to the code.
      setInviteError(
        err instanceof ApiError && err.status !== 404
          ? err.message
          : "Email invites aren't enabled yet. Share the invite code above instead.",
      );
    }
  }

  function onLeave() {
    if (!groupId) return;
    Alert.alert("Leave group?", "You'll stop receiving this group's trips and rotation.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: () =>
          leave.mutate(groupId, {
            onSuccess: () => router.back(),
            onError: (err) =>
              Alert.alert(
                "Couldn't leave",
                err instanceof ApiError && err.status !== 404
                  ? err.message
                  : "Leaving a group needs a backend update (see CARPOOL_BACKEND_PROMPT.md).",
              ),
          }),
      },
    ]);
  }

  if (group.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  const emailValid = /.+@.+\..+/.test(email.trim());

  return (
    <Screen padded={false}>
      <ScrollView contentContainerClassName="px-5 pb-10" keyboardShouldPersistTaps="handled">
        <AuthHeader />

        <Text className="mt-2 text-[28px] font-bold text-foreground">{group.data?.name}</Text>
        <Text variant="body" className="mt-1 text-muted-foreground">
          {[schoolName, ROTATION_LABEL[rotation.data?.rotation_type ?? ""] ?? "Rotation not set"]
            .filter(Boolean)
            .join(" · ")}
        </Text>

        <View className="mt-6">
          {group.data ? (
            <InviteCodeCard code={group.data.invite_code} groupName={group.data.name} />
          ) : null}
        </View>

        {/* Email invite (needs backend endpoint; falls back to code sharing) */}
        <View className="mt-6 gap-2">
          <SectionHeader title="Invite a parent by email" />
          <View className="flex-row gap-3">
            <Field
              containerClassName="flex-1"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setInviteSent(false);
                setInviteError(undefined);
              }}
              placeholder="parent@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              inputMode="email"
            />
            <Pressable
              onPress={onInvite}
              disabled={!emailValid || invite.isPending}
              className={`h-[52px] w-20 items-center justify-center rounded-[10px] border border-border ${
                !emailValid ? "opacity-40" : ""
              }`}
            >
              <Text className="text-[14px] font-bold text-foreground">Invite</Text>
            </Pressable>
          </View>
          {inviteSent ? (
            <View className="flex-row items-center gap-1.5 self-start rounded-full bg-accent/10 px-3 py-1.5">
              <Check size={13} color="#276ef1" weight="bold" />
              <Text className="text-[12px] font-bold text-accent">Invite sent</Text>
            </View>
          ) : null}
          {inviteError ? (
            <Text variant="caption" className="text-muted-foreground">
              {inviteError}
            </Text>
          ) : null}
        </View>

        {/* Members */}
        <View className="mt-6 gap-2">
          <SectionHeader title={`Members${members.data ? ` · ${members.data.length}` : ""}`} />
          <View className="overflow-hidden rounded-[10px] bg-card-secondary">
            {(members.data ?? []).map((m, i) => (
              <View key={m.id} className={i > 0 ? "border-t border-border" : undefined}>
                <MemberRow member={m} isYou={m.family === familyId} />
              </View>
            ))}
            {members.data && members.data.length === 0 ? (
              <View className="px-4 py-4">
                <Text variant="caption">Just you so far — invite a parent to get started.</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="mt-8">
          <Button label="Leave group" variant="outline" onPress={onLeave} loading={leave.isPending} />
        </View>

        {isAdmin ? (
          <Text variant="caption" className="mt-3 text-center">
            You're an admin of this group.
          </Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
