import { useRouter } from "expo-router";
import { CheckCircle, NavigationArrow } from "phosphor-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { InfoBanner } from "@/components/shared/InfoBanner";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Screen } from "@/components/shared/Screen";
import { useChildren } from "@/hooks/api/useChildren";
import { useMe } from "@/hooks/api/useMe";
import { useSchools } from "@/hooks/api/useSchools";
import { useCreateTrip, useTrips } from "@/hooks/api/useTrips";
import { useTheme } from "@/hooks/useTheme";
import { ApiError } from "@/lib/api-client";
import { todayISO } from "@/lib/date";
import type { UUID } from "@/lib/api-types";

/**
 * "I'm driving" entry. Resume an open trip you're driving today, or build a new
 * one by choosing the children you're picking up — their schools become the
 * stops. Creating a trip lands you on the live map to start + broadcast GPS.
 */
export default function DriveScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const me = useMe();
  const trips = useTrips({ date: todayISO() });
  const children = useChildren();
  const schools = useSchools();
  const createTrip = useCreateTrip();

  const [selected, setSelected] = useState<Set<UUID>>(new Set());
  const [error, setError] = useState<string>();

  const myOpenTrips = (trips.data ?? []).filter(
    (t) => t.driver === me.data?.id && t.status !== "completed",
  );

  // Only children with a school can form a stop.
  const eligible = (children.data ?? []).filter((c) => c.school);

  const toggle = (id: UUID) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const schoolName = (id: string | null) =>
    schools.data?.find((s) => s.id === id)?.name ?? "School";

  async function onStart() {
    setError(undefined);
    // Group selected children by school → one stop per school.
    const bySchool = new Map<string, UUID[]>();
    for (const c of eligible) {
      if (selected.has(c.id) && c.school) {
        bySchool.set(c.school, [...(bySchool.get(c.school) ?? []), c.id]);
      }
    }
    const stops = [...bySchool.entries()].map(([school, kids], i) => ({
      school,
      sequence_order: i + 1,
      children: kids,
    }));
    if (stops.length === 0) return;

    try {
      const trip = await createTrip.mutateAsync({
        carpool_group: null,
        date: todayISO(),
        tracking_mode: "live_gps",
        stops,
      });
      router.replace(`/trip/${trip.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start the drive.");
    }
  }

  const stopCount = useMemo(() => {
    const s = new Set<string>();
    eligible.forEach((c) => selected.has(c.id) && c.school && s.add(c.school));
    return s.size;
  }, [eligible, selected]);

  return (
    <Screen padded={false}>
      <ScrollView contentContainerClassName="px-5 pb-10" keyboardShouldPersistTaps="handled">
        <AuthHeader />

        <Text className="mt-4 text-[28px] font-bold text-foreground">Start driving</Text>
        <Text variant="body" className="mt-3 text-muted-foreground">
          Pick who you're collecting — each school becomes a stop. Once you start,
          other guardians can follow your location live.
        </Text>

        {myOpenTrips.length > 0 ? (
          <View className="mt-6 gap-2">
            <SectionHeader title="Today's trip" />
            {myOpenTrips.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => router.push(`/trip/${t.id}`)}
                className="flex-row items-center gap-3 rounded-[10px] bg-card-secondary px-4 py-4"
              >
                <NavigationArrow size={22} color={colors.accent} weight="fill" />
                <View className="flex-1">
                  <Text className="text-[15px] font-bold text-foreground">
                    {t.stops.length} stop{t.stops.length === 1 ? "" : "s"}
                  </Text>
                  <Text variant="caption">Resume your drive</Text>
                </View>
                <StatusBadge status={t.status} />
              </Pressable>
            ))}
          </View>
        ) : null}

        <View className="mt-6 gap-2">
          <SectionHeader title="Who are you picking up?" />
          {eligible.length === 0 ? (
            <InfoBanner
              tone="warning"
              message="Add a child with a school first — that's what the trip's stops are built from."
            />
          ) : (
            <View className="overflow-hidden rounded-[10px] bg-card-secondary">
              {eligible.map((c, i) => {
                const on = selected.has(c.id);
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => toggle(c.id)}
                    className={`flex-row items-center gap-3 px-4 py-3 ${
                      i > 0 ? "border-t border-border" : ""
                    }`}
                  >
                    <Avatar name={c.full_name} size={40} ringColor={c.color_tag} />
                    <View className="flex-1">
                      <Text className="text-[15px] font-bold text-foreground">
                        {c.full_name}
                      </Text>
                      <Text variant="caption">{schoolName(c.school)}</Text>
                    </View>
                    {on ? (
                      <CheckCircle size={24} color={colors.accent} weight="fill" />
                    ) : (
                      <View
                        style={{ borderColor: colors.mutedForeground }}
                        className="h-6 w-6 rounded-full border-2"
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {error ? (
          <Text variant="caption" className="mt-4 text-destructive">
            {error}
          </Text>
        ) : null}

        <View className="mt-8">
          <Button
            label={
              stopCount > 0
                ? `Start drive · ${stopCount} stop${stopCount === 1 ? "" : "s"}`
                : "Start drive"
            }
            loading={createTrip.isPending}
            disabled={stopCount === 0}
            onPress={onStart}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
