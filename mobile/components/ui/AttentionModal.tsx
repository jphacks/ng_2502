import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";

type Props = { visible: boolean; onClose: () => void };

export const AttentionModal: React.FC<Props> = ({ visible, onClose }) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <Text style={styles.title}>きをつけてね</Text>
        <Text style={styles.body}>
          あやしいリンクをおすとこわいめにあっちゃうよ。あやしいリンクはぜったいにさわらないようにしよう。
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            onClose();
            Linking.openURL("snr://list").catch(() => {});
          }}
        >
          <Text style={styles.buttonText}>とうこうページにもどる</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 16,
  },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  body: { fontSize: 15, color: "#444", marginBottom: 16 },
  button: {
    backgroundColor: "#FFB433",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
