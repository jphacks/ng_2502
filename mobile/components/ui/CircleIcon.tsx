import React from "react";
import { Avatar } from "tamagui";
import { ImageSourcePropType } from "react-native";

type Props = { src: ImageSourcePropType; alt?: string; size?: number };

export const CircleIcon: React.FC<Props> = ({ src, size = 48 }) => {
  return (
    <Avatar circular size={size}>
      <Avatar.Image source={src} />
    </Avatar>
  );
};
