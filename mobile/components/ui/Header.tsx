import React, { useState } from "react";
import { XStack, Text, Image } from "tamagui";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CircleIcon } from "./CircleIcon";
import { MarkButton } from "./MarkButton";
import { AchievementModal } from "./AchievementModal";
import { FontAwesome } from "@expo/vector-icons";

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
  iconColor = "blue",
  iconSrc,
  unlockedIds = [],
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isAchievementVisible, setIsAchievementVisible] = useState(false);

  // iconColorが指定されている場合はiconMapから取得、iconSrcが指定されている場合はそれを使用
  const { src, alt } =
    iconColor && iconMap[iconColor]
      ? iconMap[iconColor]
      : { src: iconSrc || iconMap.blue.src, alt: "user" };

  const handleLogoPress = () => {
    if (onPressLogo) {
      onPressLogo();
      return;
    }

    router.push("/list");
  };

  const handleCreatePress = () => {
    if (onPressCreate) {
      onPressCreate();
      return;
    }

    router.push("/input");
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
          <Pressable onPress={onPressProfile}>
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
            onPress={onPressTutorial}
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
    </>
  );
};
