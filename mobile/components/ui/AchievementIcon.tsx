import React from "react";
import { StyleSheet, Pressable } from "react-native";
import { Text, YStack } from "tamagui";
import {
  FontAwesome,
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import type { AchievementIcon as AchievementIconType } from "../../constants/achievementsMaster";

type Achievement = {
  id: string;
  name: string;
  description?: string;
  icon?: AchievementIconType;
};
type Props = {
  achievement: Achievement;
  isUnlocked: boolean;
  isExpanded: boolean;
  onPress: () => void;
};

/**
 * アイコンファミリーに応じた適切なコンポーネントを返す
 */
const renderIcon = (
  icon: AchievementIconType | undefined,
  isUnlocked: boolean
) => {
  if (!icon) {
    return (
      <FontAwesome
        name="question"
        size={48}
        color={isUnlocked ? "#FFB433" : "#999"}
      />
    );
  }

  const iconColor = isUnlocked ? "#FFB433" : "#999";
  const iconSize = 48;

  switch (icon.family) {
    case "FontAwesome":
      return (
        <FontAwesome
          name={icon.name as any}
          size={iconSize}
          color={iconColor}
        />
      );
    case "MaterialIcons":
      return (
        <MaterialIcons
          name={icon.name as any}
          size={iconSize}
          color={iconColor}
        />
      );
    case "MaterialCommunityIcons":
      return (
        <MaterialCommunityIcons
          name={icon.name as any}
          size={iconSize}
          color={iconColor}
        />
      );
    case "Ionicons":
      return (
        <Ionicons name={icon.name as any} size={iconSize} color={iconColor} />
      );
    default:
      return <FontAwesome name="question" size={iconSize} color={iconColor} />;
  }
};

export const AchievementIcon: React.FC<Props> = ({
  achievement,
  isUnlocked,
  isExpanded,
  onPress,
}) => {
  return (
    <Pressable onPress={onPress}>
      <YStack
        style={[
          styles.wrap,
          !isUnlocked && styles.locked,
          isExpanded && styles.expanded,
        ]}
        alignItems="center"
        gap="$2"
      >
        {renderIcon(achievement.icon, isUnlocked)}
        <Text
          fontSize={12}
          fontWeight="700"
          color={isUnlocked ? "#333" : "#666"}
          numberOfLines={1}
          textAlign="center"
        >
          {achievement.name}
        </Text>
        {isExpanded && achievement.description && (
          <Text
            fontSize={12}
            color="#333"
            textAlign="center"
            marginTop="$2"
            paddingHorizontal="$2"
          >
            {achievement.description}
          </Text>
        )}
      </YStack>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrap: {
    padding: 8,
    alignItems: "center",
    width: 140,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  locked: { opacity: 0.4 },
  expanded: {
    backgroundColor: "#FFF5E6",
    borderWidth: 2,
    borderColor: "#FFB433",
  },
});
