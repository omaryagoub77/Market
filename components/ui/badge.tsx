import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors, Radii } from '@/src/theme';

interface BadgeProps {
  count: number;
}

export function Badge({ count }: BadgeProps) {
  if (count <= 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{count > 99 ? '99+' : count.toString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.ALERT_RED,
    borderRadius: Radii.CIRCLE,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: Colors.BG_LIGHT,
    fontSize: 10,
    fontWeight: 'bold',
  },
});