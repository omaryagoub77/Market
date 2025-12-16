import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Platform, Modal, Text, TouchableHighlight, FlatList, TextInput, Easing } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import NavWrapper from '@/components/nav-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';
import { uploadImageToCloudinary } from '@/src/cloudinary';
import { db, auth } from '@/src/firebase';
import { collection, addDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  withDelay,
  interpolate,
  Extrapolate,
  SlideInDown,
  SlideOutDown,
  FadeIn,
  FadeOut,
  BounceIn,
  BounceOut
} from 'react-native-reanimated';

// Define categories as a single source of truth
const CATEGORIES = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'phones-accessories', label: 'Phones & Accessories' },
  { value: 'computers-laptops', label: 'Computers & Laptops' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'beauty-personal-care', label: 'Beauty & Personal Care' },
  { value: 'home-furniture', label: 'Home & Furniture' },
  { value: 'kitchen-appliances', label: 'Kitchen Appliances' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'sports-fitness', label: 'Sports & Fitness' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'vehicle-parts', label: 'Vehicle Parts' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'jobs', label: 'Jobs' },
  { value: 'services', label: 'Services' },
  { value: 'education', label: 'Education' },
  { value: 'books', label: 'Books' },
  { value: 'kids-baby', label: 'Kids & Baby' },
  { value: 'health', label: 'Health' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'others', label: 'Others' },
];

// Reusable animated list item component
const AnimatedOptionItem = ({ item, index, showDropdown, onSelect }) => {
  const itemOpacity = useSharedValue(0);
  const itemTranslateY = useSharedValue(10);
  
  useEffect(() => {
    if (showDropdown) {
      itemOpacity.value = withDelay(
        index * 50,
        withTiming(1, { duration: 300, easing: Easing.out(Easing.exp) })
      );
      itemTranslateY.value = withDelay(
        index * 50,
        withTiming(0, { duration: 300, easing: Easing.out(Easing.exp) })
      );
    }
  }, [showDropdown, index]);

  const itemAnimatedStyle = useAnimatedStyle(() => ({
    opacity: itemOpacity.value,
    transform: [
      {
        translateY: itemTranslateY.value
      }
    ]
  }));

  return (
    <TouchableHighlight
      underlayColor={Colors.GRAY_LIGHT}
      onPress={() => onSelect(item)}
    >
      <Animated.View style={[styles.optionItem, itemAnimatedStyle]}>
        <ThemedText>{item.label}</ThemedText>
      </Animated.View>
    </TouchableHighlight>
  );
};

