import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, Text, RefreshControl, ScrollView, Dimensions, Animated } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import NavWrapper from '@/components/nav-wrapper';
import { ProductCard } from '@/components/ui/product-card';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';
import { db } from '@/src/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { getFavoriteProducts, removeFavoriteProduct } from '@/utils/favoritesUtils';

interface FavoriteProduct {
  id: string;
  title: string;
  price: string;
  images: string[];
  ownerId?: string;
  ownerName?: string;
  rating?: number;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate number of columns based on screen width - more conservative breakpoints
  const numColumns = useMemo(() => {
    const windowWidth = Dimensions.get('window').width;
    // Large devices (tablets and desktops) - 4 columns
    if (windowWidth >= 1024) return 4;
    // Medium devices (tablets) - 3 columns  
    if (windowWidth >= 768) return 3;
    // Small devices (phones) - 2 columns
    return 2;
  }, []);

  /**
   * Load favorite products from AsyncStorage and fetch their details from Firestore
   */
  const loadFavoriteProducts = async () => {
    try {
      setLoading(true);
      const favoriteIds = await getFavoriteProducts();
      
      if (favoriteIds.length === 0) {
        setFavoriteProducts([]);
        setLoading(false);
        return;
      }

      // Fetch product details from Firestore
      const productsRef = collection(db, 'products');
      const productsQuery = query(productsRef, where('__name__', 'in', favoriteIds.slice(0, 10))); // Limit to 10 for Firestore in query
      
      const querySnapshot = await getDocs(productsQuery);
      const products: FavoriteProduct[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          title: data.title,
          price: `$${data.price}`,
          images: data.images || [],
          ownerId: data.ownerId,
          ownerName: data.ownerName,
          rating: data.averageRating || data.rating,
        });
      });
      
      setFavoriteProducts(products);
    } catch (error) {
      console.error('Error loading favorite products:', error);
      alert('Failed to load favorite products');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh favorite products
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavoriteProducts();
    setRefreshing(false);
  };

  /**
   * Remove a product from favorites
   */
  const handleRemoveFavorite = async (productId: string) => {
    try {
      const success = await removeFavoriteProduct(productId);
      if (success) {
        // Update local state
        setFavoriteProducts(prev => prev.filter(product => product.id !== productId));
        alert('Product removed from favorites');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove product from favorites');
    }
  };

  /**
   * Navigate to product detail screen
   */
  const handleProductPress = (productId: string) => {
    router.push(`/screens/product-detail?productId=${productId}`);
  };

  useEffect(() => {
    loadFavoriteProducts();
  }, []);

  // Render a favorite product item
  const renderFavoriteItem = ({ item }: { item: FavoriteProduct }) => (
    <View style={[
      styles.productItem, 
      { width: `${100 / numColumns}%` }
    ]}>
      <ProductCard
        title={item.title}
        price={item.price}
        imageUrl={item.images[0] || 'https://picsum.photos/300/300?random=1'}
        sellerName={item.ownerName}
        rating={item.rating}
        onPress={() => handleProductPress(item.id)}
      />
      <View style={styles.productActions}>
        <Button
          title="Remove"
          variant="secondary"
          onPress={() => handleRemoveFavorite(item.id)}
          style={styles.removeButton}
        />
      </View>
    </View>
  );

  // Render empty state
  if (!loading && favoriteProducts.length === 0) {
    return (
      <NavWrapper>
        <ThemedView style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.emptyContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            <ThemedText type="title" style={styles.emptyTitle}>
              No Favorites Yet
            </ThemedText>
            <ThemedText style={styles.emptyDescription}>
              Start adding products to your favorites by tapping the "Add to Wishes" button on product pages.
            </ThemedText>
            <Button
              title="Browse Products"
              onPress={() => router.push('/home-feed')}
              style={styles.browseButton}
            />
          </ScrollView>
        </ThemedView>
      </NavWrapper>
    );
  }

  return (
    <NavWrapper>
      <ThemedView style={styles.container}>
        <FlatList
          data={favoriteProducts}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.productsGrid}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <ThemedText type="title" style={styles.header}>
              My Favorites
            </ThemedText>
          }
          showsVerticalScrollIndicator={false}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
          ListEmptyComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <Text>Loading favorites...</Text>
              </View>
            ) : null
          }
        />
      </ThemedView>
    </NavWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_LIGHT,
  },
  header: {
    marginBottom: Spacing.SECTION_GAP,
    marginTop: Spacing.SECTION_GAP,
    paddingHorizontal: Spacing.SCREEN_PADDING,
  },
  productsGrid: {
    padding: Spacing.SCREEN_PADDING,
    paddingBottom: Spacing.SECTION_GAP,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productItem: {
    marginBottom: Spacing.LIST_GAP,
    position: 'relative',
  },
  productActions: {
    padding: Spacing.COMPONENT,
  },
  removeButton: {
    height: 44,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.SECTION_GAP,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.SCREEN_PADDING,
  },
  emptyTitle: {
    marginBottom: Spacing.LIST_GAP,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    color: Colors.GRAY_MED,
    marginBottom: Spacing.SECTION_GAP,
  },
  browseButton: {
    width: '80%',
  },
});