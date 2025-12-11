import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  ScrollView, 
  Dimensions, 
  Platform, 
  RefreshControl, 
  Animated,
  StatusBar,
  Pressable
} from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SearchBar } from '@/components/ui/search-bar';
import { CategoryScroller } from '@/components/ui/category-scroller';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors as ThemeColors, Radii, Spacing, Shadows } from '@/src/theme';
import { db } from '@/src/firebase';
import { collection, query, orderBy, limit, onSnapshot, startAfter, DocumentSnapshot, QueryDocumentSnapshot } from 'firebase/firestore';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  images?: string[];
  createdAt: any;
  [key: string]: any;
}

interface Category {
  id: string;
  name: string;
}

// Helper functions
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

const generateGradientColors = (seed: string) => {
  // Create a hash from the seed string
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate two colors based on the hash
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 180) % 360;
  
  return {
    start: `hsl(${hue1}, 70%, 60%)`,
    end: `hsl(${hue2}, 70%, 60%)`
  };
};

// Skeleton Loading Component
const SkeletonCard = () => {
  const colorScheme = useColorScheme();
  const skeletonColor = colorScheme === 'dark' ? '#333333' : '#e0e0e0';
  const highlightColor = colorScheme === 'dark' ? '#444444' : '#f0f0f0';
  
  return (
    <View style={styles.skeletonCard}>
      <View style={[styles.skeletonImage, { backgroundColor: skeletonColor }]}>
        <Animated.View 
          style={[
            StyleSheet.absoluteFill, 
            { 
              backgroundColor: highlightColor,
              opacity: 0.5,
              transform: [{ translateX: -100 }]
            } 
          ]} 
        />
      </View>
      <View style={styles.skeletonTextContainer}>
        <View style={[styles.skeletonLine, { backgroundColor: skeletonColor, width: '80%' }]} />
        <View style={[styles.skeletonLine, { backgroundColor: skeletonColor, width: '60%' }]} />
      </View>
    </View>
  );
};

// Gradient Placeholder Component for products without images
const GradientPlaceholder = ({ productId }: { productId: string }) => {
  const colors = generateGradientColors(productId);
  
  return (
    <View 
      style={[
        styles.gradientPlaceholder,
        {
          backgroundColor: colors.start,
        }
      ]}
    >
      <View 
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.end,
            opacity: 0.7,
          }
        ]}
      />
      <IconSymbol 
        name="photo" 
        size={40} 
        color="#ffffff" 
        style={styles.placeholderIcon}
      />
    </View>
  );
};

// Custom Product Card Component
const ProductCard = ({ 
  product, 
  onPress,
  onHeartPress
}: { 
  product: Product; 
  onPress: () => void;
  onHeartPress: () => void;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));
  
  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
      // Use only one set of spring parameters
      stiffness: 1000,
      damping: 500,
      mass: 3,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      // Use only one set of spring parameters
      stiffness: 1000,
      damping: 500,
      mass: 3,
    }).start();
  };
  
  const toggleLike = () => {
    setIsLiked(!isLiked);
    onHeartPress();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };
  
  const imageUrl = product.images && product.images[0];
  
  return (
    <Animated.View 
      style={[
        styles.productCard,
        { transform: [{ scale: scaleValue }] }
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.productImageContainer}
      >
        {!imageUrl || imageError ? (
          <GradientPlaceholder productId={product.id} />
        ) : !imageLoaded ? (
          <View style={styles.skeletonImageContainer}>
            <SkeletonCard />
          </View>
        ) : null}
        
        {imageUrl && !imageError && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.productImage}
            contentFit="cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
      </Pressable>
      
      <View style={styles.productInfoContainer}>
        <ThemedText 
          type="defaultSemiBold" 
          style={styles.productTitle} 
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {product.name}
        </ThemedText>
        <ThemedText style={styles.productPrice}>
          ${product.price.toFixed(2)}
        </ThemedText>
      </View>
      
      <Pressable 
        style={styles.heartButton}
        onPress={toggleLike}
      >
        <IconSymbol 
          name={isLiked ? "heart.fill" : "heart"} 
          size={20} 
          color={isLiked ? "#FF7A00" : ThemeColors.GRAY_LIGHT} 
        />
      </Pressable>
    </Animated.View>
  );
};

// Empty State Component
const EmptyState = () => (
  <View style={styles.emptyStateContainer}>
    <View style={styles.slothContainer}>
      {/* Sloth illustration - simplified for this example */}
      <IconSymbol 
        name="questionmark.circle" 
        size={80} 
        color={ThemeColors.GRAY_MED} 
      />
    </View>
    <ThemedText type="subtitle" style={styles.emptyStateTitle}>
      Nothing here yet...
    </ThemedText>
    <ThemedText style={styles.emptyStateDescription}>
      Be the first to post a product
    </ThemedText>
    <Pressable style={styles.postButton}>
      <ThemedText style={styles.postButtonText}>Post the first product</ThemedText>
    </Pressable>
  </View>
);

