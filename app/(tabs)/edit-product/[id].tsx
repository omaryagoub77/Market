import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import NavWrapper from '@/components/nav-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Colors, Spacing, Radii } from '@/src/theme';
import { db } from '@/src/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '@/src/cloudinary';

export default function EditProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (!user) {
      router.replace('/auth/login');
      return;
    }

    // Validate product ID
    if (!id || typeof id !== 'string') {
      setError('Invalid product ID');
      setLoading(false);
      return;
    }

    // Fetch product details
    const fetchProduct = async () => {
      try {
        const productRef = doc(db, 'products', id);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          const productData = productSnap.data();
          
          // Check if user is the owner
          if (productData.ownerId !== user.uid) {
            setError('You are not authorized to edit this product');
            setLoading(false);
            return;
          }
          
          setTitle(productData.title || '');
          setDescription(productData.description || '');
          setPrice(productData.price?.toString() || '');
          setCategory(productData.category || '');
          setImages(productData.images || []);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user]);

  const handleAddImage = async () => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    try {
      setImageUploading(true);
      
      // Launch image picker
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setImages([...images, imageUri]);
      }
    } catch (error) {
      setError('Failed to select image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleUpdateProduct = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    
    if (!price || isNaN(parseFloat(price))) {
      setError('Please enter a valid price');
      return;
    }
    
    if (!category.trim()) {
      setError('Please select a category');
      return;
    }
    
    setUpdating(true);
    setError('');
    
    try {
      // Upload new images to Cloudinary if any
      const uploadedImageUrls = [];
      for (const imageUri of images) {
        // Only upload new images (local URIs), skip existing URLs
        if (imageUri.startsWith('http')) {
          uploadedImageUrls.push(imageUri); // Existing image URL
        } else {
          try {
            const imageUrl = await uploadImageToCloudinary(imageUri);
            uploadedImageUrls.push(imageUrl);
          } catch (uploadError) {
            throw new Error('Failed to upload image. Please try again.');
          }
        }
      }
      
      const productRef = doc(db, 'products', id as string);
      await updateDoc(productRef, {
        title,
        description,
        price: parseFloat(price),
        category,
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined, // Only update if there are images
        updatedAt: new Date(),
      });
      
      Alert.alert('Success', 'Product updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product. Please try again.');
    } finally {
      setUpdating(false);
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

  return (
    <NavWrapper>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
          
          <ThemedText type="title" style={styles.header}>
            Edit Product
          </ThemedText>
          
          {/* Image Upload Section */}
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Photos
          </ThemedText>
          <View style={styles.imageUploadContainer}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.uploadedImage} />
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <ThemedText style={styles.removeButtonText}>×</ThemedText>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity 
              style={styles.addImageButton}
              onPress={handleAddImage}
              disabled={imageUploading}
            >
              <ThemedText style={styles.addImageText}>
                {imageUploading ? "..." : "+"}
              </ThemedText>
            </TouchableOpacity>
          </View>
          
          <Input
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Enter product title"
            style={styles.input}
          />
          
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Enter product description"
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />
          
          <Input
            label="Price ($)"
            value={price}
            onChangeText={setPrice}
            placeholder="Enter price"
            keyboardType="numeric"
            style={styles.input}
          />
          
          <Input
            label="Category"
            value={category}
            onChangeText={setCategory}
            placeholder="Enter category"
            style={styles.input}
          />
          
          <View style={styles.buttonContainer}>
            <Button
              title={updating ? "Updating..." : "Update Product"}
              onPress={handleUpdateProduct}
              disabled={updating}
              style={styles.updateButton}
            />
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => router.back()}
              disabled={updating}
              style={styles.cancelButton}
            />
          </View>
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
  input: {
    marginBottom: Spacing.LIST_GAP,
  },
  textArea: {
    marginBottom: Spacing.LIST_GAP,
    height: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.SECTION_GAP,
  },
  updateButton: {
    flex: 1,
    marginRight: Spacing.LIST_GAP,
  },
  cancelButton: {
    flex: 1,
    marginLeft: Spacing.LIST_GAP,
  },
  imageUploadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.LIST_GAP,
  },
  imageContainer: {
    position: 'relative',
    marginRight: Spacing.LIST_GAP,
    marginBottom: Spacing.LIST_GAP,
  },
  uploadedImage: {
    width: 80,
    height: 80,
    borderRadius: Radii.CARD,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.ALERT_RED,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: Colors.BG_LIGHT,
    fontSize: 16,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: Radii.CARD,
    borderWidth: 2,
    borderColor: Colors.GRAY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.LIST_GAP,
  },
  addImageText: {
    fontSize: 32,
    color: Colors.GRAY_MED,
  },
  sectionTitle: {
    marginTop: Spacing.LIST_GAP,
    marginBottom: Spacing.LIST_GAP,
  },
});
