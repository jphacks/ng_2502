import React from "react";
import { View, Text, StyleSheet } from "react-native";
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
  <View style={styles.container}>
    <CircleIcon src={iconSrc} alt="user" />
    <Text style={styles.title}>{title}</Text>
    <View style={styles.buttonGroup}>
      <MarkButton
        icon={<Text style={styles.iconText}>?</Text>}
        onPress={onPressTutorial}
      />
      <MarkButton
        icon={<Text style={styles.iconText}>＋</Text>}
        onPress={onPressCreate}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    height: 72,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  iconText: {
    fontSize: 20,
    color: "#FFB433",
    fontWeight: "700",
  },
});
