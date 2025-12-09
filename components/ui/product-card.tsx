import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, Radii, Shadows, Spacing } from '@/src/theme';

interface ProductCardProps {
  title: string;
  price: string;
  imageUrl: string;
  onPress: () => void;
}

export function ProductCard({ title, price, imageUrl, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>
          {title}
        </ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.price}>
          {price}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.BG_LIGHT,
    borderRadius: Radii.CARD,
    ...Shadows.SOFT,
    overflow: 'hidden',
    width: '100%',
  },
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    padding: Spacing.COMPONENT,
  },
  price: {
    color: Colors.PRIMARY_START,
    marginTop: 4,
  },
});