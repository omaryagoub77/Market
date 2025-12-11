import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';
import { uploadImageToCloudinary } from '@/src/cloudinary';
import { db, auth } from '@/src/firebase';
import { collection, addDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function PostItemScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]); // Local URIs only
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddImage = async () => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    try {
      // Launch image picker
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedImages([...selectedImages, imageUri]);
      }
    } catch (error) {
      setError('Failed to select image. Please try again.');
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };

  const handleSubmit = async () => {
    if (!title || !price || selectedImages.length === 0) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (isNaN(parseFloat(price))) {
      setError('Please enter a valid price');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Get current user
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be logged in to post an item');
      }
      
      // Upload images to Cloudinary
      const uploadedImageUrls = [];
      for (const imageUri of selectedImages) {
        try {
          const imageUrl = await uploadImageToCloudinary(imageUri);
          uploadedImageUrls.push(imageUrl);
        } catch (uploadError) {
          throw new Error('Failed to upload image. Please try again.');
        }
      }
      
      // Save product to Firestore
      const productData = {
        title,
        description,
        price: parseFloat(price),
        category,
        images: uploadedImageUrls, // Array of string URLs
        ownerId: currentUser.uid,
        ownerName: currentUser.displayName || 'Unknown User',
        createdAt: new Date(),
      };
      
      const docRef = await addDoc(collection(db, 'products'), productData);
      
      // Reset form only after successful upload and submission
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('');
      setSelectedImages([]);
      
      Alert.alert('Success', 'Item posted successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to post item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute redirectTo="/(tabs)/post-item">
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <ThemedText type="title" style={styles.title}>
            Post New Item
          </ThemedText>

          {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

          {/* Image Upload Section */}
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Photos
          </ThemedText>
          <View style={styles.imageUploadContainer}>
            {selectedImages.map((image, index) => (
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
              disabled={isSubmitting}
            >
              <ThemedText style={styles.addImageText}>+</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <Input
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Enter item title"
          />

          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your item"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Input
            label="Price"
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            keyboardType="numeric"
          />

          <Input
            label="Category"
            value={category}
            onChangeText={setCategory}
            placeholder="Select category"
          />
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <Button 
            title={isSubmitting ? "Posting..." : "Post Item"} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          />
        </View>
      </ThemedView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_LIGHT,
  },
  contentContainer: {
    padding: Spacing.SCREEN_PADDING,
  },
  title: {
    marginBottom: Spacing.SECTION_GAP,
  },
  errorText: {
    color: Colors.ALERT_RED,
    textAlign: 'center',
    marginBottom: Spacing.LIST_GAP,
  },
  sectionTitle: {
    marginBottom: Spacing.LIST_GAP,
  },
  imageUploadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.SECTION_GAP,
  },
  imageContainer: {
    position: 'relative',
    marginRight: Spacing.LIST_GAP,
    marginBottom: Spacing.LIST_GAP,
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: Radii.BUTTON,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.ALERT_RED,
    width: 24,
    height: 24,
    borderRadius: Radii.CIRCLE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: Colors.BG_LIGHT,
    fontSize: 16,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: Radii.BUTTON,
    borderWidth: 2,
    borderColor: Colors.GRAY_LIGHT,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.LIST_GAP,
    marginBottom: Spacing.LIST_GAP,
  },
  addImageText: {
    fontSize: 32,
    color: Colors.GRAY_MED,
  },
  buttonContainer: {
    padding: Spacing.SCREEN_PADDING,
  },
});