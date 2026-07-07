import { useRouter } from "expo-router";
import { House } from "phosphor-react-native";
import { useCallback, useMemo } from "react";
import { FlatList, RefreshControl, View } from "react-native";

import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Screen } from "@/components/shared/Screen";
import { ChildPickupCard } from "@/components/today/ChildPickupCard";
import { DismissalCountdown } from "@/components/today/DismissalCountdown";
import { useChildren } from "@/hooks/api/useChildren";
import { usePickupEvents } from "@/hooks/api/usePickupEvents";
import { useTheme } from "@/hooks/useTheme";

export default function Today() {
  const router = useRouter();
  const { colors } = useTheme();
  const events = usePickupEvents();
  const children = useChildren();

  // color_tag / photo per child, keyed by child id, for the card ring.
  const childMeta = useMemo(() => {
    const map = new Map<string, { color?: string | null; photo?: string | null }>();
    for (const c of children.data ?? []) {
      map.set(c.id, { color: c.color_tag, photo: c.photo_url });
    }
    return map;
  }, [children.data]);

  const onRefresh = useCallback(() => {
    events.refetch();
    children.refetch();
  }, [events, children]);

  if (events.isLoading) {
    return (
      <Screen title="Today">
        <View className="gap-3 pt-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </View>
      </Screen>
    );
  }

  if (events.isError) {
    return (
      <Screen title="Today">
        <ErrorState error={events.error} onRetry={() => events.refetch()} />
      </Screen>
    );
  }

  const data = events.data ?? [];

  return (
    <Screen title="Today" padded={false}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-5 gap-3 pb-6"
        ListHeaderComponent={
          data.length > 0 ? <DismissalCountdown events={data} /> : null
        }
        ListEmptyComponent={
          <EmptyState
            Icon={House}
            title="Nothing scheduled today"
            message="Pickups for your children will show up here each day."
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={events.isFetching && !events.isLoading}
            onRefresh={onRefresh}
            tintColor={colors.mutedForeground}
          />
        }
        renderItem={({ item }) => {
          const meta = childMeta.get(item.child);
          const hasLiveTrip = item.trip_stop_child !== null;
          return (
            <ChildPickupCard
              event={item}
              colorTag={meta?.color}
              photoUrl={meta?.photo}
              onPress={
                hasLiveTrip
                  ? () => router.push(`/trip/${item.trip_stop_child}`)
                  : undefined
              }
            />
          );
        }}
      />
    </Screen>
  );
}
