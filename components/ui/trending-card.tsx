import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, Radii, Shadows, Spacing } from '@/src/theme';
import { StarRating } from '@/components/ui/star-rating';

interface TrendingCardProps {
  title: string;
  price: string;
  imageUrl: string;
  sellerName?: string;
  rating?: number;
  onPress: () => void;
}

export function TrendingCard({ title, price, imageUrl, sellerName, rating, onPress }: TrendingCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.title}>
          {title}
        </ThemedText>
        {sellerName && (
          <ThemedText style={styles.sellerName} numberOfLines={1}>
            by {sellerName}
          </ThemedText>
        )}
        {rating !== undefined && (
          <View style={styles.ratingContainer}>
            <StarRating rating={rating} size={12} />
          </View>
        )}
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
    borderRadius: 20, // Slightly smaller radius for trending cards
    ...Shadows.SOFT,
    overflow: 'hidden',
    width: 160, // Fixed width for trending cards
    height: 200, // Fixed height for trending cards
  },
  image: {
    width: '100%',
    height: 100, // Smaller image height for trending cards
  },
  content: {
    padding: Spacing.LIST_GAP, // Smaller padding for trending cards
  },
  title: {
    fontSize: 14, // Smaller font for trending cards
  },
  sellerName: {
    color: Colors.GRAY_MED,
    fontSize: 10, // Smaller font for seller name
    marginTop: 2,
  },
  ratingContainer: {
    marginVertical: 2,
  },
  price: {
    color: Colors.PRIMARY_START,
    fontSize: 14, // Smaller font for price
    marginTop: 2,
  },
});