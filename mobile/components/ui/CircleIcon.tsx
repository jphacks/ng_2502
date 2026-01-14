import React from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";

type Props = { src: ImageSourcePropType; alt?: string; size?: number };

export const CircleIcon: React.FC<Props> = ({ src, size = 48 }) => {
  return (
    <Image
      source={src}
      style={[
        styles.image,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
      resizeMode="cover"
    />
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: "#f0f0f0",
  },
});
