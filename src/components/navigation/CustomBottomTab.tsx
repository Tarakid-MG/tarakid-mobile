import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Calendar, Home, Trophy, User } from "lucide-react-native";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Theme";

export const CustomBottomTab: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const getIcon = (routeName: string, color: string, isFocused: boolean) => {
    const size = 22;
    switch (routeName) {
      case "index":
        return (
          <Home size={size} color={color} strokeWidth={isFocused ? 2.5 : 2} />
        );
      case "schedule":
        return (
          <Calendar
            size={size}
            color={color}
            strokeWidth={isFocused ? 2.5 : 2}
          />
        );
      case "history":
        return (
          <Trophy size={size} color={color} strokeWidth={isFocused ? 2.5 : 2} />
        );
      case "profile":
        return (
          <User size={size} color={color} strokeWidth={isFocused ? 2.5 : 2} />
        );
      default:
        return <Home size={size} color={color} />;
    }
  };

  const getLabel = (routeName: string) => {
    switch (routeName) {
      case "index":
        return "Accueil";
      case "schedule":
        return "Planning";
      case "history":
        return "Historique";
      case "profile":
        return "Profil";
      default:
        return routeName;
    }
  };

  return (
    <View style={{ backgroundColor: Colors.offWhite }}>
      <View style={styles.container}>
        <View style={styles.tabContent}>
          {state.routes.map((route, index) => {
            if (route.name === "_sitemap" || route.name === "+not-found")
              return null;

            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const color = isFocused ? Colors.blue : Colors.navy + "60";

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={[styles.tabItem, isFocused && styles.tabItemActive]}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    isFocused && styles.iconContainerActive,
                  ]}
                >
                  {getIcon(route.name, color, isFocused)}
                  {isFocused && (
                    <Text style={styles.label}>{getLabel(route.name)}</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: Platform.OS === "ios" ? 30 : 15,
    paddingTop: 18,
    paddingHorizontal: 20,
    // Shadow for iOS
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    // Elevation for Android
    elevation: 20,
    // Add a subtle border to define the shape better
    borderWidth: 1,
    borderColor: Colors.slate[100],
    borderBottomWidth: 0,
  },
  tabContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  tabItemActive: {
    flex: 1.5, // Active item takes more space
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 8,
  },
  iconContainerActive: {
    backgroundColor: Colors.blue + "15",
  },
  label: {
    fontSize: 13,
    fontWeight: "900",
    color: Colors.blue,
  },
});
