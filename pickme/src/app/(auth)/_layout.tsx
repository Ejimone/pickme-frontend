import { Stack } from "expo-router";

// Redirects are handled by the root auth gate (src/app/_layout.tsx).
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
