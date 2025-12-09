import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Colors, Shadows } from '@/src/theme';

interface AvatarProps {
  source: string;
  size?: number;
  showRing?: boolean;
}

export function Avatar({ source, size = 56, showRing = false }: AvatarProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {showRing && <View style={[styles.ring, { width: size + 8, height: size + 8 }]} />}
      <Image
        source={{ uri: source }}
        style={[styles.avatar, { width: size, height: size }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: Colors.PRIMARY_START,
  },
  avatar: {
    borderRadius: 9999,
    ...Shadows.SOFT,
  },
});