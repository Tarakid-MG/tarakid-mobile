import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../src/constants/Theme";

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Historique des cours (Parité Web à venir)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.navy,
  },
});
