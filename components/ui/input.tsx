import React from 'react';
import { TextInput, StyleSheet, View, TextInputProps } from 'react-native';
import { Colors, Radii, Shadows, Spacing } from '@/src/theme';

interface InputProps extends TextInputProps {
  label?: string;
}

export function Input({ label, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <TextInput style={styles.label} value={label} editable={false} />}
      <TextInput
        style={[styles.input, style]}
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
    ...Shadows.SOFT,
    color: Colors.TEXT,
    fontSize: 16,
  },
});