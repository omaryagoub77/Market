import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Logging in with:', { email, password });
      setIsLoading(false);
    }, 1000);
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

          <TouchableOpacity style={styles.forgotPassword}>
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
          <TouchableOpacity>
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