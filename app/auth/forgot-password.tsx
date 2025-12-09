import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleResetPassword = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Resetting password for:', email);
      setIsLoading(false);
      setIsSent(true);
    }, 1000);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedText type="title" style={styles.title}>
          {isSent ? 'Check Your Email' : 'Forgot Password?'}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {isSent 
            ? 'We have sent a password reset link to your email address.' 
            : 'Enter your email to receive a reset link'}
        </ThemedText>

        {!isSent ? (
          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Button 
              title={isLoading ? "Sending..." : "Send Reset Link"} 
              onPress={handleResetPassword}
              disabled={isLoading || !email}
            />
          </View>
        ) : (
          <View style={styles.successContainer}>
            <ThemedText style={styles.successText}>
              Didn't receive the email? Check your spam folder or
            </ThemedText>
            <TouchableOpacity onPress={() => setIsSent(false)}>
              <ThemedText style={styles.resendText}>Resend Email</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.backToLogin}>
          <ThemedText style={styles.backToLoginText}>Back to Login</ThemedText>
        </TouchableOpacity>
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
  successContainer: {
    alignItems: 'center',
    marginBottom: Spacing.SECTION_GAP,
  },
  successText: {
    textAlign: 'center',
    marginBottom: Spacing.COMPONENT,
  },
  resendText: {
    color: Colors.PRIMARY_START,
    fontWeight: '600',
  },
  backToLogin: {
    alignSelf: 'center',
  },
  backToLoginText: {
    color: Colors.PRIMARY_START,
    fontWeight: '600',
  },
});