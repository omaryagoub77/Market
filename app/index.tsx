import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/src/theme';

export default function Index() {
  const { user, loading, getRedirectUrl, clearRedirectUrl } = useAuth();

  // Show loading indicator while checking auth state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY_START} />
      </View>
    );
  }

  // If user is authenticated, redirect to stored URL or home feed
  if (user) {
    const redirectUrl = getRedirectUrl();
    if (redirectUrl && redirectUrl.startsWith('/')) {
      // Clear the redirect URL after using it
      clearRedirectUrl();
      return <Redirect href={redirectUrl as any} />;
    }
    return <Redirect href="/(tabs)/home-feed" />;
  }

  // If user is not authenticated, redirect to login
  return <Redirect href="/auth/login" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.BG_LIGHT,
  },
});