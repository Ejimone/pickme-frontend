import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { SchoolPicker } from "@/components/carpool/SchoolPicker";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Text } from "@/components/ui/text";
import { InfoBanner } from "@/components/shared/InfoBanner";
import { Screen } from "@/components/shared/Screen";
import { useCreateCarpoolGroup } from "@/hooks/api/useCarpool";
import { useFamilies } from "@/hooks/api/useFamilies";
import { ApiError } from "@/lib/api-client";
import type { UUID } from "@/lib/api-types";

/**
 * Create a carpool group. The creating family becomes the group's first admin;
 * the next screen surfaces the invite code to share with other parents.
 */
export default function CreateCarpoolGroup() {
  const router = useRouter();
  const families = useFamilies();
  const createGroup = useCreateCarpoolGroup();
  const [name, setName] = useState("");
  const [schoolId, setSchoolId] = useState<UUID | null>(null);
  const [error, setError] = useState<string>();

  const familyId = families.data?.[0]?.id;

  async function onCreate() {
    if (!familyId || !schoolId || name.trim().length === 0) return;
    setError(undefined);
    try {
      const group = await createGroup.mutateAsync({
        name: name.trim(),
        school: schoolId,
        family: familyId,
      });
      router.replace(`/carpool/${group.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the group.");
    }
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerClassName="px-5 pb-10" keyboardShouldPersistTaps="handled">
        <AuthHeader />

        <Text className="mt-4 text-[28px] font-bold text-foreground">
          Create a carpool group
        </Text>
        <Text variant="body" className="mt-3 text-muted-foreground">
          Group families that share a school run. You'll be the admin and can set the
          driving rotation.
        </Text>

        <View className="mt-8 gap-6">
          <Field
            label="Group name"
            value={name}
            onChangeText={setName}
            placeholder="Morning Crew"
            autoFocus
          />
          <SchoolPicker
            value={schoolId}
            onChange={setSchoolId}
            onAddNew={() => router.push("/(onboarding)/add-school")}
          />

          {!familyId ? (
            <InfoBanner
              tone="warning"
              message="Create your family first (Family tab) before starting a carpool group."
            />
          ) : null}
          {error ? (
            <Text variant="caption" className="text-destructive">
              {error}
            </Text>
          ) : null}

          <Button
            label="Create group"
            loading={createGroup.isPending}
            disabled={!familyId || !schoolId || name.trim().length === 0}
            onPress={onCreate}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
