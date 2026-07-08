import { useRouter } from "expo-router";
import { NavigationArrow } from "phosphor-react-native";
import { Pressable, ScrollView, View } from "react-native";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { Avatar } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Screen } from "@/components/shared/Screen";
import { useMe } from "@/hooks/api/useMe";
import { useTrips } from "@/hooks/api/useTrips";
import { useTheme } from "@/hooks/useTheme";
import { formatCountdown } from "@/lib/date";
import type { Trip } from "@/lib/api-types";

/**
 * Follow a journey — the watcher entry point. Lists today's trips you're party
 * to (live first, then scheduled) so any guardian can open the live map and
 * monitor the driver's movement in real time.
 */
export default function JourneysScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const me = useMe();
  const trips = useTrips();

  const all = trips.data ?? [];
  const live = all.filter((t) => t.status === "in_progress");
  const scheduled = all.filter((t) => t.status === "not_started");

  function TripRow({ trip }: { trip: Trip }) {
    const isYou = trip.driver === me.data?.id;
    const isLive = trip.status === "in_progress";
    const nextStop = trip.stops.find(
      (s) => s.status !== "picked_up" && s.status !== "skipped",
    );
    const eta = isLive && nextStop?.eta ? formatCountdown(nextStop.eta) : null;
    return (
      <Pressable
        onPress={() => router.push(`/trip/${trip.id}`)}
        style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
        className="flex-row items-center gap-3 rounded-[10px] bg-card-secondary px-4 py-4"
      >
        {isLive ? (
          <View className="h-10 w-10 items-center justify-center rounded-full bg-accent/15">
            <NavigationArrow size={20} color={colors.accent} weight="fill" />
          </View>
        ) : (
          <Avatar name={trip.driver_name} size={40} />
        )}
        <View className="flex-1">
          <Text className="text-[15px] font-bold text-foreground">
            {isYou ? "You" : trip.driver_name} driving
          </Text>
          <Text variant="caption" className="mt-0.5">
            {trip.stops.length} stop{trip.stops.length === 1 ? "" : "s"}
            {eta ? ` · ETA ${eta}` : isLive ? " · live now" : ""}
          </Text>
        </View>
        <StatusBadge status={trip.status} />
      </Pressable>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerClassName="px-5 pb-10">
        <AuthHeader />

        <Text className="mt-2 text-[28px] font-bold text-foreground">Follow a journey</Text>
        <Text variant="body" className="mt-3 text-muted-foreground">
          Open any trip to watch the driver's location move in real time.
        </Text>

        {live.length > 0 ? (
          <View className="mt-6 gap-2">
            <SectionHeader title="Live now" />
            {live.map((t) => (
              <TripRow key={t.id} trip={t} />
            ))}
          </View>
        ) : null}

        {scheduled.length > 0 ? (
          <View className="mt-6 gap-2">
            <SectionHeader title="Scheduled today" />
            {scheduled.map((t) => (
              <TripRow key={t.id} trip={t} />
            ))}
          </View>
        ) : null}

        {all.length === 0 ? (
          <View className="pt-10">
            <EmptyState
              Icon={NavigationArrow}
              title="No journeys today"
              message="When a driver starts a pickup run, it'll appear here to follow live."
            />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
