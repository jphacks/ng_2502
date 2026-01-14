import React, { useState, useCallback } from "react";
import { Sheet, Text, Input, Button, XStack } from "tamagui";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

export const InputComment: React.FC<Props> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [value, setValue] = useState("");

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
    onClose();
  }, [onSubmit, onClose, value]);

  return (
    <Sheet
      modal
      open={visible}
      onOpenChange={onClose}
      snapPoints={[50]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame padding="$4" gap="$3">
        <Text fontSize={18} fontWeight="700">
          コメント
        </Text>
        <Input
          multiline
          placeholder="コメントをかく..."
          value={value}
          onChangeText={setValue}
          borderColor="#FFB433"
          borderWidth={1}
          borderRadius="$3"
          padding="$3"
          minHeight={100}
        />
        <XStack gap="$2">
          <Button
            flex={1}
            onPress={onClose}
            backgroundColor="$gray5"
            color="$color"
          >
            とじる
          </Button>
          <Button
            flex={1}
            onPress={handleSend}
            disabled={!value.trim()}
            backgroundColor={value.trim() ? "#FFB433" : "$gray5"}
            color={value.trim() ? "#fff" : "$color"}
          >
            とうこう
          </Button>
        </XStack>
      </Sheet.Frame>
    </Sheet>
  );
};
