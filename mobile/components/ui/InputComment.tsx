import React, { useState, useCallback } from "react";
import { Dialog, Text, Input, Button, XStack, YStack } from "tamagui";
import { FontAwesome } from "@expo/vector-icons";

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
    <Dialog open={visible} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Dialog.Content
          bordered
          elevate
          key="content"
          animation={[
            "quick",
            {
              opacity: {
                overshootClamped: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$3"
          padding="$4"
          width="85%"
          maxWidth="500px"
        >
          <Dialog.Description asChild>
            <YStack gap="$3" width="100%">
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={16}>コメントをかいてね</Text>
                <Button
                  onPress={onClose}
                  borderColor="#ffffff"
                  borderWidth={1}
                  backgroundColor="transparent"
                  color="#FFB433"
                  circular
                  size="$3"
                  icon={<FontAwesome name="close" size={20} color="#FFB433" />}
                />
              </XStack>
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
                  onPress={handleSend}
                  borderColor={value.trim() ? "#FFB433" : "$gray5"}
                  borderWidth={1}
                  disabled={!value.trim()}
                  backgroundColor="transparent"
                  color={value.trim() ? "#FFB433" : "$gray5"}
                  circular
                  size="$3"
                  marginLeft="auto"
                  icon={
                    <FontAwesome
                      name="paper-plane"
                      size={20}
                      color={value.trim() ? "#FFB433" : "#aaa9a9ff"}
                    />
                  }
                ></Button>
              </XStack>
            </YStack>
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
