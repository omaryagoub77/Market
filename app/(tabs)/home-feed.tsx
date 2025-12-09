import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SearchBar } from '@/components/ui/search-bar';
import { CategoryScroller } from '@/components/ui/category-scroller';
import { ProductCard } from '@/components/ui/product-card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';

// Mock data
const categories = [
  { id: '1', name: 'Electronics' },
  { id: '2', name: 'Clothing' },
  { id: '3', name: 'Home' },
  { id: '4', name: 'Books' },
  { id: '5', name: 'Sports' },
];

const products = [
  { id: '1', title: 'Wireless Headphones', price: '$99.99', imageUrl: 'https://picsum.photos/300/300?random=1' },
  { id: '2', title: 'Smart Watch', price: '$199.99', imageUrl: 'https://picsum.photos/300/300?random=2' },
  { id: '3', title: 'Bluetooth Speaker', price: '$79.99', imageUrl: 'https://picsum.photos/300/300?random=3' },
  { id: '4', title: 'Laptop Stand', price: '$49.99', imageUrl: 'https://picsum.photos/300/300?random=4' },
  { id: '5', title: 'Phone Case', price: '$29.99', imageUrl: 'https://picsum.photos/300/300?random=5' },
  { id: '6', title: 'Desk Lamp', price: '$39.99', imageUrl: 'https://picsum.photos/300/300?random=6' },
];

export default function HomeFeedScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('1');
  const [notificationCount, setNotificationCount] = useState(3);

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Avatar 
          source="https://picsum.photos/200/200?random=7" 
          size={56} 
          showRing={true} 
        />
        <View style={styles.headerRight}>
          <View style={styles.notificationContainer}>
            <IconSymbol name="bell.fill" size={24} color={Colors.ICON} />
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

      {/* Categories */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Categories
      </ThemedText>
      <CategoryScroller 
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Trending Products */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Trending
      </ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendingContainer}>
        {products.slice(0, 3).map((product) => (
          <View key={product.id} style={styles.trendingCard}>
            <ProductCard 
              title={product.title}
              price={product.price}
              imageUrl={product.imageUrl}
              onPress={() => console.log('Product pressed')}
            />
          </View>
        ))}
      </ScrollView>

      {/* All Products */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        All Products
      </ThemedText>
      <FlatList
        data={products}
        numColumns={2}
        columnWrapperStyle={styles.productGrid}
        contentContainerStyle={styles.productList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <ProductCard 
              title={item.title}
              price={item.price}
              imageUrl={item.imageUrl}
              onPress={() => console.log('Product pressed')}
            />
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.SCREEN_PADDING,
    backgroundColor: Colors.BG_LIGHT,
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
  sectionTitle: {
    marginTop: Spacing.SECTION_GAP,
    marginBottom: Spacing.LIST_GAP,
  },
  trendingContainer: {
    marginBottom: Spacing.SECTION_GAP,
  },
  trendingCard: {
    width: 160,
    marginRight: Spacing.LIST_GAP,
  },
  productGrid: {
    justifyContent: 'space-between',
  },
  productList: {
    paddingBottom: Spacing.SECTION_GAP,
  },
  productItem: {
    width: '48%',
    marginBottom: Spacing.LIST_GAP,
  },
});