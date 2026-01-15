import React from "react";
import { XStack, Text, Image } from "tamagui";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CircleIcon } from "./CircleIcon";
import { MarkButton } from "./MarkButton";

type Props = {
  title?: string;
  onPressTutorial?: () => void;
  onPressCreate?: () => void;
  onPressLogo?: () => void;
  iconSrc: any;
};

export const Header: React.FC<Props> = ({
  title = "SNR",
  onPressTutorial,
  onPressCreate,
  onPressLogo,
  iconSrc,
}) => {
  const insets = useSafeAreaInsets();
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
      <CircleIcon src={iconSrc} alt="user" />
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
