import React, { useState } from "react";
import { FlatList } from "react-native";
import { Sheet, Text, Button, XStack } from "tamagui";
import { FontAwesome } from "@expo/vector-icons";
import { AchievementIcon } from "./AchievementIcon";
import {
  ACHIEVEMENTS_MASTER,
  type Achievement,
} from "../../constants/achievementsMaster";

type AchievementWithId = Achievement & { id: string };

type Props = {
  visible: boolean;
  onClose: () => void;
  unlockedIds: string[];
};

export const AchievementModal: React.FC<Props> = ({
  visible,
  onClose,
  unlockedIds,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ACHIEVEMENTS_MASTERから全実績データを配列に変換
  const allAchievements: AchievementWithId[] = Object.keys(
    ACHIEVEMENTS_MASTER
  ).map((id) => ({
    id,
    ...ACHIEVEMENTS_MASTER[id],
  }));

  return (
    <Sheet
      modal
      open={visible}
      onOpenChange={onClose}
      snapPoints={[80]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame padding="$4" gap="$3" flex={1}>
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
            color="#FFB433"
            circular
            size="$3"
            icon={<FontAwesome name="close" size={20} color="#FFB433" />}
          />
        </XStack>
        <FlatList
          data={allAchievements}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 12,
          }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={true}
          renderItem={({ item }) => (
            <AchievementIcon
              achievement={item}
              isUnlocked={
                unlockedIds.includes(item.id) || item.id === "welcome_snr"
              }
              isExpanded={selectedId === item.id}
              onPress={() =>
                setSelectedId(selectedId === item.id ? null : item.id)
              }
            />
          )}
        />
      </Sheet.Frame>
    </Sheet>
  );
};
