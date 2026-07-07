import { Warning } from "phosphor-react-native";
import { Modal, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import type { SOSAlert } from "@/lib/api-types";

/**
 * Full-screen SOS takeover (design "v2 / SOS active"). Fired by any of the three
 * SOS channels; blocks the trip UI until acknowledged or resolved.
 */
export function SOSBanner({
  alert,
  raisedByName,
  onResolve,
  onDismiss,
  resolving,
}: {
  alert: SOSAlert;
  raisedByName?: string;
  onResolve: () => void;
  onDismiss: () => void;
  resolving?: boolean;
}) {
  return (
    <Modal visible animationType="fade" transparent={false}>
      <View className="flex-1 bg-destructive">
        <SafeAreaView className="flex-1 px-5" edges={["top", "bottom", "left", "right"]}>
          <View className="flex-1 justify-center gap-6">
            <View className="items-center gap-6">
              <View className="h-24 w-24 items-center justify-center rounded-full bg-white">
                <Warning size={44} color="#e11900" weight="fill" />
              </View>
              <View className="items-center gap-2">
                <Text className="text-[26px] font-bold text-white">
                  {raisedByName ? `${raisedByName} raised an alert` : "SOS raised"}
                </Text>
                {alert.message ? (
                  <View className="mt-2 w-full rounded-xl bg-[#b31400] px-4 py-4">
                    <Text className="text-[15px] text-white">“{alert.message}”</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View className="gap-3">
              <Pressable
                onPress={onDismiss}
                className="h-14 items-center justify-center rounded-[10px] bg-[#b31400]"
              >
                <Text className="text-[15px] font-bold text-white">Open live location</Text>
              </Pressable>
              <Pressable
                onPress={onResolve}
                disabled={resolving}
                className="h-14 items-center justify-center rounded-[10px] bg-white"
                style={resolving ? { opacity: 0.6 } : undefined}
              >
                <Text className="text-[15px] font-bold text-destructive">
                  {resolving ? "Resolving…" : "Mark resolved"}
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
