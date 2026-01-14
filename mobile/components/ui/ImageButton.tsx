import React from "react";
import {
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  StyleSheet,
} from "react-native";

type Props = {
  source: ImageSourcePropType;
  onPress?: () => void;
};

export const ImageButton: React.FC<Props> = ({ source, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.button}
    activeOpacity={0.85}
  >
    <Image source={source} style={styles.image} resizeMode="contain" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 48,
    height: 48,
  },
});
