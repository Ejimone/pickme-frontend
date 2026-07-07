import { Modal, Pressable, View } from "react-native";

import { cn } from "@/lib/cn";
import { Button, type ButtonVariant } from "./button";
import { Text } from "./text";

/** Centered modal surface — the reusable base for confirms and small forms. */
export function Dialog({
  visible,
  onClose,
  children,
  className,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/50 px-6"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className={cn(
            "w-full max-w-md gap-4 rounded-lg border border-border bg-card p-5",
            className,
          )}
        >
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Confirm/cancel dialog (used by SOS AlertDialog and destructive actions). */
export function AlertDialog({
  visible,
  onClose,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  onConfirm,
  loading,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <Dialog visible={visible} onClose={onClose}>
      <View className="gap-1.5">
        <Text variant="title">{title}</Text>
        {description ? (
          <Text variant="body" className="text-muted-foreground">
            {description}
          </Text>
        ) : null}
      </View>
      <View className="flex-row gap-3">
        <Button
          label={cancelLabel}
          variant="secondary"
          onPress={onClose}
          className="flex-1"
        />
        <Button
          label={confirmLabel}
          variant={confirmVariant}
          loading={loading}
          onPress={onConfirm}
          className="flex-1"
        />
      </View>
    </Dialog>
  );
}
