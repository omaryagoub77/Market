import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import notificationService from '@/src/NotificationService';
import { AppState } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  // Changed from '(tabs)' to 'home-feed' to directly load the home screen
  anchor: 'home-feed',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Initialize notification service
    const initNotifications = async () => {
      try {
        await notificationService.init();
        // Handle background notifications
        await notificationService.handleBackgroundNotification();
      } catch (error) {
        console.error('Error initializing notification service:', error);
      }
    };
    
    initNotifications();
    
    // Handle app state changes for background/foreground transitions
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // App has come to the foreground
        console.log('App is in the foreground');
      } else if (nextAppState === 'background') {
        // App has gone to the background
        console.log('App is in the background');
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Cleanup function
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Load all screens for the new navigation system */}
          <Stack.Screen name="home-feed" options={{ headerShown: false }} />
          <Stack.Screen name="post-item" options={{ headerShown: false }} />
          <Stack.Screen name="chat-list" options={{ headerShown: false }} />
          <Stack.Screen name="my-products" options={{ headerShown: false }} />
          <Stack.Screen name="favourite" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen name="reviews" options={{ headerShown: false }} />
          <Stack.Screen name="more" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="screens/product-detail" options={{ headerShown: false }} />
          <Stack.Screen name="screens/chat-room" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)/edit-product/[id]" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}