import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Text } from "@/components/ui/text";
import { Screen } from "@/components/shared/Screen";
import { clerkError } from "@/lib/clerk-error";

/**
 * Returning-user sign in: email + password (Clerk), plus social SSO and a phone
 * option. New users route to sign-up.
 */
export default function SignIn() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function onSignIn() {
    if (!isLoaded || pending) return;
    setError(undefined);
    setPending(true);
    try {
      const res = await signIn.create({ identifier: email.trim(), password });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        router.replace("/");
      } else {
        setError("Additional verification is required to sign in.");
      }
    } catch (err) {
      setError(clerkError(err, "Couldn't sign in. Check your details and try again."));
    } finally {
      setPending(false);
    }
  }

  const canSubmit = email.trim().length > 0 && password.length > 0;

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerClassName="px-5 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader />

        <Text className="mt-8 text-[28px] font-bold text-foreground">Welcome back</Text>

        <View className="mt-8 gap-5">
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="sarah@example.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            inputMode="email"
          />
          <View className="gap-2">
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••••"
              secureTextEntry
              autoCapitalize="none"
            />
            <Pressable
              onPress={() => router.push("/(auth)/phone")}
              hitSlop={8}
              className="self-end"
            >
              <Text className="text-[13px] font-bold text-accent">
                Use phone instead
              </Text>
            </Pressable>
          </View>

          {error ? (
            <Text variant="caption" className="text-destructive">
              {error}
            </Text>
          ) : null}

          <Button
            label="Sign in"
            loading={pending}
            disabled={!canSubmit}
            onPress={onSignIn}
          />
        </View>

        <View className="my-6 flex-row items-center gap-3">
          <View className="h-px flex-1 bg-border" />
          <Text variant="caption">or</Text>
          <View className="h-px flex-1 bg-border" />
        </View>

        <OAuthButtons />

        <View className="mt-8 flex-row justify-center gap-1">
          <Text variant="caption" className="text-[13px]">
            New here?
          </Text>
          <Pressable onPress={() => router.replace("/(auth)/sign-up")} hitSlop={8}>
            <Text className="text-[13px] font-bold text-accent">Create an account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}
