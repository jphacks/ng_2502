import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image, Text, XStack } from "tamagui";
import { AchievementModal } from "./AchievementModal";
import { CircleIcon } from "./CircleIcon";
import { MarkButton } from "./MarkButton";
import Tutorial from "./Tutorial";
import { useUserContext } from "./UserProvider";

// アイコンマッピング（React Nativeではrequireを使用）
const iconMap = {
  blue: {
    src: require("../../assets/images/UserIcon_Blue.png"),
    alt: "Blue Icon",
  },
  cream: {
    src: require("../../assets/images/UserIcon_Cream.png"),
    alt: "Cream Icon",
  },
  green: {
    src: require("../../assets/images/UserIcon_Green.png"),
    alt: "Green Icon",
  },
  mint: {
    src: require("../../assets/images/UserIcon_Mint.png"),
    alt: "Mint Icon",
  },
  navy: {
    src: require("../../assets/images/UserIcon_Navy.png"),
    alt: "Navy Icon",
  },
  olive: {
    src: require("../../assets/images/UserIcon_Olive.png"),
    alt: "Olive Icon",
  },
  purple: {
    src: require("../../assets/images/UserIcon_Purple.png"),
    alt: "Purple Icon",
  },
  red: {
    src: require("../../assets/images/UserIcon_Red.png"),
    alt: "Red Icon",
  },
  yellow: {
    src: require("../../assets/images/UserIcon_Yellow.png"),
    alt: "Yellow Icon",
  },
};

type IconColor = keyof typeof iconMap;

type Props = {
  title?: string;
  onPressTutorial?: () => void;
  onPressCreate?: () => void;
  onPressLogo?: () => void;
  onPressProfile?: () => void;
  iconColor?: IconColor;
  iconSrc?: any;
  unlockedIds?: string[];
};

export const Header: React.FC<Props> = ({
  title = "SNR",
  onPressTutorial,
  onPressCreate,
  onPressLogo,
  onPressProfile,
  iconColor,
  iconSrc,
  unlockedIds = [],
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { iconColor: contextIconColor } = useUserContext();
  const [isAchievementVisible, setIsAchievementVisible] = useState(false);
  const [isTutorialVisible, setIsTutorialVisible] = useState(false);

  // 優先順位: 明示iconColor > 明示iconSrc > UserContextのiconColor > blue
  const contextMappedIcon =
    !iconColor && !iconSrc && contextIconColor && contextIconColor in iconMap
      ? iconMap[contextIconColor as IconColor]
      : undefined;

  const { src, alt } = iconColor
    ? iconMap[iconColor]
    : iconSrc
      ? { src: iconSrc, alt: "user" }
      : contextMappedIcon || iconMap.blue;

  const handleLogoPress = () => {
    if (onPressLogo) {
      onPressLogo();
      return;
    }

    router.push("/(tabs)/list");
  };

  const handleCreatePress = () => {
    if (onPressCreate) {
      onPressCreate();
      return;
    }

    router.push("/input");
  };

  const handleProfilePress = () => {
    if (onPressProfile) {
      onPressProfile();
      return;
    }

    router.push("/mypage");
  };

  const handleTutorialPress = () => {
    if (onPressTutorial) {
      onPressTutorial();
      return;
    }

    setIsTutorialVisible(true);
  };

  return (
    <>
      <XStack
        height={120}
        paddingTop={insets.top}
        paddingHorizontal="$4"
        alignItems="center"
        justifyContent="space-between"
        backgroundColor="$background"
        position="relative"
      >
        <XStack alignItems="center" gap="$2">
          <Pressable onPress={handleProfilePress}>
            <CircleIcon src={src} alt={alt} />
          </Pressable>
          <MarkButton
            icon={<FontAwesome name="trophy" size={20} color="#FFB433" />}
            onPress={() => setIsAchievementVisible(true)}
          />
        </XStack>
        <XStack
          position="absolute"
          left={0}
          right={0}
          alignItems="center"
          justifyContent="center"
          pointerEvents="box-none"
          paddingTop={insets.top}
        >
          <Pressable onPress={handleLogoPress}>
            <Image
              source={require("../../assets/images/AppIconNotext.png")}
              width={40}
              height={40}
              resizeMode="contain"
            />
          </Pressable>
        </XStack>
        <XStack gap="$2">
          <MarkButton
            icon={
              <Text fontSize={20} color="#FFB433" fontWeight="700">
                ?
              </Text>
            }
            onPress={handleTutorialPress}
          />
          <MarkButton
            icon={
              <Text fontSize={20} color="#FFB433" fontWeight="700">
                ＋
              </Text>
            }
            onPress={handleCreatePress}
          />
        </XStack>
      </XStack>
      <AchievementModal
        visible={isAchievementVisible}
        onClose={() => setIsAchievementVisible(false)}
        unlockedIds={unlockedIds}
      />
      <Tutorial
        isOpen={isTutorialVisible}
        onClose={() => setIsTutorialVisible(false)}
      />
    </>
  );
};
