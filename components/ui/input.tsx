import React from 'react';
import { TextInput, StyleSheet, View, TextInputProps, Platform } from 'react-native';
import { Colors, Radii, Shadows, Spacing } from '@/src/theme';

// Helper function to apply platform-specific shadows
const getShadowStyle = (shadowType: typeof Shadows.SOFT) => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: shadowType.boxShadow
    };
  } else {
    const { boxShadow, ...nativeShadows } = shadowType;
    return nativeShadows;
  }
};

interface InputProps extends TextInputProps {
  label?: string;
}

export function Input({ label, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <TextInput style={styles.label} value={label} editable={false} />}
      <TextInput
        style={[styles.input, getShadowStyle(Shadows.SOFT), style]}
        placeholderTextColor={Colors.GRAY_MED}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Spacing.COMPONENT,
  },
  label: {
    marginBottom: 8,
    color: Colors.TEXT,
    fontWeight: '600',
  },
  input: {
    height: 56,
    backgroundColor: Colors.BG_LIGHT,
    borderRadius: Radii.BUTTON,
    paddingHorizontal: Spacing.COMPONENT,
    color: Colors.TEXT,
    fontSize: 16,
  },
});