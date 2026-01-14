import React from "react";
import { Button } from "tamagui";
import { Image, ImageSourcePropType } from "react-native";

type Props = {
  source: ImageSourcePropType;
  onPress?: () => void;
};

export const ImageButton: React.FC<Props> = ({ source, onPress }) => (
  <Button onPress={onPress} size="$4" chromeless pressStyle={{ opacity: 0.85 }}>
    <Image
      source={source}
      style={{ width: 48, height: 48 }}
      resizeMode="contain"
    />
  </Button>
);
