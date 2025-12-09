import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BottomNav, Colors as ThemeColors } from '@/src/theme'; // Import theme

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          height: BottomNav.HEIGHT, // Using theme height
          backgroundColor: ThemeColors.BLACK, // Using theme color
          borderTopLeftRadius: BottomNav.RADIUS, // Using theme radius
          borderTopRightRadius: BottomNav.RADIUS, // Using theme radius
          paddingBottom: 10, // Using theme spacing
          paddingTop: 10, // Using theme spacing
        },
      }}>
      <Tabs.Screen
        name="home-feed"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={BottomNav.ICON_SIZE} name="house.fill" color={color} />, // Using theme icon size
        }}
      />
      <Tabs.Screen
        name="post-item"
        options={{
          title: 'Post',
          tabBarIcon: ({ color }) => <IconSymbol size={BottomNav.ICON_SIZE} name="plus.circle.fill" color={color} />, // Using theme icon size
        }}
      />
      <Tabs.Screen
        name="chat-list"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <IconSymbol size={BottomNav.ICON_SIZE} name="message.fill" color={color} />, // Using theme icon size
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={BottomNav.ICON_SIZE} name="person.fill" color={color} />, // Using theme icon size
        }}
      />
    </Tabs>
  );
}