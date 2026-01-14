import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Achievement = {
  id: string;
  name: string;
  description?: string;
  icon?: React.ReactNode;
};
type Props = { achievement: Achievement; isUnlocked: boolean };

export const AchievementIcon: React.FC<Props> = ({
  achievement,
  isUnlocked,
}) => (
  <View style={[styles.wrap, !isUnlocked && styles.locked]}>
    <View style={styles.icon}>{achievement.icon || <Text>?</Text>}</View>
    <Text style={styles.name} numberOfLines={1}>
      {achievement.name}
    </Text>
    {achievement.description ? (
      <Text style={styles.desc} numberOfLines={2}>
        {achievement.description}
      </Text>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    padding: 8,
    alignItems: "center",
    width: 140,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  locked: { opacity: 0.4 },
  icon: { marginBottom: 6 },
  name: { fontWeight: "700", color: "#333" },
  desc: { fontSize: 12, color: "#666", textAlign: "center", marginTop: 2 },
});
