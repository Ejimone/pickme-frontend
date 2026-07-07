import { useSSO } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { AppleLogo, GoogleLogo } from "phosphor-react-native";
import { useState } from "react";
import { Platform, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";

// Dismisses the web browser when auth completes (required by Clerk's Expo flow).
WebBrowser.maybeCompleteAuthSession();

type Strategy = "oauth_google" | "oauth_apple";

/**
 * Clerk social sign-in. One SSO flow serves both sign-in and sign-up — Clerk
 * creates the account on first use. Apple only shows on iOS.
 */
export function OAuthButtons() {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [pending, setPending] = useState<Strategy | null>(null);
  const [error, setError] = useState<string>();

  async function onPress(strategy: Strategy) {
    setError(undefined);
    setPending(strategy);
    try {
      const { createdSessionId, setActive, signIn, signUp } =
        await startSSOFlow({
          strategy,
          // Without an explicit scheme the redirect URI can't be inferred in
          // dev/production builds — the browser finishes auth but never hands
          // control back to the app, leaving the user stuck on this screen.
          // No path: the deep link lands on "/" (index), which already routes
          // by auth state. A dedicated path would need a matching route file.
          redirectUrl: AuthSession.makeRedirectUri({ scheme: "pickme" }),
        });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/");
        return;
      }

      // No session yet — usually a sign-up with unmet instance requirements.
      if (signUp?.status === "missing_requirements") {
        console.log("[auth] sign-up incomplete", {
          missingFields: signUp.missingFields,
          unverifiedFields: signUp.unverifiedFields,
        });
        // Terms consent is the one requirement we can satisfy here — the
        // screen already states "By continuing you agree…".
        if (
          signUp.missingFields.length === 1 &&
          signUp.missingFields[0] === "legal_accepted"
        ) {
          const updated = await signUp.update({ legalAccepted: true });
          if (updated.status === "complete" && updated.createdSessionId && setActive) {
            await setActive({ session: updated.createdSessionId });
            router.replace("/");
            return;
          }
        }
        const blockers = [
          ...signUp.missingFields.map((f) => `missing ${f}`),
          ...signUp.unverifiedFields.map((f) => `unverified ${f}`),
        ];
        setError(
          `Sign-up can't finish: ${blockers.join(", ") || "unknown requirement"}. ` +
            "Make these optional in the Clerk dashboard (Configure → Email, phone, username).",
        );
        return;
      }
      setError(
        `Sign-in did not complete (status: ${signIn?.status ?? signUp?.status ?? "unknown"}). Please try again.`,
      );
    } catch (err) {
      setError(clerkError(err));
    } finally {
      setPending(null);
    }
  }

  return (
    <View className="gap-3">
      <Button
        label="Continue with Google"
        variant="outline"
        icon={<GoogleLogo size={18} weight="bold" />}
        loading={pending === "oauth_google"}
        disabled={pending !== null}
        onPress={() => onPress("oauth_google")}
      />
      {Platform.OS === "ios" ? (
        <Button
          label="Continue with Apple"
          icon={<AppleLogo size={18} weight="fill" color="#FFFFFF" />}
          loading={pending === "oauth_apple"}
          disabled={pending !== null}
          onPress={() => onPress("oauth_apple")}
        />
      ) : null}
      {error ? (
        <Text variant="caption" className="text-center text-destructive">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function clerkError(err: unknown): string {
  const e = err as { errors?: { message?: string; longMessage?: string }[] };
  return (
    e?.errors?.[0]?.longMessage ??
    e?.errors?.[0]?.message ??
    "Sign-in failed. Please try again."
  );
}
