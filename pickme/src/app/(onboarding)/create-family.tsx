import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Screen } from "@/components/shared/Screen";
import { useCreateFamily } from "@/hooks/api/useFamilies";
import { ApiError } from "@/lib/api-client";

export default function CreateFamily() {
  const router = useRouter();
  const createFamily = useCreateFamily();
  const [name, setName] = useState("");

  async function onSubmit() {
    try {
      await createFamily.mutateAsync(name.trim());
      router.replace("/(onboarding)/add-children");
    } catch {
      // error surfaced below via mutation state
    }
  }

  const error =
    createFamily.error instanceof ApiError
      ? createFamily.error.fieldError("name") ?? createFamily.error.message
      : undefined;

  return (
    <Screen>
      <View className="flex-1 justify-center gap-6">
        <View className="gap-2">
          <Text variant="caption">Step 1 of 2</Text>
          <Text variant="display">Name your family</Text>
          <Text variant="body" className="text-muted-foreground">
            You’ll be the owner. Invite a co-parent later.
          </Text>
        </View>
        <Input
          label="Family name"
          value={name}
          onChangeText={setName}
          placeholder="The Okonkwos"
          error={error}
          autoFocus
        />
        <Button
          label="Continue"
          loading={createFamily.isPending}
          disabled={name.trim().length === 0}
          onPress={onSubmit}
        />
      </View>
    </Screen>
  );
}
