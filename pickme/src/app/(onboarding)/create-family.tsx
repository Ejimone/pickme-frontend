import { useRouter } from "expo-router";
import { Check } from "phosphor-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Text } from "@/components/ui/text";
import { Screen } from "@/components/shared/Screen";
import { useCreateFamily, useInviteMember } from "@/hooks/api/useFamilies";
import { ApiError } from "@/lib/api-client";
import type { Family, UUID } from "@/lib/api-types";

/**
 * Onboarding step 1 — name the household and optionally invite a co-parent.
 * The family is created lazily (on invite or on continue) so the invite has a
 * family to attach to.
 */
export default function CreateFamily() {
  const router = useRouter();
  const createFamily = useCreateFamily();
  const inviteMember = useInviteMember();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [familyId, setFamilyId] = useState<UUID | null>(null);
  const [inviteSent, setInviteSent] = useState(false);
  const [error, setError] = useState<string>();

  async function ensureFamily(): Promise<UUID> {
    if (familyId) return familyId;
    const family: Family = await createFamily.mutateAsync(name.trim());
    setFamilyId(family.id);
    return family.id;
  }

  async function onInvite() {
    setError(undefined);
    try {
      const id = await ensureFamily();
      await inviteMember.mutateAsync({ familyId: id, email: email.trim() });
      setInviteSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send the invite.");
    }
  }

  async function onContinue() {
    setError(undefined);
    try {
      await ensureFamily();
      router.replace("/(onboarding)/add-children");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.fieldError("name") ?? err.message
          : "Couldn't create your family.",
      );
    }
  }

  const emailValid = /.+@.+\..+/.test(email.trim());

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerClassName="flex-grow px-5 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader step={1} />

        <Text className="mt-4 text-[28px] font-bold text-foreground">
          Name your family
        </Text>
        <Text variant="body" className="mt-3 text-muted-foreground">
          Co-parents and guardians you invite will join this household.
        </Text>

        <View className="mt-8 gap-6">
          <Field
            label="Family name"
            value={name}
            onChangeText={setName}
            placeholder="The Ortiz household"
            autoFocus
          />

          <View className="gap-2">
            <Text className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
              Invite a co-parent (optional)
            </Text>
            <View className="flex-row gap-3">
              <Field
                containerClassName="flex-1"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setInviteSent(false);
                }}
                placeholder="alex@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                inputMode="email"
              />
              <Pressable
                onPress={onInvite}
                disabled={!emailValid || name.trim().length === 0 || inviteMember.isPending}
                style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
                className={`h-[52px] w-20 items-center justify-center rounded-[10px] border border-border ${
                  !emailValid || name.trim().length === 0 ? "opacity-40" : ""
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
          </View>

          {error ? (
            <Text variant="caption" className="text-destructive">
              {error}
            </Text>
          ) : null}
        </View>

        <View className="flex-1" />

        <Button
          label="Continue"
          loading={createFamily.isPending && !inviteMember.isPending}
          disabled={name.trim().length === 0}
          onPress={onContinue}
        />
      </ScrollView>
    </Screen>
  );
}
