import React from "react";
import { StyleSheet, View, ViewStyle, Platform } from "react-native";
import { Colors } from "../../constants/Theme";

interface PremiumCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accent?: "blue" | "lightBlue" | "gold" | "orange" | "turquoise" | "teal";
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  style,
  accent,
}) => {
  const getAccentColor = () => {
    switch (accent) {
      case "gold":      return Colors.gold;
      case "orange":    return Colors.orange;
      case "turquoise": return Colors.turquoise;
      case "teal":      return Colors.teal;
      case "lightBlue": return Colors.lightBlue;
      default:          return Colors.blue;
    }
  };

  const accentColor = accent ? getAccentColor() : null;

  return (
    <View style={[styles.card, style]}>
      {/* Subtle color wash over the whole card */}
      {accentColor && (
        <View style={[styles.accentWash, { backgroundColor: accentColor + "07" }]} />
      )}

      {/* Left accent bar — thicker, rounded right edge, gradient-like via opacity layers */}
      {accentColor && (
        <>
          <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
          <View style={[styles.accentBarGlow, { backgroundColor: accentColor + "30" }]} />
        </>
      )}

      <View style={[styles.content, accentColor && styles.contentWithAccent]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: Colors.navy,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.07,
        shadowRadius: 20,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  accentWash: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
  },
  // Main solid bar (4px)
  accentBar: {
    position: "absolute",
    left: 0, top: 0, bottom: 0,
    width: 4,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  // Wider soft glow behind the bar (10px, semi-transparent)
  accentBarGlow: {
    position: "absolute",
    left: 0, top: 0, bottom: 0,
    width: 10,
  },
  content: {
    padding: 20,
  },
  contentWithAccent: {
    paddingLeft: 18,
  },
});