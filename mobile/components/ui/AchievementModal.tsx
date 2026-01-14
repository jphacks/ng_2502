import React from "react";
import { FlatList } from "react-native";
import { Sheet, Text, Button, XStack } from "tamagui";
import { AchievementIcon } from "./AchievementIcon";

type Achievement = {
  id: string;
  name: string;
  description?: string;
  icon?: React.ReactNode;
};
type Props = {
  visible: boolean;
  onClose: () => void;
  achievements: Achievement[];
  unlockedIds: string[];
};

export const AchievementModal: React.FC<Props> = ({
  visible,
  onClose,
  achievements,
  unlockedIds,
}) => (
  <Sheet
    modal
    open={visible}
    onOpenChange={onClose}
    snapPoints={[80]}
    dismissOnSnapToBottom
  >
    <Sheet.Overlay />
    <Sheet.Frame padding="$4" gap="$3">
      <XStack
        justifyContent="space-between"
        alignItems="center"
        marginBottom="$3"
      >
        <Text fontSize={18} fontWeight="700">
          あつめたバッジ
        </Text>
        <Button
          onPress={onClose}
          borderColor="#FFB433"
          borderWidth={1}
          backgroundColor="transparent"
          color="$color"
        >
          とじる
        </Button>
      </XStack>
      <FlatList
        data={achievements}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: 12,
        }}
        renderItem={({ item }) => (
          <AchievementIcon
            achievement={item}
            isUnlocked={
              unlockedIds.includes(item.id) || item.id === "welcome_snr"
            }
          />
        )}
      />
    </Sheet.Frame>
  </Sheet>
);
