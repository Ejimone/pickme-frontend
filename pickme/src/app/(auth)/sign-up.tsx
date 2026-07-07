import { Redirect } from "expo-router";

/**
 * With Clerk social SSO there's no separate sign-up form — the same flow creates
 * the account on first use. Kept as a route so any deep links resolve.
 */
export default function SignUp() {
  return <Redirect href="/(auth)/sign-in" />;
}
