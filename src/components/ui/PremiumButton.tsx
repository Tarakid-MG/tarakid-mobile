import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from "react-native";
import { Colors } from "../../constants/Theme";

interface PremiumButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  onPress,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const isOutline = variant === "outline";
  const isGhost = variant === "ghost";
  const isSecondary = variant === "secondary";

  const getBackgroundColor = () => {
    if (disabled) return Colors.slate[200];
    if (isOutline || isGhost) return "transparent";
    if (isSecondary) return Colors.yellow;
    return Colors.orange;
  };

  const getShadowColor = () => {
    if (disabled || isOutline || isGhost) return "transparent";
    return "#c96500"; // Darker version of orange/yellow accent
  };

  const getTextColor = () => {
    if (disabled) return Colors.slate[400];
    if (isOutline || isGhost) return Colors.navy;
    if (isSecondary) return Colors.navy;
    return Colors.white;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles[size],
        fullWidth && styles.fullWidth,
        { backgroundColor: getBackgroundColor() },
        !isOutline &&
          !isGhost &&
          !disabled && {
            borderBottomWidth: 4,
            borderBottomColor: getShadowColor(),
          },
        isOutline && { borderWidth: 2, borderColor: Colors.navy + "20" },
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={getTextColor()} size="small" />
        ) : (
          <>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text
              style={[
                styles.textBase,
                styles[
                  `text${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles
                ],
                { color: getTextColor() },
                textStyle,
              ]}
            >
              {children}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
  },
  sm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  md: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  lg: {
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 24,
  },
  textBase: {
    fontWeight: "900",
    textAlign: "center",
  },
  textSm: {
    fontSize: 13,
  },
  textMd: {
    fontSize: 16,
    letterSpacing: 0.5,
  },
  textLg: {
    fontSize: 18,
  },
  icon: {
    marginRight: 8,
  },
});
