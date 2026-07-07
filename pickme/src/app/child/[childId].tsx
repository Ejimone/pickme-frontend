import { useLocalSearchParams, useRouter } from "expo-router";
import { CaretRight } from "phosphor-react-native";
import { useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/chip";
import { Text } from "@/components/ui/text";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Screen } from "@/components/shared/Screen";
import { useActivities } from "@/hooks/api/useActivities";
import { useChild } from "@/hooks/api/useChildren";
import { useSchools } from "@/hooks/api/useSchools";
import { useTheme } from "@/hooks/useTheme";
import type { PickupMethod } from "@/lib/api-types";
import { PICKUP_METHOD_LABEL } from "@/lib/status";

const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const METHODS: PickupMethod[] = ["parent", "carpool", "aftercare", "bus", "walker"];

function formatTime(t: string | null): string {
  if (!t) return "";
  const [h, m = "00"] = t.split(":");
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${m.padStart(2, "0")} ${ampm}`;
}

export default function ChildDetail() {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const { colors } = useTheme();
  const child = useChild(childId ?? "");
  const activities = useActivities(childId);
  const schools = useSchools();
  const [method, setMethod] = useState<PickupMethod>("parent");

  if (child.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  const schoolName = schools.data?.find((s) => s.id === child.data?.school)?.name;

  return (
    <Screen padded={false}>
      <ScrollView contentContainerClassName="px-5 pb-10" keyboardShouldPersistTaps="handled">
        <AuthHeader />

        <View className="flex-row items-center gap-3 pt-2">
          <Avatar
            uri={child.data?.photo_url}
            name={child.data?.full_name}
            size={64}
            ringColor={child.data?.color_tag}
          />
          <View className="flex-1">
            <Text className="text-[24px] font-bold text-foreground">
              {child.data?.full_name}
            </Text>
            <Text variant="caption" className="mt-0.5 text-[13px]">
              {[schoolName, child.data?.grade ? `Grade ${child.data.grade}` : null]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </View>
        </View>

        <View className="my-6 h-px bg-border" />

        <SectionHeader title="Default pickup" />
        <View className="mt-3 flex-row flex-wrap gap-3">
          {METHODS.map((m) => (
            <Chip
              key={m}
              label={PICKUP_METHOD_LABEL[m]}
              selected={method === m}
              onPress={() => setMethod(m)}
              className="w-[30%]"
            />
          ))}
        </View>

        <View className="my-6 h-px bg-border" />

        <SectionHeader title="Activities" />
        <View className="mt-3 gap-3">
          {(activities.data ?? []).map((a) => (
            <View
              key={a.id}
              className="flex-row items-center gap-3 rounded-[10px] bg-card-secondary px-4 py-3"
            >
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-foreground">{a.name}</Text>
                <Text variant="caption" className="mt-0.5 text-[11px]">
                  {[
                    DAY_SHORT[a.day_of_week],
                    `${formatTime(a.start_time)}${a.end_time ? `–${formatTime(a.end_time)}` : ""}`,
                    a.location_name,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </View>
              <CaretRight size={16} color={colors.mutedForeground} />
            </View>
          ))}
          {(activities.data?.length ?? 0) === 0 ? (
            <Text variant="caption">No activities yet.</Text>
          ) : null}
        </View>

        {child.data?.notes ? (
          <>
            <View className="my-6 h-px bg-border" />
            <SectionHeader title="Notes" />
            <View className="mt-3 rounded-[10px] bg-card-secondary px-4 py-4">
              <Text className="text-[13px] text-foreground">{child.data.notes}</Text>
            </View>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