// Custom Select Component with animations
const Select = ({ 
  label, 
  value, 
  onValueChange, 
  placeholder, 
  options, 
  required = false 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(placeholder || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Animated values for dropdown
  const modalHeight = useSharedValue(0);
  const modalOpacity = useSharedValue(0);
  const dropdownY = useSharedValue(1000);
  const arrowRotation = useSharedValue(0);
  const searchBorderWidth = useSharedValue(1);
  const searchBorderColor = useSharedValue(Colors.GRAY_LIGHT);

  // Animate dropdown open/close
  useEffect(() => {
    if (showDropdown) {
      modalOpacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.exp) });
      dropdownY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.exp) });
      arrowRotation.value = withTiming(180, { duration: 200, easing: Easing.out(Easing.exp) });
    } else {
      modalOpacity.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.exp) });
      dropdownY.value = withTiming(1000, { duration: 300, easing: Easing.out(Easing.exp) });
      arrowRotation.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.exp) });
    }
  }, [showDropdown]);

  const handleSelect = (option) => {
    onValueChange(option.value);
    setSelectedLabel(option.label);
    setShowDropdown(false);
    setSearchQuery('');
  };

  // Filter categories based on search query
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Animated styles
  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [
      {
        translateY: dropdownY.value
      }
    ]
  }));

  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${arrowRotation.value}deg`
      }
    ]
  }));

  const searchAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: searchBorderColor.value,
    borderWidth: searchBorderWidth.value,
    shadowColor: isSearchFocused ? Colors.PRIMARY : 'transparent',
    shadowOpacity: isSearchFocused ? 0.2 : 0,
    shadowRadius: isSearchFocused ? 10 : 0,
    shadowOffset: { width: 0, height: isSearchFocused ? 5 : 0 }
  }));

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    searchBorderColor.value = withTiming(Colors.PRIMARY, { duration: 200 });
    searchBorderWidth.value = withTiming(2, { duration: 200 });
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    searchBorderColor.value = withTiming(Colors.GRAY_LIGHT, { duration: 200 });
    searchBorderWidth.value = withTiming(1, { duration: 200 });
  };

  return (
    <View style={styles.selectContainer}>
      {label && (
        <ThemedText type="defaultSemiBold" style={styles.label}>
          {label}
          {required && <ThemedText style={styles.required}> *</ThemedText>}
        </ThemedText>
      )}
      <TouchableOpacity 
        style={styles.selectInput}
        onPress={() => setShowDropdown(true)}
        activeOpacity={0.8}
      >
        <ThemedText style={styles.selectValue}>
          {selectedLabel}
        </ThemedText>
        <Animated.Text style={[styles.selectIcon, arrowAnimatedStyle]}>
          ▼
        </Animated.Text>
      </TouchableOpacity>
      
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="none"
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[styles.modalContainer, modalAnimatedStyle]}
            entering={SlideInDown.duration(300).easing(Easing.out(Easing.exp))}
            exiting={SlideOutDown.duration(300).easing(Easing.out(Easing.exp))}
          >
            {/* Search Input with animations */}
            <TextInput
              style={[styles.searchInput, searchAnimatedStyle]}
              placeholder="Search categories..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item, index }) => (
                <AnimatedOptionItem
                  item={item}
                  index={index}
                  showDropdown={showDropdown}
                  onSelect={handleSelect}
                />
              )}
            />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default function PostItemScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    try {
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
    if (!title || !price || selectedImages.length === 0 || !category) {
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
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be logged in to post an item');
      }
      
      const uploadedImageUrls = [];
      for (const imageUri of selectedImages) {
        try {
          const imageUrl = await uploadImageToCloudinary(imageUri);
          uploadedImageUrls.push(imageUrl);
        } catch (uploadError) {
          throw new Error('Failed to upload image. Please try again.');
        }
      }
      
      const productData = {
        title,
        description,
        price: parseFloat(price),
        category,
        images: uploadedImageUrls,
        ownerId: currentUser.uid,
        ownerName: currentUser.displayName || 'Unknown User',
        createdAt: new Date(),
      };
      
      const docRef = await addDoc(collection(db, 'products'), productData);
      
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
    <ProtectedRoute redirectTo="/post-item">
      <NavWrapper>
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

            {/* Category Select - Using custom Select component with animations */}
            <Select
              label="Category"
              value={category}
              onValueChange={setCategory}
              placeholder="Select category"
              options={CATEGORIES}
              required
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
      </NavWrapper>
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
  // Select Component Styles
  selectContainer: {
    marginBottom: Spacing.SECTION_GAP,
  },
  label: {
    marginBottom: Spacing.LIST_GAP,
  },
  required: {
    color: Colors.ALERT_RED,
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.BG_LIGHT,
    borderWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
    borderRadius: Radii.BUTTON,
    padding: Spacing.LIST_GAP,
    height: 48,
  },
  selectValue: {
    flex: 1,
    color: Colors.TEXT,
  },
  selectIcon: {
    color: Colors.GRAY_LIGHT,
    fontSize: 16,
    marginLeft: Spacing.LIST_GAP,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.BG_LIGHT,
    borderTopLeftRadius: Radii.BUTTON,
    borderTopRightRadius: Radii.BUTTON,
    maxHeight: '60%',
  },
  searchInput: {
    padding: Spacing.LIST_GAP,
    borderBottomWidth: 1,
    borderBottomColor: Colors.GRAY_LIGHT,
    backgroundColor: Colors.BG_LIGHT,
  },
  optionItem: {
    padding: Spacing.LIST_GAP,
    borderBottomWidth: 1,
    borderBottomColor: Colors.GRAY_LIGHT,
  },
});