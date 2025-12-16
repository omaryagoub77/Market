import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import NavWrapper from '@/components/nav-wrapper';
import { ProductCard } from '@/components/ui/product-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';
import { db } from '@/src/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

export default function MyProductsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (!user) {
      router.replace('/auth/login');
      return;
    }

    // Fetch user's products from Firestore
    const productsQuery = query(
      collection(db, 'products'),
      where('ownerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(productsQuery,
      (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setProducts(productsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  const handleEditProduct = (productId: string) => {
    // Navigate to edit product screen
    router.push({
      pathname: "./edit-product/[id]",
      params: { id: productId }
    });
  };

  const handleDeleteProduct = (productId: string, productTitle: string) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${productTitle}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'products', productId));
              Alert.alert('Success', 'Product deleted successfully!');
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY_START} />
          <ThemedText style={styles.loadingText}>Loading your products...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <NavWrapper>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
          
          <ThemedText type="title" style={styles.header}>
            My Products
          </ThemedText>
          
          {products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>You haven't posted any products yet.</ThemedText>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push('/post-item')}
              >
                <ThemedText style={styles.addButtonText}>Post Your First Product</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.productsContainer}>
              {products.map((product) => (
                <View key={product.id} style={styles.productItem}>
                  <ProductCard 
                    title={product.title}
                    price={`$${product.price}`}
                    imageUrl={product.images?.[0] || 'https://picsum.photos/300/300?random=1'}
                    sellerName={product.ownerName || 'Unknown Seller'}
                    onPress={() => router.push({
                      pathname: "../screens/product-detail",
                      params: { productId: product.id }
                    })}
                  />
                  <View style={styles.productActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => handleEditProduct(product.id)}
                    >
                      <IconSymbol name="pencil" size={16} color={Colors.BG_LIGHT} />
                      <ThemedText style={styles.buttonText}>Edit</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteProduct(product.id, product.title)}
                    >
                      <IconSymbol name="trash" size={16} color={Colors.BG_LIGHT} />
                      <ThemedText style={styles.buttonText}>Delete</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </NavWrapper>
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
  contentContainer: {
    padding: Spacing.SCREEN_PADDING,
  },
  errorText: {
    color: Colors.ALERT_RED,
    textAlign: 'center',
    marginBottom: Spacing.LIST_GAP,
  },
  header: {
    marginBottom: Spacing.SECTION_GAP,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.SECTION_GAP,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: Spacing.SECTION_GAP,
    color: Colors.GRAY_MED,
  },
  addButton: {
    backgroundColor: Colors.PRIMARY_START,
    paddingHorizontal: Spacing.SECTION_GAP,
    paddingVertical: Spacing.COMPONENT,
    borderRadius: Radii.BUTTON,
  },
  addButtonText: {
    color: Colors.BG_LIGHT,
    fontWeight: '600',
  },
  productsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productItem: {
    width: '48%',
    marginBottom: Spacing.LIST_GAP,
    position: 'relative',
  },
  productActions: {
    position: 'absolute',
    top: Spacing.COMPONENT,
    right: Spacing.COMPONENT,
    flexDirection: 'row',
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: Radii.CIRCLE,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.LIST_GAP,
  },
  editIcon: {
    backgroundColor: Colors.PRIMARY_START,
  },
  deleteIcon: {
    backgroundColor: Colors.ALERT_RED,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.LIST_GAP,
    paddingVertical: Spacing.LIST_GAP / 2,
    borderRadius: Radii.BUTTON,
    marginLeft: Spacing.LIST_GAP,
  },
  editButton: {
    backgroundColor: Colors.PRIMARY_START,
  },
  deleteButton: {
    backgroundColor: Colors.ALERT_RED,
  },
  buttonText: {
    color: Colors.BG_LIGHT,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: Spacing.LIST_GAP / 2,
  },
});