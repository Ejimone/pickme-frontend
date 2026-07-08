import { useLocalSearchParams, useRouter } from "expo-router";
import { CaretLeft, ChatCircle, NavigationArrow } from "phosphor-react-native";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { IconButton } from "@/components/ui/icon-button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SOSBanner } from "@/components/trip/SOSBanner";
import { LeafletMap, TripMapWaiting, type MapStop } from "@/components/trip/LeafletMap";
import { useMe } from "@/hooks/api/useMe";
import { useSchools } from "@/hooks/api/useSchools";
import { useRaiseSOS, useResolveSOS, useSOSAlerts } from "@/hooks/api/useSOS";
import {
  useEndTrip,
  useStartTrip,
  useTrip,
  useTripLatestLocation,
  useUpdateStop,
} from "@/hooks/api/useTrips";
import { useDriverBroadcast } from "@/hooks/useDriverBroadcast";
import { useMyLocation } from "@/hooks/useMyLocation";
import { useTripTracking } from "@/hooks/useTripTracking";
import { useTheme } from "@/hooks/useTheme";
import { formatCountdown } from "@/lib/date";
import { distanceMeters, etaMinutes } from "@/lib/geo";
import { openDirections } from "@/lib/maps";

export default function TripScreen() {
  const { tripId, driver: driverParam } = useLocalSearchParams<{
    tripId: string;
    driver?: string;
  }>();
  const router = useRouter();
  const { colors } = useTheme();

  const trip = useTrip(tripId);
  const me = useMe();
  const schools = useSchools();
  const latest = useTripLatestLocation(tripId);
  const tracking = useTripTracking(tripId);
  const activeSos = useSOSAlerts({ status: "active" });

  // The creator arrives with ?driver=1 so they get driver controls even before
  // /me/ resolves (or if it isn't available); the API still enforces driver-only
  // actions server-side.
  const isDriver =
    driverParam === "1" || (!!me.data && me.data.id === trip.data?.driver);
  const inProgress = trip.data?.status === "in_progress";

  const { permission } = useDriverBroadcast({
    active: isDriver && inProgress,
    send: tracking.send,
  });

  const startTrip = useStartTrip(tripId ?? "");
  const endTrip = useEndTrip(tripId ?? "");
  const updateStop = useUpdateStop(tripId ?? "");
  const raiseSos = useRaiseSOS();
  const resolveSos = useResolveSOS();

  const driver = useMemo(() => {
    if (!latest.data) return null;
    const lat = parseFloat(latest.data.lat);
    const lng = parseFloat(latest.data.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng, heading: latest.data.heading };
  }, [latest.data]);

  const schoolCoords = useMemo(() => {
    const map = new Map<string, { lat: number; lng: number }>();
    for (const s of schools.data ?? []) {
      if (s.lat && s.lng) map.set(s.id, { lat: parseFloat(s.lat), lng: parseFloat(s.lng) });
    }
    return map;
  }, [schools.data]);

  const stops = trip.data?.stops ?? [];
  const mapStops: MapStop[] = useMemo(
    () =>
      stops
        .map((stop): MapStop | null => {
          const coords = stop.school ? schoolCoords.get(stop.school) : undefined;
          if (!coords) return null;
          return {
            id: stop.id,
            lat: coords.lat,
            lng: coords.lng,
            label: schools.data?.find((s) => s.id === stop.school)?.name ?? "Stop",
            done: stop.status === "picked_up" || stop.status === "arrived",
          };
        })
        .filter((m): m is MapStop => m !== null),
    [stops, schoolCoords, schools.data],
  );

  // Watchers (not the driver) see their own "you are here" dot on the map.
  const viewerLocation = useMyLocation(!isDriver);

  const currentStop = stops.find(
    (s) => s.status !== "picked_up" && s.status !== "skipped",
  );
  const currentStopCoords = currentStop?.school
    ? schoolCoords.get(currentStop.school)
    : undefined;

  // Live ETA to the next stop: prefer the backend's computed eta, else estimate
  // from the driver's distance to the stop and current speed.
  const etaText = useMemo(() => {
    if (!inProgress || !currentStop) return null;
    if (currentStop.eta) return formatCountdown(currentStop.eta);
    if (driver && currentStopCoords) {
      const meters = distanceMeters(driver, currentStopCoords);
      return `~${etaMinutes(meters, latest.data?.speed)} min`;
    }
    return null;
  }, [inProgress, currentStop, driver, currentStopCoords, latest.data?.speed]);

  function navigateToCurrentStop() {
    if (currentStopCoords) {
      openDirections(
        currentStopCoords.lat,
        currentStopCoords.lng,
        currentStop?.school ? stopLabel(currentStop.school) : undefined,
      );
    }
  }

  const sos = tracking.sos ?? activeSos.data?.[0] ?? null;

  function onRaiseSos() {
    if (!tripId) return;
    raiseSos.mutate({
      trip: tripId,
      lat: driver?.lat,
      lng: driver?.lng,
      message: "SOS raised from the app",
    });
  }

  if (trip.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  const stopLabel = (schoolId: string | null) =>
    schools.data?.find((s) => s.id === schoolId)?.name ?? "Activity stop";

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1">
        {driver ? (
          <LeafletMap
            driver={driver}
            viewer={!isDriver ? viewerLocation : null}
            stops={mapStops}
          />
        ) : (
          <TripMapWaiting />
        )}
        <SafeAreaView
          edges={["top", "left", "right"]}
          className="absolute left-0 right-0 top-0"
        >
          <View className="flex-row items-center justify-between px-4 pt-2">
            <IconButton variant="surface" onPress={() => router.back()} accessibilityLabel="Back">
              <CaretLeft size={22} color={colors.foreground} weight="bold" />
            </IconButton>
            <View
              className={`rounded-full px-3 py-1.5 ${tracking.connected ? "bg-success/15" : "bg-card-secondary"}`}
            >
              <Text
                className={`text-[12px] font-bold ${tracking.connected ? "text-success" : "text-muted-foreground"}`}
              >
                {tracking.connected ? "Live" : "Connecting…"}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Bottom sheet */}
      <View
        className="rounded-t-[18px] bg-card px-5 pt-3"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.14,
          shadowRadius: 14,
          elevation: 12,
        }}
      >
        <View className="mb-4 h-1 w-11 self-center rounded-full bg-border" />
        <SafeAreaView edges={["bottom"]}>
          <View className="flex-row items-center gap-3 pb-3">
            <Avatar name={trip.data?.driver_name} size={48} />
            <View className="flex-1">
              <Text className="text-[17px] font-bold text-foreground">
                {trip.data?.driver_name ?? "Driver"}
              </Text>
              <Text variant="caption">
                {trip.data?.tracking_mode === "live_gps" ? "Live GPS trip" : "Status-only trip"}
              </Text>
            </View>
            <View className="items-end gap-1">
              {etaText ? (
                <View className="rounded-full bg-accent/15 px-2.5 py-1">
                  <Text className="text-[12px] font-bold text-accent">ETA {etaText}</Text>
                </View>
              ) : null}
              <StatusBadge status={trip.data?.status ?? "not_started"} />
            </View>
          </View>

          <View className="border-t border-border pt-3">
            <ScrollView className="max-h-52" showsVerticalScrollIndicator={false}>
              {stops.map((stop) => (
                <View key={stop.id} className="flex-row items-center gap-3 py-2.5">
                  <View
                    style={{
                      backgroundColor:
                        stop.status === "picked_up"
                          ? colors.success
                          : stop.status === "en_route" || stop.status === "arrived"
                            ? colors.accent
                            : colors.border,
                    }}
                    className="h-3 w-3 rounded-full"
                  />
                  <View className="flex-1">
                    <Text className="text-[15px] font-bold text-foreground">
                      {stopLabel(stop.school)}
                      {stop.id === currentStop?.id && etaText ? (
                        <Text className="text-[13px] font-bold text-accent">
                          {"  · ETA "}
                          {etaText}
                        </Text>
                      ) : null}
                    </Text>
                    <Text variant="caption">
                      {stop.children.map((c) => c.child_name).join(", ") || "No children"}
                    </Text>
                  </View>
                  <StatusBadge status={stop.status} showIcon={false} />
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Actions */}
          <View className="gap-3 pt-3">
            {isDriver && inProgress && permission === "denied" ? (
              <View className="rounded-[10px] bg-warning/20 px-4 py-3">
                <Text className="text-[13px] font-bold text-foreground">
                  Location access is off
                </Text>
                <Text variant="caption" className="mt-0.5 text-foreground/70">
                  Turn on location for PickMe so guardians can follow your drive.
                </Text>
              </View>
            ) : null}

            {isDriver ? (
              <>
                {inProgress && currentStopCoords ? (
                  <Pressable
                    onPress={navigateToCurrentStop}
                    className="h-[54px] flex-row items-center justify-center gap-2 rounded-[10px] bg-accent"
                  >
                    <NavigationArrow size={18} color="#FFFFFF" weight="fill" />
                    <Text className="text-[15px] font-bold text-white">
                      Navigate to next stop
                    </Text>
                  </Pressable>
                ) : null}
                <DriverActions
                  status={trip.data?.status}
                  currentStopStatus={currentStop?.status}
                  onStart={() => startTrip.mutate()}
                  onEnd={() => endTrip.mutate()}
                  onArrive={() =>
                    currentStop && updateStop.mutate({ stopId: currentStop.id, status: "arrived" })
                  }
                  onPickup={() =>
                    currentStop && updateStop.mutate({ stopId: currentStop.id, status: "picked_up" })
                  }
                  busy={startTrip.isPending || endTrip.isPending || updateStop.isPending}
                />
              </>
            ) : null}

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => router.push("/(tabs)/chat")}
                className="h-[54px] flex-1 flex-row items-center justify-center gap-2 rounded-[10px] bg-card-secondary"
              >
                <ChatCircle size={18} color={colors.foreground} weight="fill" />
                <Text className="text-[14px] font-bold text-foreground">Message driver</Text>
              </Pressable>
              <Pressable
                onPress={onRaiseSos}
                disabled={raiseSos.isPending}
                className="h-[54px] w-[86px] items-center justify-center rounded-[10px] bg-destructive"
              >
                <Text className="text-[15px] font-bold text-white">SOS</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {sos ? (
        <SOSBanner
          alert={sos}
          raisedByName={sos.raised_by === trip.data?.driver ? trip.data?.driver_name : undefined}
          resolving={resolveSos.isPending}
          onResolve={() => resolveSos.mutate(sos.id, { onSuccess: tracking.dismissSos })}
          onDismiss={tracking.dismissSos}
        />
      ) : null}
    </View>
  );
}

