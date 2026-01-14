import React from "react";
import { Linking } from "react-native";
import { Sheet, Text, Button, YStack } from "tamagui";

type Props = { visible: boolean; onClose: () => void };

export const AttentionModal: React.FC<Props> = ({ visible, onClose }) => (
  <Sheet
    modal
    open={visible}
    onOpenChange={onClose}
    snapPoints={[40]}
    dismissOnSnapToBottom
  >
    <Sheet.Overlay backgroundColor="rgba(0,0,0,0.35)" />
    <Sheet.Frame padding="$4" gap="$3" borderRadius="$4">
      <YStack gap="$3">
        <Text fontSize={18} fontWeight="700">
          きをつけてね
        </Text>
        <Text fontSize={15} color="#444">
          あやしいリンクをおすとこわいめにあっちゃうよ。あやしいリンクはぜったいにさわらないようにしよう。
        </Text>
        <Button
          backgroundColor="#FFB433"
          borderRadius="$3"
          paddingVertical="$3"
          color="#fff"
          fontWeight="700"
          onPress={() => {
            onClose();
            Linking.openURL("snr://list").catch(() => {});
          }}
        >
          とうこうページにもどる
        </Button>
      </YStack>
    </Sheet.Frame>
  </Sheet>
);
