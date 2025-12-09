import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, Radii, Spacing } from '@/src/theme';

interface ChipProps {
  title: string;
  onPress: () => void;
  selected?: boolean;
  style?: ViewStyle;
}

export function Chip({ title, onPress, selected = false, style }: ChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.selected,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}>
      <ThemedText style={[styles.text, selected && styles.selectedText]}>
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.COMPONENT,
    paddingVertical: Spacing.LIST_GAP,
    backgroundColor: Colors.BG_ALT,
    borderRadius: Radii.BUTTON,
    marginRight: Spacing.LIST_GAP,
  },
  selected: {
    backgroundColor: Colors.BLACK,
  },
  text: {
    color: Colors.TEXT,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedText: {
    color: Colors.BG_LIGHT,
  },
});