import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii, Shadows, Spacing } from '@/src/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <IconSymbol name="magnifyingglass" size={20} color={Colors.GRAY_MED} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.GRAY_MED}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.BG_LIGHT,
    borderRadius: Radii.BUTTON,
    paddingHorizontal: Spacing.COMPONENT,
    ...Shadows.SOFT,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: Spacing.LIST_GAP,
    color: Colors.TEXT,
    fontSize: 16,
  },
});