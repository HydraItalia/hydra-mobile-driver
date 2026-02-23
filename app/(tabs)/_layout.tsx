import { Tabs } from "expo-router";
import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Deliveries",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="local-shipping" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ping"
        options={{
          title: "Ping",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="wifi" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
