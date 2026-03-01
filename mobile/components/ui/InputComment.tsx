import React, { useState, useCallback } from "react";
import { Text, Button, XStack, YStack } from "tamagui";
import { FontAwesome } from "@expo/vector-icons";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";

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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <Pressable
            onPress={onClose}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          <View
            style={{
              width: "85%",
              maxWidth: 500,
              borderRadius: 12,
              backgroundColor: "#fff",
              padding: 16,
            }}
          >
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

              <TextInput
                multiline
                placeholder="コメントをかく..."
                value={value}
                onChangeText={setValue}
                style={{
                  minHeight: 100,
                  borderWidth: 1,
                  borderColor: "#FFB433",
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 16,
                  textAlignVertical: "top",
                }}
                blurOnSubmit={false}
                autoCorrect={false}
                keyboardType="default"
              />

              <XStack gap="$2">
                <Pressable
                  onPressIn={handleSend}
                  disabled={!value.trim()}
                  style={{
                    marginLeft: "auto",
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: value.trim() ? "#FFB433" : "#d1d5db",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: value.trim() ? 1 : 0.5,
                  }}
                >
                  <FontAwesome
                    name="paper-plane"
                    size={18}
                    color={value.trim() ? "#FFB433" : "#aaa9a9"}
                  />
                </Pressable>
              </XStack>
            </YStack>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
