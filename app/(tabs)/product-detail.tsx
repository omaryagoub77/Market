import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { StarRating } from '@/components/ui/star-rating';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';

const { width } = Dimensions.get('window');

// Mock product data
const product = {
  id: '1',
  title: 'Wireless Headphones',
  price: '$99.99',
  description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
  images: [
    'https://picsum.photos/600/600?random=1',
    'https://picsum.photos/600/600?random=2',
    'https://picsum.photos/600/600?random=3',
  ],
  rating: 4.5,
  reviewCount: 128,
  sizes: ['S', 'M', 'L', 'XL'],
  seller: 'TechStore',
};

export default function ProductDetailScreen() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');

  return (
    <ThemedView style={styles.container}>
      {/* Product Images */}
      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        style={styles.imageSlider}
        onScroll={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setSelectedImageIndex(index);
        }}
      >
        {product.images.map((image, index) => (
          <Image 
            key={index} 
            source={{ uri: image }} 
            style={styles.productImage} 
          />
        ))}
      </ScrollView>

      {/* Image Indicators */}
      <View style={styles.indicatorContainer}>
        {product.images.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.indicator, 
              index === selectedImageIndex && styles.activeIndicator
            ]} 
          />
        ))}
      </View>

      {/* Product Info */}
      <ScrollView style={styles.contentContainer}>
        <ThemedText type="title" style={styles.title}>
          {product.title}
        </ThemedText>

        <View style={styles.priceRatingContainer}>
          <ThemedText type="subtitle" style={styles.price}>
            {product.price}
          </ThemedText>
          <View style={styles.ratingContainer}>
            <StarRating rating={product.rating} size={16} />
            <ThemedText style={styles.reviewCount}>
              ({product.reviewCount})
            </ThemedText>
          </View>
        </View>

        <ThemedText style={styles.description}>
          {product.description}
        </ThemedText>

        {/* Size Selection */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Size
        </ThemedText>
        <View style={styles.sizeContainer}>
          {product.sizes.map((size) => (
            <Chip
              key={size}
              title={size}
              selected={selectedSize === size}
              onPress={() => setSelectedSize(size)}
            />
          ))}
        </View>

        {/* Seller Info */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Seller
        </ThemedText>
        <ThemedText style={styles.sellerName}>
          {product.seller}
        </ThemedText>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button 
          title="Contact Seller" 
          variant="secondary" 
          onPress={() => console.log('Contact seller')}
          style={styles.contactButton}
        />
        <Button 
          title="Add to Cart" 
          onPress={() => console.log('Add to cart')}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_LIGHT,
  },
  imageSlider: {
    height: Dimensions.get('window').height * 0.55,
  },
  productImage: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.LIST_GAP,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: Radii.CIRCLE,
    backgroundColor: Colors.GRAY_LIGHT,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: Colors.PRIMARY_START,
  },
  contentContainer: {
    flex: 1,
    padding: Spacing.SCREEN_PADDING,
  },
  title: {
    marginBottom: Spacing.LIST_GAP,
  },
  priceRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.SECTION_GAP,
  },
  price: {
    color: Colors.PRIMARY_START,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCount: {
    marginLeft: Spacing.LIST_GAP,
    color: Colors.GRAY_MED,
  },
  description: {
    marginBottom: Spacing.SECTION_GAP,
  },
  sectionTitle: {
    marginBottom: Spacing.LIST_GAP,
  },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.SECTION_GAP,
  },
  sellerName: {
    marginBottom: Spacing.SECTION_GAP,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: Spacing.SCREEN_PADDING,
    gap: Spacing.LIST_GAP,
  },
  contactButton: {
    flex: 1,
  },
});