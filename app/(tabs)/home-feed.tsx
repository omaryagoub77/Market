import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, FlatList, ScrollView, Dimensions, Platform, RefreshControl, StatusBar, Pressable, Animated } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import NavWrapper from '@/components/nav-wrapper';
import { SearchBar } from '@/components/ui/search-bar';
import { CategoryScroller } from '@/components/ui/category-scroller';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors as ThemeColors, Radii, Spacing, Shadows } from '@/src/theme';
import { db } from '@/src/firebase';
import { collection, query, orderBy, limit, onSnapshot, startAfter, DocumentSnapshot, QueryDocumentSnapshot, doc } from 'firebase/firestore';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/utils/userProfile';

// Define categories as a single source of truth (same as in post-item.tsx)
const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'phones-accessories', name: 'Phones & Accessories' },
  { id: 'computers-laptops', name: 'Computers & Laptops' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'shoes', name: 'Shoes' },
  { id: 'beauty-personal-care', name: 'Beauty & Personal Care' },
  { id: 'home-furniture', name: 'Home & Furniture' },
  { id: 'kitchen-appliances', name: 'Kitchen Appliances' },
  { id: 'groceries', name: 'Groceries' },
  { id: 'sports-fitness', name: 'Sports & Fitness' },
  { id: 'vehicles', name: 'Vehicles' },
  { id: 'vehicle-parts', name: 'Vehicle Parts' },
  { id: 'real-estate', name: 'Real Estate' },
  { id: 'jobs', name: 'Jobs' },
  { id: 'services', name: 'Services' },
  { id: 'education', name: 'Education' },
  { id: 'books', name: 'Books' },
  { id: 'kids-baby', name: 'Kids & Baby' },
  { id: 'health', name: 'Health' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'others', name: 'Others' },
];

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  images?: string[];
  createdAt: any;
  category?: string;
  [key: string]: any;
}

// Gradient Placeholder Component for products without images
const GradientPlaceholder = React.memo(({ productId }: { productId: string }) => {
  const generateGradientColors = () => {
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      hash = productId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue1 = Math.abs(hash) % 360;
    const hue2 = (hue1 + 180) % 360;
    
    return {
      start: `hsl(${hue1}, 70%, 60%)`,
      end: `hsl(${hue2}, 70%, 60%)`
    };
  };
  
  const colors = generateGradientColors();
  
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
});

// No Products Component
const NoProductsInCategory = React.memo(({ category }: { category: string }) => (
  <View style={styles.noProductsContainer}>
    <IconSymbol 
      name="exclamationmark.triangle" 
      size={48} 
      color={ThemeColors.GRAY_MED} 
    />
    <ThemedText type="subtitle" style={styles.noProductsTitle}>
      No products found
    </ThemedText>
    <ThemedText style={styles.noProductsDescription}>
      There are no products in the "{category}" category yet.
    </ThemedText>
  </View>
));

// Promo Card Component with Parallax Effect
const PromoCard = React.memo(({ scrollY }: { scrollY: Animated.Value }) => {
  const animatedStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [0, 100],
          outputRange: [0, -15],
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
});

