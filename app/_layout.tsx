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
  anchor: '(tabs)',
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
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}