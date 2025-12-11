import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { StarRating } from '@/components/ui/star-rating';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';
import { db } from '@/src/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { createOrGetChatRoom } from '@/utils/chatUtils';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Get productId from route params
  const { productId } = useLocalSearchParams();
  // Initialize router for navigation
  const router = useRouter();
  // Get current user
  const { user } = useAuth();

  // Validate productId
  useEffect(() => {
    if (!productId || typeof productId !== "string") {
      setError("Invalid product ID");
      setLoading(false);
      return;
    }
  }, [productId]);

  // Fetch the actual product from Firestore
  useEffect(() => {
    // Skip if productId is invalid
    if (!productId || typeof productId !== "string") {
      return;
    }

    const productRef = doc(db, 'products', productId);
    const unsubscribe = onSnapshot(productRef,
      (doc) => {
        if (doc.exists()) {
          setProduct({ id: doc.id, ...doc.data() });
        } else {
          setError('Product not found');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching product:', error);
        setError('Failed to load product details. Please try again later.');
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [productId]);

  // Handle contact seller button press
  const handleContactSeller = async () => {
    // Check if user is logged in
    if (!user) {
      // Store the current page as redirect URL and go to login
      router.push('/auth/login');
      return;
    }
    
    // Navigate to chat room with seller ID
    if (product && product.ownerId) {
      // Create or get chat room before navigating
      try {
        const chatId = await createOrGetChatRoom(user.uid, product.ownerId);
        router.push({
          pathname: "/(tabs)/chat-room",
          params: { sellerId: product.ownerId, chatId, productId: product.id }
        });
      } catch (error) {
        console.error('Error creating chat room:', error);
        // Fallback to navigation without chatId
        router.push({
          pathname: "/(tabs)/chat-room",
          params: { sellerId: product.ownerId, productId: product.id }
        });
      }
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY_START} />
          <ThemedText style={styles.loadingText}>Loading product details...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error || !product) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error || 'Product not found'}</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        {/* Product Images */}
        <View style={styles.imageSliderContainer}>
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
            {product.images?.map((image: string, index: number) => (
              <Image 
                key={index} 
                source={{ uri: image }} 
                style={styles.productImage} 
              />
            ))}
          </ScrollView>

          {/* Image Indicators */}
          <View style={styles.indicatorContainer}>
            {product.images?.map((_: string, index: number) => (
              <View 
                key={index} 
                style={[
                  styles.indicator, 
                  index === selectedImageIndex && styles.activeIndicator
                ]} 
              />
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.contentContainer}>
          <ThemedText type="title" style={styles.title}>
            {product.title}
          </ThemedText>

          <View style={styles.priceRatingContainer}>
            <ThemedText type="subtitle" style={styles.price}>
              ${product.price}
            </ThemedText>
            <View style={styles.ratingContainer}>
              <StarRating rating={product.rating || 0} size={16} />
              <ThemedText style={styles.reviewCount}>
                ({product.reviewCount || 0})
              </ThemedText>
            </View>
          </View>

          <ThemedText style={styles.description}>
            {product.description}
          </ThemedText>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Size
              </ThemedText>
              <View style={styles.sizeContainer}>
                {product.sizes.map((size: string) => (
                  <Chip
                    key={size}
                    title={size}
                    selected={selectedSize === size}
                    onPress={() => setSelectedSize(size)}
                  />
                ))}
              </View>
            </>
          )}

          {/* Seller Info */}
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Seller
          </ThemedText>
          <ThemedText style={styles.sellerName}>
            {product.ownerName || 'Unknown Seller'}
          </ThemedText>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button 
              title="Contact Seller" 
              variant="secondary" 
              onPress={handleContactSeller}
              style={styles.contactButton}
            />
            <Button 
              title="Add to Cart" 
              onPress={() => console.log('Add to cart')}
            />
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_LIGHT,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.LIST_GAP,
    color: Colors.GRAY_MED,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.ALERT_RED,
    textAlign: 'center',
  },
  imageSliderContainer: {
    height: Dimensions.get('window').height * 0.55,
    position: 'relative',
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
    gap: Spacing.LIST_GAP,
    marginTop: Spacing.SECTION_GAP,
    marginBottom: Spacing.SECTION_GAP,
  },
  contactButton: {
    flex: 1,
  },
});