import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Screen } from "@/components/shared/Screen";
import { useCreateSchool } from "@/hooks/api/useSchools";
import { ApiError } from "@/lib/api-client";

/**
 * Add a school (shared reference data — any authed user can create). A full
 * Places-autocomplete picker lands in a later stage; this is the manual form.
 */
export default function AddSchool() {
  const router = useRouter();
  const createSchool = useCreateSchool();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [timezone, setTimezone] = useState("America/Chicago");
  const [dismissal, setDismissal] = useState("15:00");

  async function onSubmit() {
    try {
      await createSchool.mutateAsync({
        name: name.trim(),
        address: address.trim(),
        timezone: timezone.trim(),
        default_dismissal_time: dismissal.trim(),
      });
      router.back();
    } catch {
      // shown below
    }
  }

  const err = createSchool.error instanceof ApiError ? createSchool.error : undefined;

  return (
    <Screen title="Add school">
      <ScrollView contentContainerClassName="gap-4 pb-8">
        <Input
          label="School name"
          value={name}
          onChangeText={setName}
          placeholder="Lincoln Elementary"
          error={err?.fieldError("name")}
        />
        <Input
          label="Address"
          value={address}
          onChangeText={setAddress}
          placeholder="123 Main St"
          error={err?.fieldError("address")}
        />
        <Input
          label="Timezone (IANA)"
          value={timezone}
          onChangeText={setTimezone}
          autoCapitalize="none"
          placeholder="America/Chicago"
          error={err?.fieldError("timezone")}
        />
        <Input
          label="Default dismissal time (HH:MM)"
          value={dismissal}
          onChangeText={setDismissal}
          placeholder="15:00"
          error={err?.fieldError("default_dismissal_time")}
        />
        {err && !err.details ? (
          <Text variant="caption" className="text-destructive">
            {err.message}
          </Text>
        ) : null}
        <Button
          label="Add school"
          loading={createSchool.isPending}
          disabled={name.trim().length === 0}
          onPress={onSubmit}
        />
      </ScrollView>
    </Screen>
  );
}
