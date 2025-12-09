import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';

export default function PostItemScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<string[]>([]);

  const handleAddImage = () => {
    // In a real app, this would open the camera or gallery
    // For now, we'll just add a placeholder
    setImages([...images, `https://picsum.photos/300/300?random=${images.length + 1}`]);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = () => {
    console.log('Posting item:', { title, description, price, category, images });
    // In a real app, this would send the data to your backend
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedText type="title" style={styles.title}>
          Post New Item
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
          title="Post Item" 
          onPress={handleSubmit}
          disabled={!title || !price || images.length === 0}
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
  contentContainer: {
    padding: Spacing.SCREEN_PADDING,
  },
  title: {
    marginBottom: Spacing.SECTION_GAP,
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