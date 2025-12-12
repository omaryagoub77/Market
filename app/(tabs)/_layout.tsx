import { Tabs } from 'expo-router';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BottomNav, Colors as ThemeColors } from '@/src/theme';

// Simple loading screen
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={ThemeColors.PRIMARY_START} />
  </View>
);

export default function TabLayout() {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme();

  // Show loading indicator while checking auth state
  if (loading) {
    return <LoadingScreen />;
  }

  // If not authenticated, redirect to login (this is handled by the ProtectedRoute)
  // But we still want to show the tabs for authenticated users

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          height: BottomNav.HEIGHT,
          backgroundColor: ThemeColors.BLACK,
          borderTopLeftRadius: BottomNav.RADIUS,
          borderTopRightRadius: BottomNav.RADIUS,
          paddingBottom: 10,
          paddingTop: 10,
        },
      }}>
      <Tabs.Screen
        name="home-feed"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={BottomNav.ICON_SIZE} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="post-item"
        options={{
          title: 'Post',
          tabBarIcon: ({ color }) => <IconSymbol size={BottomNav.ICON_SIZE} name="plus.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat-list"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <IconSymbol size={BottomNav.ICON_SIZE} name="message.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-products"
        options={{
          title: 'My Products',
          tabBarIcon: ({ color }) => <IconSymbol size={BottomNav.ICON_SIZE} name="basket.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="favourite"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => <IconSymbol size={BottomNav.ICON_SIZE} name="heart.fill" color={color} />,
        }}
      />
      {/* Profile tab removed - moved to home feed page */}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ThemeColors.BG_LIGHT,
  },
});