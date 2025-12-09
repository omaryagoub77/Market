import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = () => {
    if (password !== confirmPassword) {
      console.log('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Registering with:', { name, email, password });
      setIsLoading(false);
    }, 1000);
  };

  const handleGoogleRegister = () => {
    console.log('Registering with Google');
  };

  const handleFacebookRegister = () => {
    console.log('Registering with Facebook');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedText type="title" style={styles.title}>
          Create Account
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Sign up to get started
        </ThemedText>

        <View style={styles.form}>
          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
          />

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

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry
          />

          <Button 
            title={isLoading ? "Creating Account..." : "Sign Up"} 
            onPress={handleRegister}
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
            onPress={handleGoogleRegister}
            style={styles.socialButton}
          />
          <Button 
            title="Facebook" 
            variant="secondary" 
            onPress={handleFacebookRegister}
            style={styles.socialButton}
          />
        </View>

        <View style={styles.loginContainer}>
          <ThemedText>Already have an account? </ThemedText>
          <TouchableOpacity>
            <ThemedText style={styles.loginText}>Sign In</ThemedText>
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: Colors.PRIMARY_START,
    fontWeight: '600',
  },
});