import { UsersThree } from "phosphor-react-native";
import { ScrollView, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { EmptyState } from "@/components/shared/EmptyState";
import { Screen } from "@/components/shared/Screen";
import { useChildren } from "@/hooks/api/useChildren";
import { useFamilies } from "@/hooks/api/useFamilies";

export default function FamilyTab() {
  const families = useFamilies();
  const children = useChildren();
  const family = families.data?.[0];

  if (!families.isLoading && !family) {
    return (
      <Screen title="Family">
        <EmptyState
          Icon={UsersThree}
          title="No family yet"
          message="Full member management and invites arrive in the next build stage."
        />
      </Screen>
    );
  }

  return (
    <Screen title={family?.name ?? "Family"}>
      <ScrollView contentContainerClassName="gap-3 pt-2">
        <Text variant="label" className="text-muted-foreground">
          Children
        </Text>
        {(children.data ?? []).map((c) => (
          <Card key={c.id}>
            <View className="flex-row items-center gap-3">
              <Avatar
                uri={c.photo_url}
                name={c.full_name}
                ringColor={c.color_tag}
              />
              <View>
                <Text variant="title">{c.full_name}</Text>
                {c.grade ? (
                  <Text variant="caption">Grade {c.grade}</Text>
                ) : null}
              </View>
            </View>
          </Card>
        ))}
        {children.data && children.data.length === 0 ? (
          <Text variant="body" className="text-muted-foreground">
            No children added yet.
          </Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
