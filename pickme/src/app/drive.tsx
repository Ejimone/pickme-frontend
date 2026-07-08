import { useRouter } from "expo-router";
import { CheckCircle, NavigationArrow, UsersThree } from "phosphor-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { SchoolPicker } from "@/components/carpool/SchoolPicker";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { EmptyState } from "@/components/shared/EmptyState";
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
 * "Start a journey" — choose the children you're collecting, then create a trip
 * whose stops are their schools. Children without a school on file are grouped
 * into a destination you pick, so a journey can always be started. Creating the
 * trip lands you on the live map to start broadcasting GPS.
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
  const [destSchoolId, setDestSchoolId] = useState<UUID | null>(null);
  const [error, setError] = useState<string>();

  const myOpenTrips = (trips.data ?? []).filter(
    (t) => t.driver === me.data?.id && t.status !== "completed",
  );

  const allChildren = children.data ?? [];
  const selectedChildren = allChildren.filter((c) => selected.has(c.id));
  const selectedWithoutSchool = selectedChildren.filter((c) => !c.school);

  const toggle = (id: UUID) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const schoolName = (id: string | null) =>
    schools.data?.find((s) => s.id === id)?.name;

  // Build the trip's stops: one per school. Children without a school on file
  // are attached to the chosen destination stop.
  const stops = useMemo(() => {
    const bySchool = new Map<string, UUID[]>();
    for (const c of selectedChildren) {
      if (c.school) bySchool.set(c.school, [...(bySchool.get(c.school) ?? []), c.id]);
    }
    if (selectedWithoutSchool.length > 0 && destSchoolId) {
      bySchool.set(destSchoolId, [
        ...(bySchool.get(destSchoolId) ?? []),
        ...selectedWithoutSchool.map((c) => c.id),
      ]);
    }
    return [...bySchool.entries()].map(([school, kids], i) => ({
      school,
      sequence_order: i + 1,
      children: kids,
    }));
  }, [selectedChildren, selectedWithoutSchool, destSchoolId]);

  async function onStart() {
    setError(undefined);
    if (stops.length === 0) return;
    try {
      const trip = await createTrip.mutateAsync({
        carpool_group: null,
        date: todayISO(),
        tracking_mode: "live_gps",
        stops,
      });
      // Pass driver=1 so the creator gets driver controls even if the backend's
      // /me/ lookup is unavailable (the API enforces driver-only actions anyway).
      router.replace(`/trip/${trip.id}?driver=1`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start the drive.");
    }
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerClassName="px-5 pb-10" keyboardShouldPersistTaps="handled">
        <AuthHeader />

        <Text className="mt-4 text-[28px] font-bold text-foreground">Start a journey</Text>
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
                onPress={() => router.push(`/trip/${t.id}?driver=1`)}
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
          {children.isLoading ? null : allChildren.length === 0 ? (
            <View className="pt-2">
              <EmptyState
                Icon={UsersThree}
                title="No children yet"
                message="Add a child first, then you can start a journey to pick them up."
              />
              <Button
                label="Add a child"
                variant="secondary"
                onPress={() => router.push("/(onboarding)/add-children")}
              />
            </View>
          ) : (
            <View className="overflow-hidden rounded-[10px] bg-card-secondary">
              {allChildren.map((c, i) => {
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
                      <Text variant="caption">
                        {schoolName(c.school) ?? "No school set"}
                      </Text>
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

        {/* Destination for selected children with no school on file. */}
        {selectedWithoutSchool.length > 0 ? (
          <View className="mt-6 gap-2">
            <SectionHeader title="Where are you headed?" />
            <Text variant="caption" className="-mt-1">
              {selectedWithoutSchool.map((c) => c.full_name.split(" ")[0]).join(", ")}{" "}
              {selectedWithoutSchool.length === 1 ? "has" : "have"} no school set — pick
              a destination stop for them.
            </Text>
            <SchoolPicker
              value={destSchoolId}
              onChange={setDestSchoolId}
              onAddNew={() => router.push("/(onboarding)/add-school")}
            />
          </View>
        ) : null}

        {selectedChildren.length > 0 && stops.length === 0 ? (
          <InfoBanner
            tone="warning"
            className="mt-4"
            message="Pick a destination above so we can create a stop for the selected children."
          />
        ) : null}

        {error ? (
          <Text variant="caption" className="mt-4 text-destructive">
            {error}
          </Text>
        ) : null}

        <View className="mt-8">
          <Button
            label={
              stops.length > 0
                ? `Start drive · ${stops.length} stop${stops.length === 1 ? "" : "s"}`
                : "Start drive"
            }
            loading={createTrip.isPending}
            disabled={stops.length === 0}
            onPress={onStart}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