// Memoized Product Card Component
const ProductCard = React.memo(({ 
  product, 
  onPress,
  onHeartPress,
  onHeartToggle
}: { 
  product: Product; 
  onPress: () => void;
  onHeartPress: () => void;
  onHeartToggle: () => void;
}) => {
  const [isLiked, setIsLiked] = useState(false);
  
  const handleHeartPress = () => {
    setIsLiked(!isLiked);
    onHeartToggle();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };
  
  return (
    <View style={styles.productCard}>
      <Pressable
        onPress={onPress}
        style={styles.productImageContainer}
      >
        {product.images && product.images[0] ? (
          <Image
            source={{ uri: product.images[0] }}
            style={styles.productImage}
            contentFit="cover"
          />
        ) : (
          <GradientPlaceholder productId={product.id} />
        )}
        <Pressable 
          style={styles.heartButton}
          onPress={handleHeartPress}
        >
          <IconSymbol 
            name={isLiked ? "heart.fill" : "heart"} 
            size={20} 
            color={isLiked ? "#FF7A00" : ThemeColors.BG_LIGHT} 
          />
        </Pressable>
      </Pressable>
      <View style={styles.productInfo}>
        <ThemedText type="defaultSemiBold" numberOfLines={1} ellipsizeMode="tail">
          {product.name}
        </ThemedText>
        <ThemedText type="subtitle">${product.price.toFixed(2)}</ThemedText>
      </View>
    </View>
  );
});

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
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Calculate number of columns based on screen width - 4 on large devices, 2 on small phones
  const numColumns = useMemo(() => {
    const windowWidth = Dimensions.get('window').width;
    if (windowWidth >= 1024) return 4; // Large devices (desktop/tablets)
    if (windowWidth >= 768) return 3; // Medium devices (tablets)
    return 2; // Small phones
  }, []);
  
  // Filter products based on selected category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      return products;
    }
    return products.filter(product => product.category === selectedCategory);
  }, [products, selectedCategory]);
  
  // Check if there are products in the current category
  const hasProductsInCategory = useMemo(() => {
    return filteredProducts.length > 0;
  }, [filteredProducts]);
  
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
    router.push({
      pathname: "/screens/product-detail",
      params: { productId: productId }
    });
  }, [router]);

  // Handle category selection with animation
  const handleCategorySelect = useCallback((categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(categoryId);
  }, []);
  
  // Render item for FlatList
  const renderItem = useCallback(({ item }: { item: Product }) => (
    <View style={[styles.productItem, { width: `${100 / numColumns}%` }]}>
      <ProductCard 
        product={item} 
        onPress={() => handleProductPress(item.id)}
        onHeartPress={handleHeartPress}
        onHeartToggle={() => handleHeartPress()}
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
    loading ? null : hasProductsInCategory ? null : <NoProductsInCategory category={selectedCategory === 'all' ? 'All' : CATEGORIES.find(c => c.id === selectedCategory)?.name || selectedCategory} />,
  [loading, hasProductsInCategory, selectedCategory]);
  
  // Status bar color based on theme
  useEffect(() => {
    StatusBar.setBarStyle(colorScheme === 'dark' ? 'light-content' : 'dark-content');
  }, [colorScheme]);
  
  // Subscribe to user profile updates
  useEffect(() => {
    if (!currentUser) return;
    
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setUserProfile(doc.data());
      } else {
        setUserProfile(null);
      }
    });
    
    return () => unsubscribe();
  }, [currentUser]);

  if (loading && products.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
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
    <NavWrapper>
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
            <Pressable onPress={() => router.push('/profile')}>
              <Avatar 
                source={userProfile?.photoURL || currentUser?.photoURL || "https://picsum.photos/200/200?random=7"} 
                size={56} 
                showRing={true} 
              />
            </Pressable>
            
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
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
          
          {/* Products Grid */}
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Products' : `${CATEGORIES.find(c => c.id === selectedCategory)?.name || selectedCategory} Products`}
          </ThemedText>
          <FlatList
            data={filteredProducts}
            keyExtractor={keyExtractor}
            numColumns={numColumns}
            columnWrapperStyle={columnWrapperStyle}
            contentContainerStyle={styles.productsGrid}
            renderItem={renderItem}
            ListEmptyComponent={listEmptyComponent}
            scrollEnabled={false}
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
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
          />
        </Animated.ScrollView>
      </ThemedView>
    </NavWrapper>
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
    marginBottom: Spacing.LIST_GAP,
  },
  sectionTitle: {
    marginTop: Spacing.SECTION_GAP,
    marginBottom: Spacing.LIST_GAP,
  },
  promoCard: {
    backgroundColor: '#FF7A00',
    borderRadius: Radii.CARD,
    padding: Spacing.COMPONENT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadows.MED,
    minHeight: 120,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    color: ThemeColors.BG_LIGHT,
    marginBottom: Spacing.LIST_GAP,
  },
  promoSubtitle: {
    color: ThemeColors.BG_LIGHT,
    marginBottom: Spacing.LIST_GAP,
  },
  promoDescription: {
    color: ThemeColors.BG_LIGHT,
    opacity: 0.9,
  },
  promoImageContainer: {
    marginLeft: Spacing.COMPONENT,
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
  productCard: {
    backgroundColor: ThemeColors.BG_LIGHT,
    borderRadius: Radii.CARD,
    overflow: 'hidden',
    ...Shadows.SOFT,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 180,
  },
  gradientPlaceholder: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    opacity: 0.7,
  },
  heartButton: {
    position: 'absolute',
    top: Spacing.LIST_GAP,
    right: Spacing.LIST_GAP,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 32,
    height: 32,
    borderRadius: Radii.CIRCLE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: Spacing.LIST_GAP,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: Radii.CIRCLE,
    borderWidth: 3,
    marginBottom: Spacing.LIST_GAP,
  },
  loadingText: {
    color: ThemeColors.GRAY_MED,
  },
  loadingMoreContainer: {
    paddingVertical: Spacing.LIST_GAP,
    alignItems: 'center',
  },
  smallSpinner: {
    width: 24,
    height: 24,
    borderRadius: Radii.CIRCLE,
    borderWidth: 2,
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
  noProductsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noProductsTitle: {
    marginTop: Spacing.COMPONENT,
    marginBottom: Spacing.LIST_GAP,
  },
  noProductsDescription: {
    color: ThemeColors.GRAY_MED,
    textAlign: 'center',
    paddingHorizontal: Spacing.SCREEN_PADDING,
  },
});