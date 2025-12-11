import React from 'react';
import { View, StyleSheet, Image, Platform } from 'react-native';
import { Colors, Shadows } from '@/src/theme';

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

interface AvatarProps {
  source: string;
  size?: number;
  showRing?: boolean;
}

export function Avatar({ source, size = 56, showRing = false }: AvatarProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {showRing && <View style={[styles.ring, { width: size + 8, height: size + 8 }]} />}
      <View style={[styles.avatarWrapper, { width: size, height: size }, getShadowStyle(Shadows.SOFT)]}>
        <Image
          source={{ uri: source }}
          style={[styles.avatar, { width: size, height: size }]}
        />
      </View>
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
  avatarWrapper: {
    borderRadius: 9999,
    overflow: 'hidden',
  },
  avatar: {
    borderRadius: 9999,
  },
});