import { useSignIn, useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Text } from "@/components/ui/text";
import { Screen } from "@/components/shared/Screen";
import { clerkError, isIdentifierNotFound } from "@/lib/clerk-error";

/**
 * Phone sign-in/up in one flow. We try to sign an existing user in; if the
 * number has no account yet, we fall back to creating one. Either way the user
 * confirms a texted code.
 */
export default function PhoneAuth() {
  const router = useRouter();
  const signInHook = useSignIn();
  const signUpHook = useSignUp();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [flow, setFlow] = useState<"in" | "up">("in");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function sendCode() {
    if (!signInHook.isLoaded || !signUpHook.isLoaded || pending) return;
    setError(undefined);
    setPending(true);
    const number = phone.trim();
    try {
      const attempt = await signInHook.signIn.create({ identifier: number });
      const factor = attempt.supportedFirstFactors?.find(
        (f): f is typeof f & { phoneNumberId: string } =>
          f.strategy === "phone_code",
      );
      if (!factor) throw new Error("Phone sign-in isn't available for this account.");
      await signInHook.signIn.prepareFirstFactor({
        strategy: "phone_code",
        phoneNumberId: factor.phoneNumberId,
      });
      setFlow("in");
      setStep("code");
    } catch (err) {
      if (isIdentifierNotFound(err)) {
        try {
          await signUpHook.signUp.create({ phoneNumber: number });
          await signUpHook.signUp.preparePhoneNumberVerification({
            strategy: "phone_code",
          });
          setFlow("up");
          setStep("code");
        } catch (err2) {
          setError(clerkError(err2, "Couldn't start phone sign-up."));
        }
      } else {
        setError(clerkError(err, "Couldn't send a code to that number."));
      }
    } finally {
      setPending(false);
    }
  }

  async function verify() {
    if (!signInHook.isLoaded || !signUpHook.isLoaded || pending) return;
    setError(undefined);
    setPending(true);
    try {
      if (flow === "in") {
        const res = await signInHook.signIn.attemptFirstFactor({
          strategy: "phone_code",
          code: code.trim(),
        });
        if (res.status === "complete") {
          await signInHook.setActive({ session: res.createdSessionId });
          router.replace("/");
          return;
        }
      } else {
        const res = await signUpHook.signUp.attemptPhoneNumberVerification({
          code: code.trim(),
        });
        if (res.status === "complete") {
          await signUpHook.setActive({ session: res.createdSessionId });
          router.replace("/");
          return;
        }
      }
      setError("That code didn't work. Please try again.");
    } catch (err) {
      setError(clerkError(err, "Invalid or expired code."));
    } finally {
      setPending(false);
    }
  }

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerClassName="px-5 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader onBack={() => (step === "code" ? setStep("phone") : router.back())} />

        {step === "phone" ? (
          <>
            <Text className="mt-8 text-[28px] font-bold text-foreground">
              Continue with phone
            </Text>
            <Text variant="body" className="mt-3 text-muted-foreground">
              We'll text you a code to sign in or create your account.
            </Text>
            <View className="mt-8 gap-5">
              <Field
                label="Phone number"
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 555 123 4567"
                keyboardType="phone-pad"
                autoComplete="tel"
                inputMode="tel"
              />
              {error ? (
                <Text variant="caption" className="text-destructive">
                  {error}
                </Text>
              ) : null}
              <Button
                label="Send code"
                loading={pending}
                disabled={phone.trim().length < 6}
                onPress={sendCode}
              />
            </View>
          </>
        ) : (
          <>
            <Text className="mt-8 text-[28px] font-bold text-foreground">Enter the code</Text>
            <Text variant="body" className="mt-3 text-muted-foreground">
              We texted a 6-digit code to {phone.trim()}.
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
                onPress={verify}
              />
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
