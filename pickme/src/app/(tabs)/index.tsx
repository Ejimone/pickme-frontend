import { useRouter } from "expo-router";
import { Bell, House } from "phosphor-react-native";
import { useCallback, useMemo } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Screen } from "@/components/shared/Screen";
import { PickupRow } from "@/components/today/PickupRow";
import { useChildren } from "@/hooks/api/useChildren";
import { usePickupEvents } from "@/hooks/api/usePickupEvents";
import { useSchools } from "@/hooks/api/useSchools";
import { useTheme } from "@/hooks/useTheme";
import { PICKUP_METHOD_LABEL } from "@/lib/status";

export default function Today() {
  const router = useRouter();
  const { colors } = useTheme();
  const events = usePickupEvents();
  const children = useChildren();
  const schools = useSchools();

  const childMeta = useMemo(() => {
    const map = new Map<
      string,
      { color?: string | null; photo?: string | null; school?: string | null }
    >();
    for (const c of children.data ?? []) {
      map.set(c.id, {
        color: c.color_tag,
        photo: c.photo_url,
        school: schools.data?.find((s) => s.id === c.school)?.name ?? null,
      });
    }
    return map;
  }, [children.data, schools.data]);

  const onRefresh = useCallback(() => {
    events.refetch();
    children.refetch();
  }, [events, children]);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const data = events.data ?? [];
  const liveEvent = data.find(
    (e) => (e.status === "en_route" || e.status === "arrived") && e.trip_stop_child,
  );

  const header = (
    <View className="flex-row items-start justify-between px-5 pb-4 pt-1">
      <View>
        <Text className="text-[30px] font-bold text-foreground">Today</Text>
        <Text variant="caption" className="mt-1 text-[14px]">
          {today}
        </Text>
      </View>
      <Pressable
        onPress={() => router.push("/(tabs)/settings")}
        hitSlop={10}
        accessibilityLabel="Notifications"
        className="pt-1"
      >
        <Bell size={24} color={colors.foreground} />
      </Pressable>
    </View>
  );

  if (events.isLoading) {
    return (
      <Screen padded={false}>
        {header}
        <View className="gap-3 px-5 pt-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </View>
      </Screen>
    );
  }

  if (events.isError) {
    return (
      <Screen padded={false}>
        {header}
        <View className="px-5">
          <ErrorState error={events.error} onRetry={() => events.refetch()} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      {header}
      <ScrollView
        contentContainerClassName="px-5 pb-8"
        refreshControl={
          <RefreshControl
            refreshing={events.isFetching && !events.isLoading}
            onRefresh={onRefresh}
            tintColor={colors.mutedForeground}
          />
        }
      >
        {liveEvent ? (
          <Pressable
            onPress={() => router.push(`/trip/${liveEvent.trip_stop_child}`)}
            style={({ pressed }) => (pressed ? { opacity: 0.9 } : undefined)}
            className="mb-6 flex-row items-center gap-3 rounded-[10px] bg-black px-4 py-4"
          >
            <Avatar name={liveEvent.child_name} size={40} />
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-white">
                {liveEvent.child_name}'s pickup is en route
              </Text>
              <Text className="mt-0.5 text-[12px] text-[#afafaf]">
                Tap to follow the live trip
              </Text>
            </View>
            <Text className="text-[26px] font-bold text-white">›</Text>
          </Pressable>
        ) : null}

        {data.length === 0 ? (
          <EmptyState
            Icon={House}
            title="Nothing scheduled today"
            message="Pickups for your children will show up here each day."
          />
        ) : (
          <>
            <Text className="mb-1 text-[18px] font-bold text-foreground">Pickups</Text>
            <View>
              {data.map((event, i) => {
                const meta = childMeta.get(event.child);
                const hasLiveTrip = event.trip_stop_child !== null;
                const subtitle = meta?.school
                  ? `${meta.school} · ${PICKUP_METHOD_LABEL[event.pickup_method]}`
                  : PICKUP_METHOD_LABEL[event.pickup_method];
                return (
                  <View
                    key={event.id}
                    className={i > 0 ? "border-t border-border" : undefined}
                  >
                    <PickupRow
                      event={event}
                      subtitle={subtitle}
                      colorTag={meta?.color}
                      photoUrl={meta?.photo}
                      onPress={
                        hasLiveTrip
                          ? () => router.push(`/trip/${event.trip_stop_child}`)
                          : undefined
                      }
                    />
                  </View>
                );
              })}
            </View>
          </>
        )}

        <View className="mt-8 gap-3">
          <Button label="I'm driving today" onPress={() => router.push("/(tabs)/carpool")} />
          <Button
            label="View week's rotation"
            variant="secondary"
            onPress={() => router.push("/(tabs)/carpool")}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
