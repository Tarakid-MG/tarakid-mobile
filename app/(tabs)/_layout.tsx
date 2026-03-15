import { Tabs } from "expo-router";
import React from "react";
import { CustomBottomTab } from "../../src/components/navigation/CustomBottomTab";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomBottomTab {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Planning",
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Historique",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
        }}
      />
    </Tabs>
  );
}
