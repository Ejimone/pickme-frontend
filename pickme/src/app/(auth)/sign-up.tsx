import { useSignUp } from "@clerk/clerk-expo";
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
 * New-account sign up: name + email + password (Clerk), then an emailed code to
 * verify. Social SSO and phone are offered as alternatives.
 */
export default function SignUp() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function onCreate() {
    if (!isLoaded || pending) return;
    setError(undefined);
    setPending(true);
    try {
      const [first, ...rest] = name.trim().split(/\s+/);
      await signUp.create({
        emailAddress: email.trim(),
        password,
        firstName: first || undefined,
        lastName: rest.join(" ") || undefined,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err) {
      setError(clerkError(err, "Couldn't create your account. Please try again."));
    } finally {
      setPending(false);
    }
  }

  async function onVerify() {
    if (!isLoaded || pending) return;
    setError(undefined);
    setPending(true);
    try {
      const res = await signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        router.replace("/");
      } else {
        setError("That code didn't work. Please try again.");
      }
    } catch (err) {
      setError(clerkError(err, "Invalid or expired code."));
    } finally {
      setPending(false);
    }
  }

  if (step === "verify") {
    return (
      <Screen padded={false}>
        <ScrollView
          contentContainerClassName="px-5 pb-10"
          keyboardShouldPersistTaps="handled"
        >
          <AuthHeader onBack={() => setStep("form")} />
          <Text className="mt-8 text-[28px] font-bold text-foreground">Check your email</Text>
          <Text variant="body" className="mt-3 text-muted-foreground">
            We sent a 6-digit code to {email.trim()}.
          </Text>
          <View className="mt-8 gap-5">
            <Field
              label="Verification code"
              value={code}
              onChangeText={setCode}
              placeholder="123456"
              keyboardType="number-pad"
              autoComplete="one-time-code"
              maxLength={6}
            />
            {error ? (
              <Text variant="caption" className="text-destructive">
                {error}
              </Text>
            ) : null}
            <Button
              label="Verify & continue"
              loading={pending}
              disabled={code.trim().length < 6}
              onPress={onVerify}
            />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  const canSubmit = email.trim().length > 0 && password.length >= 8;

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerClassName="px-5 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader />

        <Text className="mt-8 text-[28px] font-bold text-foreground">Create your account</Text>
        <Text variant="body" className="mt-3 text-muted-foreground">
          Coordinate school pickups, carpools, and live trips with your family.
        </Text>

        <View className="mt-8 gap-5">
          <Field
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Sarah Ortiz"
            autoCapitalize="words"
            autoComplete="name"
          />
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
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            secureTextEntry
            autoCapitalize="none"
          />
          {error ? (
            <Text variant="caption" className="text-destructive">
              {error}
            </Text>
          ) : null}
          <Button
            label="Create account"
            loading={pending}
            disabled={!canSubmit}
            onPress={onCreate}
          />
        </View>

        <View className="my-6 flex-row items-center gap-3">
          <View className="h-px flex-1 bg-border" />
          <Text variant="caption">or</Text>
          <View className="h-px flex-1 bg-border" />
        </View>

        <OAuthButtons />

        <View className="mt-4">
          <Button
            label="Sign up with phone"
            variant="outline"
            onPress={() => router.push("/(auth)/phone")}
            className="h-[52px] rounded-[10px]"
          />
        </View>

        <View className="mt-8 flex-row justify-center gap-1">
          <Text variant="caption" className="text-[13px]">
            Already have an account?
          </Text>
          <Pressable onPress={() => router.replace("/(auth)/sign-in")} hitSlop={8}>
            <Text className="text-[13px] font-bold text-accent">Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}