// Promo Card Component with Parallax Effect
const PromoCard = ({ scrollY }: { scrollY: Animated.Value }) => {
  const animatedStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [0, 100],
          outputRange: [0, -15], // Move 1.5x slower than scroll
          extrapolate: 'clamp',
        }),
      },
    ],
  };
  
  return (
    <Animated.View style={[styles.promoCard, animatedStyle]}>
      <View style={styles.promoContent}>
        <ThemedText type="title" style={styles.promoTitle}>
          African Sunset Sale
        </ThemedText>
        <ThemedText style={styles.promoSubtitle}>
          Up to 70% off selected items
        </ThemedText>
        <ThemedText style={styles.promoDescription}>
          Limited time offer. Shop now!
        </ThemedText>
      </View>
      <View style={styles.promoImageContainer}>
        <IconSymbol 
          name="tag.fill" 
          size={80} 
          color="#FF7A00" 
        />
      </View>
    </Animated.View>
  );
};

export default function HomeFeedScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [notificationCount, setNotificationCount] = useState(3);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const router = useRouter(); // Initialize router

  // Calculate number of columns based on screen width
  const numColumns = useMemo(() => {
    const windowWidth = Dimensions.get('window').width;
    if (windowWidth >= 900) return 4; // Large tablets
    if (windowWidth >= 600) return 3; // Medium tablets/phones
    return 2; // Small phones
  }, []);
  
  // Fetch categories
  useEffect(() => {
    const categoriesQuery = query(
      collection(db, 'categories'),
      orderBy('name', 'asc')
    );
    
    const unsubscribeCategories = onSnapshot(categoriesQuery, 
      (snapshot) => {
        const categoriesData = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        setCategories(categoriesData);
        if (categoriesData.length > 0 && selectedCategory === null) {
          setSelectedCategory(categoriesData[0].id);
        }
      },
      (error) => {
        console.error('Error fetching categories:', error);
        const mockCategories = [
          { id: '1', name: 'Electronics' },
          { id: '2', name: 'Clothing' },
          { id: '3', name: 'Home' },
          { id: '4', name: 'Books' },
          { id: '5', name: 'Sports' },
        ];
        setCategories(mockCategories);
      }
    );
    
    return () => unsubscribeCategories();
  }, []);
  
  // Fetch products
  const fetchProducts = useCallback(async (isRefresh = false) => {
    if (!isRefresh && !hasMore) return;
    
    try {
      const productsRef = collection(db, 'products');
      let productsQuery;
      
      if (isRefresh) {
        productsQuery = query(
          productsRef,
          orderBy('createdAt', 'desc'),
          limit(20)
        );
      } else if (lastVisible) {
        productsQuery = query(
          productsRef,
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(20)
        );
      } else {
        productsQuery = query(
          productsRef,
          orderBy('createdAt', 'desc'),
          limit(20)
        );
      }
      
      const snapshot = await new Promise<any>((resolve, reject) => {
        const unsubscribe = onSnapshot(productsQuery, resolve, reject);
        setTimeout(() => reject(new Error('Timeout')), 10000);
      });
      
      const productsData = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
      
      if (isRefresh) {
        setProducts(productsData);
        setTrendingProducts(productsData.slice(0, 3));
      } else {
        setProducts(prev => [...prev, ...productsData]);
        if (productsData.length === 0) {
          setHasMore(false);
        }
      }
      
      setLastVisible(lastVisibleDoc);
      setHasMore(productsData.length === 20);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [lastVisible, hasMore]);
  
  // Initial fetch
  useEffect(() => {
    fetchProducts(true);
  }, []);
  
  // Handle pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts(true);
  }, [fetchProducts]);
  
  // Handle pagination
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      fetchProducts();
    }
  }, [loadingMore, hasMore, fetchProducts]);
  
  // Handle heart press with haptic feedback
  const handleHeartPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);
  
  // Handle product press
  const handleProductPress = useCallback((productId: string) => {
    console.log('Product pressed:', productId);
    // Navigate to product detail screen with productId as parameter
    router.push({
      pathname: "/product-detail",
      params: { productId: productId }
    });
  }, [router]);

  // Render item for FlatList
  const renderItem = useCallback(({ item }: { item: Product }) => (
    <View style={[styles.productItem, { width: `${100 / numColumns}%` }]}>
      <ProductCard 
        product={item} 
        onPress={() => handleProductPress(item.id)}
        onHeartPress={handleHeartPress}
      />
    </View>
  ), [numColumns, handleProductPress, handleHeartPress]);
  
  // Key extractor for FlatList
  const keyExtractor = useCallback((item: Product) => item.id, []);
  
  // Column wrapper style
  const columnWrapperStyle = useMemo(() => 
    numColumns > 1 ? styles.columnWrapper : undefined, 
  [numColumns]);
  
  // List empty component
  const listEmptyComponent = useMemo(() => 
    loading ? null : <EmptyState />, 
  [loading]);
  
  // Status bar color based on theme
  useEffect(() => {
    StatusBar.setBarStyle(colorScheme === 'dark' ? 'light-content' : 'dark-content');
  }, [colorScheme]);
  
  if (loading && products.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          {/* Custom spinner to match brand color */}
          <Animated.View 
            style={[
              styles.spinner,
              {
                borderColor: '#FF7A00',
                borderTopColor: 'transparent',
              }
            ]}
          />
          <ThemedText style={styles.loadingText}>Loading products...</ThemedText>
        </View>
      </ThemedView>
    );
  }
  
  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF7A00"
            colors={['#FF7A00', '#FFAA00']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Avatar 
            source="https://picsum.photos/200/200?random=7" 
            size={56} 
            showRing={true} 
          />
          <View style={styles.headerRight}>
            <View style={styles.notificationContainer}>
              <IconSymbol name="bell.fill" size={24} color={ThemeColors.ICON} />
              <Badge count={notificationCount} />
            </View>
          </View>
        </View>
        
        {/* Welcome Text */}
        <ThemedText type="title" style={styles.welcomeText}>
          Welcome back!
        </ThemedText>
        
        {/* Search Bar */}
        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products..."
        />
        
        {/* Promo Card with Parallax */}
        <PromoCard scrollY={scrollY} />
        
        {/* Categories */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Categories
        </ThemedText>
        <CategoryScroller 
          categories={categories}
          selectedCategory={selectedCategory as string}
          onSelectCategory={(categoryId) => setSelectedCategory(categoryId)}
        />
        
        {/* Products Grid */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Products
        </ThemedText>
        <FlatList
          data={products}
          keyExtractor={keyExtractor}
          numColumns={numColumns}
          columnWrapperStyle={columnWrapperStyle}
          contentContainerStyle={styles.productsGrid}
          renderItem={renderItem}
          ListEmptyComponent={listEmptyComponent}
          scrollEnabled={false} // Already inside ScrollView
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMoreContainer}>
                <Animated.View 
                  style={[
                    styles.smallSpinner,
                    {
                      borderColor: '#FF7A00',
                      borderTopColor: 'transparent',
                    }
                  ]}
                />
              </View>
            ) : null
          }
        />
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ThemeColors.BG_LIGHT,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.SCREEN_PADDING,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    marginBottom: Spacing.LIST_GAP,
    transform: [{ rotate: '0deg' }],
  },
  smallSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  loadingText: {
    color: ThemeColors.GRAY_MED,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.SCREEN_PADDING,
  },
  errorText: {
    color: ThemeColors.ALERT_RED,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.SECTION_GAP,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationContainer: {
    position: 'relative',
  },
  welcomeText: {
    marginBottom: Spacing.COMPONENT,
  },
  promoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF5EB', // Warm terracotta background
    borderRadius: Radii.CARD,
    padding: Spacing.COMPONENT,
    marginBottom: Spacing.SECTION_GAP,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
      },
    }),
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    marginBottom: Spacing.LIST_GAP,
    color: '#1A1A1A',
  },
  promoSubtitle: {
    color: ThemeColors.GRAY_MED,
    marginBottom: Spacing.LIST_GAP,
  },
  promoDescription: {
    color: '#FF7A00',
    fontWeight: '600',
  },
  promoImageContainer: {
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    marginTop: Spacing.SECTION_GAP,
    marginBottom: Spacing.LIST_GAP,
  },
  productsGrid: {
    paddingBottom: Spacing.SECTION_GAP,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productItem: {
    marginBottom: Spacing.LIST_GAP,
  },
  // Product Card Styles
  productCard: {
    backgroundColor: ThemeColors.BG_LIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
      },
    }),
  },
  productImageContainer: {
    height: 165, // 75% of 220dp
    backgroundColor: ThemeColors.GRAY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20, // Match card border radius
  },
  skeletonImageContainer: {
    width: '100%',
    height: '100%',
  },
  gradientPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    opacity: 0.7,
  },
  productInfoContainer: {
    padding: Spacing.LIST_GAP,
    height: 55, // 25% of 220dp
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ThemeColors.TEXT,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF7A00',
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
    }),
  },
  // Skeleton Styles
  skeletonCard: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
  },
  skeletonImage: {
    height: 165, // Match product image height
    width: '100%',
  },
  skeletonTextContainer: {
    padding: Spacing.LIST_GAP,
    height: 55, // Match product info container height
    justifyContent: 'center',
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  // Empty State Styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 80,
  },
  slothContainer: {
    marginBottom: Spacing.SECTION_GAP,
  },
  emptyStateTitle: {
    marginBottom: Spacing.LIST_GAP,
    color: ThemeColors.GRAY_MED,
  },
  emptyStateDescription: {
    marginBottom: Spacing.SECTION_GAP,
    color: ThemeColors.GRAY_MED,
  },
  postButton: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: Spacing.COMPONENT,
    paddingVertical: Spacing.LIST_GAP,
    borderRadius: Radii.BUTTON,
  },
  postButtonText: {
    color: ThemeColors.BG_LIGHT,
    fontWeight: '600',
  },
  loadingMoreContainer: {
    paddingVertical: Spacing.LIST_GAP,
    alignItems: 'center',
  },
});