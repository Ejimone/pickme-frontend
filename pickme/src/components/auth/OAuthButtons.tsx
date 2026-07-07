import { useSSO } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { AppleLogo, GoogleLogo } from "phosphor-react-native";
import { useState } from "react";
import { Platform, Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/hooks/useTheme";
import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import { clerkError } from "@/lib/clerk-error";

// Dismisses the web browser when auth completes (required by Clerk's Expo flow).
WebBrowser.maybeCompleteAuthSession();

type Strategy = "oauth_google" | "oauth_apple";

/**
 * Social sign-in via Clerk SSO. One flow serves sign-in and sign-up — Clerk
 * creates the account on first use. Apple only shows on iOS. Styled as the
 * outline buttons from the v2 mockups.
 */
export function OAuthButtons() {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const { colors } = useTheme();
  const [pending, setPending] = useState<Strategy | null>(null);
  const [error, setError] = useState<string>();

  async function onPress(strategy: Strategy) {
    setError(undefined);
    setPending(strategy);
    try {
      const { createdSessionId, setActive, signUp } = await startSSOFlow({
        strategy,
        redirectUrl: AuthSession.makeRedirectUri({ scheme: "pickme" }),
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/");
        return;
      }
      // Terms consent is the one requirement we can satisfy inline.
      if (
        signUp?.status === "missing_requirements" &&
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
      setError("Couldn't finish sign-in. Please try another method.");
    } catch (err) {
      setError(clerkError(err, "Sign-in failed. Please try again."));
    } finally {
      setPending(null);
    }
  }

  return (
    <View className="gap-3">
      <OAuthButton
        label="Continue with Google"
        icon={<GoogleLogo size={18} weight="bold" color={colors.foreground} />}
        loading={pending === "oauth_google"}
        disabled={pending !== null}
        onPress={() => onPress("oauth_google")}
      />
      {Platform.OS === "ios" ? (
        <OAuthButton
          label="Continue with Apple"
          icon={<AppleLogo size={18} weight="fill" color={colors.foreground} />}
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

function OAuthButton({
  label,
  icon,
  loading,
  disabled,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
      className={`h-[52px] flex-row items-center justify-center gap-2 rounded-[10px] border border-border bg-background ${
        disabled ? "opacity-50" : ""
      }`}
    >
      {icon}
      <Text className="text-[14px] font-bold text-foreground">
        {loading ? "…" : label}
      </Text>
    </Pressable>
  );
}
