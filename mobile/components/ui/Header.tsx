import React from "react";
import { XStack, Text, Image } from "tamagui";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CircleIcon } from "./CircleIcon";
import { MarkButton } from "./MarkButton";

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
};

export const Header: React.FC<Props> = ({
  title = "SNR",
  onPressTutorial,
  onPressCreate,
  onPressLogo,
  onPressProfile,
  iconColor = "blue",
  iconSrc,
}) => {
  const insets = useSafeAreaInsets();

  // iconColorが指定されている場合はiconMapから取得、iconSrcが指定されている場合はそれを使用
  const { src, alt } =
    iconColor && iconMap[iconColor]
      ? iconMap[iconColor]
      : { src: iconSrc || iconMap.blue.src, alt: "user" };

  return (
    <XStack
      height={72}
      paddingTop={insets.top}
      paddingHorizontal="$4"
      alignItems="center"
      justifyContent="space-between"
      backgroundColor="$background"
      position="relative"
    >
      <Pressable onPress={onPressProfile}>
        <CircleIcon src={src} alt={alt} />
      </Pressable>
      <XStack
        position="absolute"
        left={0}
        right={0}
        alignItems="center"
        justifyContent="center"
        pointerEvents="box-none"
        paddingTop={insets.top}
      >
        <Pressable onPress={onPressLogo}>
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
          onPress={onPressCreate}
        />
      </XStack>
    </XStack>
  );
};
