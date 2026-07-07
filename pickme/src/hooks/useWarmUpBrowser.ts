import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Platform } from "react-native";

/**
 * Pre-warms the Android Custom Tab so the OAuth browser opens instantly.
 * No-op on iOS. Recommended by Clerk's Expo OAuth guide.
 */
export function useWarmUpBrowser() {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}
