import { useState } from "react";
import { Pressable, View } from "react-native";

import { Field } from "@/components/ui/field";
import { Text } from "@/components/ui/text";
import { useSchools } from "@/hooks/api/useSchools";
import type { UUID } from "@/lib/api-types";

/**
 * Searchable school selector shared by carpool-create and onboarding. Lists
 * matching schools and an "add a new school" escape hatch.
 */
export function SchoolPicker({
  value,
  onChange,
  onAddNew,
}: {
  value: UUID | null;
  onChange: (id: UUID | null) => void;
  onAddNew?: () => void;
}) {
  const [search, setSearch] = useState("");
  const schools = useSchools(search.trim() || undefined);

  return (
    <View className="gap-2">
      <Field
        label="School"
        value={search}
        onChangeText={setSearch}
        placeholder="Search schools…"
        autoCapitalize="words"
      />
      <View className="overflow-hidden rounded-[10px] border border-border">
        {(schools.data ?? []).map((s, i) => {
          const selected = value === s.id;
          return (
            <Pressable
              key={s.id}
              onPress={() => onChange(selected ? null : s.id)}
              className={`px-4 py-3 ${i > 0 ? "border-t border-border" : ""} ${
                selected ? "bg-accent/10" : "bg-card"
              }`}
            >
              <Text className="text-[14px] font-bold text-foreground">{s.name}</Text>
              {s.address ? <Text variant="caption">{s.address}</Text> : null}
            </Pressable>
          );
        })}
        {onAddNew ? (
          <Pressable
            onPress={onAddNew}
            className={`px-4 py-3 ${(schools.data?.length ?? 0) > 0 ? "border-t border-border" : ""}`}
          >
            <Text className="text-[13px] font-bold text-accent">+ Add a new school</Text>
          </Pressable>
        ) : null}
        {(schools.data?.length ?? 0) === 0 && !onAddNew ? (
          <View className="px-4 py-3">
            <Text variant="caption">No schools found.</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
