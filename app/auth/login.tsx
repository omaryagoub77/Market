import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';
import { auth } from '@/src/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { getRedirectUrl, clearRedirectUrl } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', userCredential.user);
      
      // Check if there's a redirect URL stored
      const redirectUrl = getRedirectUrl();
      if (redirectUrl && redirectUrl.startsWith('/')) {
        // Clear the redirect URL after using it
        clearRedirectUrl();
        // Redirect to the stored URL
        router.replace(redirectUrl as any);
      } else {
        // Default redirect to home feed
        router.replace('/home-feed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Logging in with Google');
  };

  const handleFacebookLogin = () => {
    console.log('Logging in with Facebook');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedText type="title" style={styles.title}>
          Welcome Back
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Sign in to continue
        </ThemedText>

        {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />

          <TouchableOpacity style={styles.forgotPassword} onPress={() => router.push('/auth/forgot-password')}>
            <ThemedText style={styles.forgotPasswordText}>Forgot Password?</ThemedText>
          </TouchableOpacity>

          <Button 
            title={isLoading ? "Signing in..." : "Sign In"} 
            onPress={handleLogin}
            disabled={isLoading}
          />
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <ThemedText style={styles.dividerText}>OR</ThemedText>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtons}>
          <Button 
            title="Google" 
            variant="secondary" 
            onPress={handleGoogleLogin}
            style={styles.socialButton}
          />
          <Button 
            title="Facebook" 
            variant="secondary" 
            onPress={handleFacebookLogin}
            style={styles.socialButton}
          />
        </View>

        <View style={styles.signupContainer}>
          <ThemedText>Don't have an account? </ThemedText>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <ThemedText style={styles.signupText}>Sign Up</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_LIGHT,
  },
  contentContainer: {
    padding: Spacing.SCREEN_PADDING,
    paddingTop: 60,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.LIST_GAP,
  },
  subtitle: {
    textAlign: 'center',
    color: Colors.GRAY_MED,
    marginBottom: Spacing.SECTION_GAP,
  },
  errorText: {
    color: Colors.ALERT_RED,
    textAlign: 'center',
    marginBottom: Spacing.LIST_GAP,
  },
  form: {
    marginBottom: Spacing.SECTION_GAP,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.SECTION_GAP,
  },
  forgotPasswordText: {
    color: Colors.PRIMARY_START,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.SECTION_GAP,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.GRAY_LIGHT,
  },
  dividerText: {
    marginHorizontal: Spacing.COMPONENT,
    color: Colors.GRAY_MED,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.SECTION_GAP,
  },
  socialButton: {
    flex: 1,
    marginHorizontal: Spacing.LIST_GAP,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: Colors.PRIMARY_START,
    fontWeight: '600',
  },
});