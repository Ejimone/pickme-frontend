import { useRouter } from "expo-router";
import { Plus, X } from "phosphor-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Text } from "@/components/ui/text";
import { Screen } from "@/components/shared/Screen";
import { useChildren, useCreateChild, useDeleteChild } from "@/hooks/api/useChildren";
import { useFamilies } from "@/hooks/api/useFamilies";
import { useSchools } from "@/hooks/api/useSchools";
import { CHILD_COLOR_TAGS } from "@/lib/theme";

/**
 * Onboarding step 2 — add each child (name, grade, school, color tag). Added
 * children appear as chips; the primary CTA adds the current child and advances.
 */
export default function AddChildren() {
  const router = useRouter();
  const families = useFamilies();
  const schools = useSchools();
  const kids = useChildren();
  const createChild = useCreateChild();
  const deleteChild = useDeleteChild();

  const familyId = families.data?.[0]?.id;
  const added = kids.data ?? [];

  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [colorTag, setColorTag] = useState<string>(CHILD_COLOR_TAGS[0]);

  const schoolName = schools.data?.find((s) => s.id === schoolId)?.name;

  async function addChild(): Promise<boolean> {
    if (!familyId || name.trim().length === 0) return false;
    await createChild.mutateAsync({
      family: familyId,
      full_name: name.trim(),
      grade: grade.trim() || null,
      color_tag: colorTag,
      school: schoolId,
    });
    setName("");
    setGrade("");
    setSchoolId(null);
    setColorTag(CHILD_COLOR_TAGS[added.length + 1] ?? CHILD_COLOR_TAGS[0]);
    return true;
  }

  async function onPrimary() {
    if (name.trim().length > 0) {
      await addChild();
    }
    router.replace("/(onboarding)/schedule");
  }

  const firstName = name.trim().split(/\s+/)[0];
  const primaryLabel = name.trim().length > 0 ? `Add ${firstName} + continue` : "Continue";
  const canProceed = name.trim().length > 0 || added.length > 0;

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerClassName="px-5 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader step={2} />

        <Text className="mt-4 text-[28px] font-bold text-foreground">Add your kids</Text>

        {added.length > 0 ? (
          <View className="mt-6 gap-2">
            {added.map((c) => (
              <View
                key={c.id}
                className="flex-row items-center gap-3 rounded-[10px] bg-card-secondary px-3 py-3"
              >
                <Avatar name={c.full_name} size={42} ringColor={c.color_tag} />
                <View className="flex-1">
                  <Text className="text-[14px] font-bold text-foreground">
                    {c.full_name}
                    {c.grade ? ` · Grade ${c.grade}` : ""}
                  </Text>
                  <Text variant="caption">
                    {schools.data?.find((s) => s.id === c.school)?.name ?? "No school yet"}
                  </Text>
                </View>
                <Pressable
                  onPress={() => deleteChild.mutate(c.id)}
                  hitSlop={10}
                  accessibilityLabel={`Remove ${c.full_name}`}
                >
                  <X size={16} color="#afafaf" weight="bold" />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        <View className="mt-6 gap-6">
          <Field
            label="Child's name"
            value={name}
            onChangeText={setName}
            placeholder="Noah"
          />
          <Field
            label="Grade"
            value={grade}
            onChangeText={setGrade}
            placeholder="7"
          />

          <View className="gap-2">
            <Text className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
              School
            </Text>
            <View className="overflow-hidden rounded-[10px] border border-border">
              {(schools.data ?? []).map((s, i) => {
                const selected = schoolId === s.id;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => setSchoolId(selected ? null : s.id)}
                    className={`px-4 py-3 ${i > 0 ? "border-t border-border" : ""} ${
                      selected ? "bg-accent/10" : "bg-card"
                    }`}
                  >
                    <Text className="text-[14px] font-bold text-foreground">{s.name}</Text>
                    {s.address ? <Text variant="caption">{s.address}</Text> : null}
                  </Pressable>
                );
              })}
              <Pressable
                onPress={() => router.push("/(onboarding)/add-school")}
                className={`px-4 py-3 ${
                  (schools.data?.length ?? 0) > 0 ? "border-t border-border" : ""
                }`}
              >
                <Text className="text-[13px] font-bold text-accent">+ Add a new school</Text>
              </Pressable>
            </View>
            {schoolName ? (
              <Text variant="caption">Selected: {schoolName}</Text>
            ) : null}
          </View>

          <View className="gap-2">
            <Text className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
              Color tag
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {CHILD_COLOR_TAGS.map((c) => (
                <Pressable key={c} onPress={() => setColorTag(c)}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: c,
                      borderWidth: colorTag === c ? 3 : 0,
                    }}
                    className="border-foreground"
                  />
                </Pressable>
              ))}
            </View>
          </View>

          {name.trim().length > 0 && added.length >= 0 ? (
            <Pressable
              onPress={addChild}
              disabled={createChild.isPending}
              className="flex-row items-center gap-1.5 self-start"
            >
              <Plus size={15} color="#276ef1" weight="bold" />
              <Text className="text-[13px] font-bold text-accent">Save and add another</Text>
            </Pressable>
          ) : null}
        </View>

        <View className="mt-8">
          <Button
            label={primaryLabel}
            loading={createChild.isPending}
            disabled={!canProceed}
            onPress={onPrimary}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
