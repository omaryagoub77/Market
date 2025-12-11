import React from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/src/theme';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string; // Optional redirect path to store
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, redirectTo }) => {
  const { user, loading, setRedirectUrl } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY_START} />
      </View>
    );
  }

  if (!user) {
    // Store the redirect URL if provided
    if (redirectTo) {
      setRedirectUrl(redirectTo);
    }
    
    // Redirect to login if not authenticated
    router.replace('/auth/login');
    return null;
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.BG_LIGHT,
  },
});