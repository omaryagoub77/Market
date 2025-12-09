import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/src/theme';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
}

export function StarRating({ rating, maxStars = 5, size = 20 }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <View style={styles.container}>
      {[...Array(maxStars)].map((_, index) => {
        let starFilled = false;

        if (index < fullStars) {
          starFilled = true;
        }

        return (
          <IconSymbol
            key={index}
            name={starFilled ? 'star.fill' : 'star'}
            size={size}
            color={starFilled ? Colors.PRIMARY_START : Colors.GRAY_LIGHT}
            style={styles.star}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  star: {
    marginHorizontal: 2,
  },
});