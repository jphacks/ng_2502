import React from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { AchievementIcon } from "./AchievementIcon";

type Achievement = {
  id: string;
  name: string;
  description?: string;
  icon?: React.ReactNode;
};
type Props = {
  visible: boolean;
  onClose: () => void;
  achievements: Achievement[];
  unlockedIds: string[];
};

export const AchievementModal: React.FC<Props> = ({
  visible,
  onClose,
  achievements,
  unlockedIds,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={styles.backdrop}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>あつめたバッジ</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>とじる</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={achievements}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => (
            <AchievementIcon
              achievement={item}
              isUnlocked={
                unlockedIds.includes(item.id) || item.id === "welcome_snr"
              }
            />
          )}
        />
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    borderColor: "#FFB433",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
});
