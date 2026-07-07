import { useRouter } from "expo-router";
import { Plus } from "phosphor-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Screen } from "@/components/shared/Screen";
import { useCreateChild } from "@/hooks/api/useChildren";
import { useFamilies } from "@/hooks/api/useFamilies";
import { useSchools } from "@/hooks/api/useSchools";
import { CHILD_COLOR_TAGS } from "@/lib/theme";

export default function AddChildren() {
  const router = useRouter();
  const families = useFamilies();
  const schools = useSchools();
  const createChild = useCreateChild();

  const familyId = families.data?.[0]?.id;
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [colorTag, setColorTag] = useState<string>(CHILD_COLOR_TAGS[0]);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [added, setAdded] = useState<{ name: string; color: string }[]>([]);

  async function addChild() {
    if (!familyId || name.trim().length === 0) return;
    await createChild.mutateAsync({
      family: familyId,
      full_name: name.trim(),
      grade: grade.trim() || null,
      color_tag: colorTag,
      school: schoolId,
    });
    setAdded((prev) => [...prev, { name: name.trim(), color: colorTag }]);
    setName("");
    setGrade("");
    const next = CHILD_COLOR_TAGS[added.length + 1] ?? CHILD_COLOR_TAGS[0];
    setColorTag(next);
  }

  return (
    <Screen>
      <ScrollView
        contentContainerClassName="gap-6 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-2 pt-4">
          <Text variant="caption">Step 2 of 2</Text>
          <Text variant="display">Add your children</Text>
          <Text variant="body" className="text-muted-foreground">
            Add each child you coordinate pickups for.
          </Text>
        </View>

        {added.length > 0 ? (
          <View className="gap-2">
            {added.map((c, i) => (
              <Card key={i}>
                <View className="flex-row items-center gap-3">
                  <Avatar name={c.name} size={40} ringColor={c.color} />
                  <Text variant="title">{c.name}</Text>
                </View>
              </Card>
            ))}
          </View>
        ) : null}

        <View className="gap-4">
          <Input
            label="Child’s name"
            value={name}
            onChangeText={setName}
            placeholder="Ada"
          />
          <Input
            label="Grade (optional)"
            value={grade}
            onChangeText={setGrade}
            placeholder="3"
          />

          <View className="gap-2">
            <Text variant="label" className="text-muted-foreground">
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

          {schools.data && schools.data.length > 0 ? (
            <View className="gap-2">
              <Text variant="label" className="text-muted-foreground">
                School (optional)
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {schools.data.map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() =>
                      setSchoolId((prev) => (prev === s.id ? null : s.id))
                    }
                    className={
                      schoolId === s.id
                        ? "rounded-full bg-primary px-3 py-1.5"
                        : "rounded-full bg-card-secondary px-3 py-1.5"
                    }
                  >
                    <Text
                      variant="label"
                      className={
                        schoolId === s.id
                          ? "text-primary-foreground"
                          : "text-foreground"
                      }
                    >
                      {s.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <Button
            label="Add child"
            variant="secondary"
            icon={<Plus size={16} weight="bold" />}
            loading={createChild.isPending}
            disabled={name.trim().length === 0}
            onPress={addChild}
          />
        </View>

        <Button
          label={added.length > 0 ? "Done" : "Skip for now"}
          onPress={() => router.replace("/(tabs)")}
        />
      </ScrollView>
    </Screen>
  );
}
