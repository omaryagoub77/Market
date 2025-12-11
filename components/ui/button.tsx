import React from 'react';
import { StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, Radii, Shadows } from '@/src/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'circular';
  disabled?: boolean;
  style?: object;
  textStyle?: object;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  // Create platform-specific shadow styles
  const getShadowStyle = () => {
    if (Platform.OS === 'web') {
      // For web, use boxShadow directly
      return {
        boxShadow: Shadows.SOFT.boxShadow
      };
    } else {
      // For native, use React Native shadow properties
      const { boxShadow, ...nativeShadows } = Shadows.SOFT;
      return nativeShadows;
    }
  };

  const buttonStyles = [
    styles.base,
    getShadowStyle(),
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'circular' && styles.circular,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.textBase,
    variant === 'primary' && styles.primaryText,
    variant === 'secondary' && styles.secondaryText,
    variant === 'circular' && styles.circularText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}>
      <ThemedText style={textStyles}>{title}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: Radii.BUTTON,
  },
  primary: {
    backgroundColor: Colors.BLACK,
    height: 56,
    width: '100%',
  },
  secondary: {
    backgroundColor: Colors.BG_LIGHT,
    borderWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
  },
  circular: {
    width: 44,
    height: 44,
    borderRadius: Radii.CIRCLE,
    backgroundColor: Colors.BG_LIGHT,
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontWeight: '600',
  },
  primaryText: {
    color: Colors.BG_LIGHT,
  },
  secondaryText: {
    color: Colors.TEXT,
  },
  circularText: {
    color: Colors.TEXT,
  },
});