import { useRouter } from "expo-router";
import { UsersThree } from "phosphor-react-native";
import { ScrollView, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { ListRow } from "@/components/ui/list-row";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Screen } from "@/components/shared/Screen";
import { useChildren } from "@/hooks/api/useChildren";
import { useFamilies } from "@/hooks/api/useFamilies";

export default function FamilyTab() {
  const router = useRouter();
  const families = useFamilies();
  const children = useChildren();
  const family = families.data?.[0];

  if (!families.isLoading && !family) {
    return (
      <Screen title="Family">
        <EmptyState
          Icon={UsersThree}
          title="No family yet"
          message="Create your household from onboarding to manage children and members."
        />
      </Screen>
    );
  }

  return (
    <Screen title={family?.name ?? "Family"} padded={false}>
      <ScrollView contentContainerClassName="px-5 pb-10">
        <SectionHeader
          title="Children"
          actionLabel="Add"
          onAction={() => router.push("/(onboarding)/add-children")}
          className="pb-1 pt-2"
        />
        <View className="overflow-hidden rounded-[10px] bg-card-secondary">
          {(children.data ?? []).map((c, i) => (
            <View key={c.id} className={i > 0 ? "border-t border-border" : undefined}>
              <ListRow
                icon={
                  <Avatar uri={c.photo_url} name={c.full_name} size={44} ringColor={c.color_tag} />
                }
                title={c.full_name}
                subtitle={c.grade ? `Grade ${c.grade}` : undefined}
                onPress={() => router.push(`/child/${c.id}`)}
              />
            </View>
          ))}
        </View>
        {children.data && children.data.length === 0 ? (
          <Text variant="body" className="mt-3 text-muted-foreground">
            No children added yet.
          </Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
