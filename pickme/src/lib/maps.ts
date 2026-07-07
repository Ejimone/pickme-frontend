import { Linking, Platform } from "react-native";

/**
 * Open turn-by-turn directions to a coordinate in the device's maps app —
 * Apple Maps on iOS, Google Maps navigation on Android, with a universal
 * web-maps fallback. Used by the driver's "Navigate" action on a live trip.
 */
export async function openDirections(lat: number, lng: number, label?: string) {
  const dest = `${lat},${lng}`;
  const q = label ? encodeURIComponent(label) : dest;
  const primary = Platform.select({
    ios: `maps://?daddr=${dest}&q=${q}`,
    android: `google.navigation:q=${dest}`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${dest}`,
  })!;
  const fallback = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;

  try {
    const supported = await Linking.canOpenURL(primary);
    await Linking.openURL(supported ? primary : fallback);
  } catch {
    await Linking.openURL(fallback);
  }
}
