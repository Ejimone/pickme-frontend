import "../../global.css";

import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { registerTokenGetter } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { tokenCache } from "@/lib/token-cache";
import { useThemeSync } from "@/hooks/useTheme";

SplashScreen.preventAutoHideAsync();

const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn(
    "[auth] EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set — sign-in will not work.",
  );
}

/** Feeds Clerk's getToken into the REST/WS client. Renders nothing. */
function ApiAuthBridge() {
  const { getToken } = useAuth();
  useEffect(() => {
    registerTokenGetter(() => getToken());
  }, [getToken]);
  return null;
}

/**
 * Single reactive auth gate. Moves signed-out users into (auth) and signed-in
 * users out of it — the moment Clerk's session state flips, regardless of what
 * any imperative navigation did. This is what stops the "bounced back to
 * sign-in after OAuth" race.
 */
function useAuthGate() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!isSignedIn && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (isSignedIn && inAuthGroup) {
      router.replace("/");
    }
  }, [isLoaded, isSignedIn, segments, router]);
}

function ThemedStack() {
  useThemeSync();
  useAuthGate();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY ?? ""} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <ApiAuthBridge />
            <ThemedStack />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
