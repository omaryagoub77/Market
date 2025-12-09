import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/src/theme';

interface HeaderProps {
  title: string;
  rightComponent?: React.ReactNode;
}

export function Header({ title, rightComponent }: HeaderProps) {
  return (
    <View style={styles.container}>
      <ThemedText type="title">{title}</ThemedText>
      {rightComponent && <View style={styles.rightComponent}>{rightComponent}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.COMPONENT,
    paddingHorizontal: Spacing.SCREEN_PADDING,
    backgroundColor: Colors.BG_LIGHT,
  },
  rightComponent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});