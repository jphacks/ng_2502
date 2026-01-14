import React from "react";
import { View, StyleSheet } from "react-native";

type Props = { header?: React.ReactNode; children?: React.ReactNode };

const Layout: React.FC<Props> = ({ header, children }) => (
  <View style={styles.container}>
    {header}
    <View style={styles.content}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
});

export default Layout;
