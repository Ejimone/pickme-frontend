import { useRouter } from "expo-router";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Screen } from "@/components/shared/Screen";
import { useChildren } from "@/hooks/api/useChildren";
import { useSchools } from "@/hooks/api/useSchools";
import { useTheme } from "@/hooks/useTheme";

/** "3:30 PM" from a wall-clock "HH:MM[:SS]" time string. */
function formatTime(t: string | null | undefined): string {
  if (!t) return "—";
  const [h, m = "00"] = t.split(":");
  let hour = parseInt(h, 10);
  if (Number.isNaN(hour)) return "—";
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${m.padStart(2, "0")} ${ampm}`;
}

/**
 * Onboarding step 3 — review the dismissal schedule pulled from each school the
 * user's children attend, then head into the app.
 */
export default function ScheduleReview() {
  const router = useRouter();
  const { colors } = useTheme();
  const children = useChildren();
  const schools = useSchools();

  const accents = [colors.accent, colors.success, colors.warning];

  // One card per school the children attend, with the kids grouped under it.
  const rows = useMemo(() => {
    const bySchool = new Map<string, string[]>();
    for (const c of children.data ?? []) {
      if (!c.school) continue;
      const names = bySchool.get(c.school) ?? [];
      names.push(c.full_name.split(/\s+/)[0]);
      bySchool.set(c.school, names);
    }
    return (schools.data ?? [])
      .filter((s) => bySchool.has(s.id))
      .map((s) => ({ school: s, kids: bySchool.get(s.id) ?? [] }));
  }, [children.data, schools.data]);

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerClassName="px-5 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader step={3} />

        <Text className="mt-4 text-[28px] font-bold text-foreground">
          Your week at a glance
        </Text>
        <Text variant="body" className="mt-3 text-muted-foreground">
          We pulled dismissal times from each school. Adjust anything that looks off.
        </Text>

        <View className="mt-6 gap-3">
          {rows.map(({ school, kids }, i) => (
            <View
              key={school.id}
              className="flex-row items-center overflow-hidden rounded-[10px] bg-card-secondary"
            >
              <View
                style={{ backgroundColor: accents[i % accents.length] }}
                className="h-full w-[5px] self-stretch"
              />
              <View className="flex-1 flex-row items-center justify-between px-4 py-4">
                <View className="flex-1 pr-3">
                  <Text className="text-[15px] font-bold text-foreground">{school.name}</Text>
                  <Text variant="caption" className="mt-1">
                    {kids.join(", ")}
                  </Text>
                </View>
                <Text className="text-[16px] font-bold text-foreground">
                  {formatTime(school.default_dismissal_time)}
                </Text>
              </View>
            </View>
          ))}

          {rows.length === 0 ? (
            <View className="rounded-[10px] bg-card-secondary px-4 py-5">
              <Text variant="body" className="text-muted-foreground">
                No school schedules yet. You can add schools to your children any time
                from the Family tab.
              </Text>
            </View>
          ) : null}
        </View>

        <View className="mt-4 rounded-[10px] bg-accent/10 px-4 py-4">
          <Text className="text-[14px] font-bold text-foreground">Join a carpool?</Text>
          <Text variant="caption" className="mt-1.5">
            Have an invite code from another family? Add it now or later from the Carpool tab.
          </Text>
        </View>

        <View className="mt-8">
          <Button label="Take me to Today" onPress={() => router.replace("/(tabs)")} />
        </View>
      </ScrollView>
    </Screen>
  );
}