function DriverActions({
  status,
  currentStopStatus,
  onStart,
  onEnd,
  onArrive,
  onPickup,
  busy,
}: {
  status?: string;
  currentStopStatus?: string;
  onStart: () => void;
  onEnd: () => void;
  onArrive: () => void;
  onPickup: () => void;
  busy?: boolean;
}) {
  if (status === "not_started") {
    return <PrimaryAction label="Start trip" onPress={onStart} busy={busy} />;
  }
  if (status === "in_progress") {
    if (currentStopStatus === "arrived") {
      return (
        <View className="gap-3">
          <PrimaryAction label="Mark picked up" onPress={onPickup} busy={busy} />
          <SecondaryAction label="End trip" onPress={onEnd} />
        </View>
      );
    }
    return (
      <View className="gap-3">
        <PrimaryAction label="Mark arrived at next stop" onPress={onArrive} busy={busy} />
        <SecondaryAction label="End trip" onPress={onEnd} />
      </View>
    );
  }
  return null;
}

function PrimaryAction({ label, onPress, busy }: { label: string; onPress: () => void; busy?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      className="h-[54px] items-center justify-center rounded-[10px] bg-primary"
      style={busy ? { opacity: 0.6 } : undefined}
    >
      <Text className="text-[15px] font-bold text-primary-foreground">{label}</Text>
    </Pressable>
  );
}

function SecondaryAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="h-[54px] items-center justify-center rounded-[10px] bg-card-secondary"
    >
      <Text className="text-[15px] font-bold text-foreground">{label}</Text>
    </Pressable>
  );
}
