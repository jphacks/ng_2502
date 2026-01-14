import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  icon: React.ReactNode;
  onPress?: () => void;
};

export const MarkButton: React.FC<Props> = ({ icon, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.button} activeOpacity={0.8}>
    {icon}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
});
