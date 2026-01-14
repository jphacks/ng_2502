import React from "react";
import { XStack, Text } from "tamagui";
import { CircleIcon } from "./CircleIcon";
import { MarkButton } from "./MarkButton";

type Props = {
  title?: string;
  onPressTutorial?: () => void;
  onPressCreate?: () => void;
  iconSrc: any;
};

export const Header: React.FC<Props> = ({
  title = "SNR",
  onPressTutorial,
  onPressCreate,
  iconSrc,
}) => (
  <XStack
    height={72}
    paddingHorizontal="$4"
    alignItems="center"
    justifyContent="space-between"
    backgroundColor="$background"
  >
    <CircleIcon src={iconSrc} alt="user" />
    <Text fontSize={20} fontWeight="700">
      {title}
    </Text>
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
