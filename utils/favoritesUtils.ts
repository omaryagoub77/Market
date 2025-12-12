import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'user_favorites';

/**
 * Get all favorite product IDs from AsyncStorage
 * @returns Promise<string[]> - Array of product IDs
 */
export async function getFavoriteProducts(): Promise<string[]> {
  try {
    const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
    return favoritesJson ? JSON.parse(favoritesJson) : [];
  } catch (error) {
    console.error('Error getting favorite products:', error);
    return [];
  }
}

/**
 * Add a product to favorites
 * @param productId - The ID of the product to add
 * @returns Promise<boolean> - True if successful
 */
export async function addFavoriteProduct(productId: string): Promise<boolean> {
  try {
    const currentFavorites = await getFavoriteProducts();
    
    // Check if product is already in favorites
    if (currentFavorites.includes(productId)) {
      return false; // Already in favorites
    }
    
    // Add new product ID to favorites
    const updatedFavorites = [...currentFavorites, productId];
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    return true;
  } catch (error) {
    console.error('Error adding favorite product:', error);
    return false;
  }
}

/**
 * Remove a product from favorites
 * @param productId - The ID of the product to remove
 * @returns Promise<boolean> - True if successful
 */
export async function removeFavoriteProduct(productId: string): Promise<boolean> {
  try {
    const currentFavorites = await getFavoriteProducts();
    
    // Filter out the product ID to remove
    const updatedFavorites = currentFavorites.filter(id => id !== productId);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    return true;
  } catch (error) {
    console.error('Error removing favorite product:', error);
    return false;
  }
}

/**
 * Check if a product is in favorites
 * @param productId - The ID of the product to check
 * @returns Promise<boolean> - True if product is in favorites
 */
export async function isProductFavorite(productId: string): Promise<boolean> {
  try {
    const favorites = await getFavoriteProducts();
    return favorites.includes(productId);
  } catch (error) {
    console.error('Error checking if product is favorite:', error);
    return false;
  }
}

/**
 * Clear all favorites
 * @returns Promise<boolean> - True if successful
 */
export async function clearAllFavorites(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(FAVORITES_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing all favorites:', error);
    return false;
  }
}