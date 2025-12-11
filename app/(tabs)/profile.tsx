import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/ui/product-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';
import { uploadImageToCloudinary } from '@/src/cloudinary';
import { db, auth } from '@/src/firebase';
import { doc, updateDoc, collection, query, where, onSnapshot, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://picsum.photos/200/200?random=8');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null); // Local URI only
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (user: any) => {
      if (user) {
        setCurrentUser(user);
        setName(user.displayName || '');
        setEmail(user.email || '');
        setAvatarUrl(user.photoURL || 'https://picsum.photos/200/200?random=8');
      } else {
        setCurrentUser(null);
        setName('');
        setEmail('');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // Fetch user's listings from Firestore
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const listingsQuery = query(
      collection(db, 'products'),
      where('ownerId', '==', currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(listingsQuery, 
      (snapshot) => {
        const listingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setListings(listingsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching listings:', error);
        setError('Failed to load listings. Please try again later.');
        setLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [currentUser]);

  const handleAvatarSelect = async () => {
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
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedAvatar(imageUri);
      }
    } catch (error) {
      console.error('Avatar selection error:', error);
      setError('Failed to select avatar. Please try again.');
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setError('Please enter a valid name');
      return;
    }
    
    setIsSaving(true);
    setError('');
    
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to save profile');
      }
      
      let finalAvatarUrl = avatarUrl;
      
      // Upload new avatar to Cloudinary if selected
      if (selectedAvatar) {
        try {
          finalAvatarUrl = await uploadImageToCloudinary(selectedAvatar);
        } catch (uploadError) {
          console.error('Avatar upload error:', uploadError);
          throw new Error('Failed to upload avatar. Please try again.');
        }
      }
      
      // Update user profile in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { 
        name: name,
        photoURL: finalAvatarUrl
      });
      
      // Update state
      setAvatarUrl(finalAvatarUrl);
      setSelectedAvatar(null);
      setIsEditing(false);
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Save profile error:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/auth/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(error.message || 'Failed to logout. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    // Reset to original values
    if (currentUser) {
      setName(currentUser.displayName || '');
      setEmail(currentUser.email || '');
      setAvatarUrl(currentUser.photoURL || 'https://picsum.photos/200/200?random=8');
    }
    setSelectedAvatar(null);
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY_START} />
          <ThemedText style={styles.loadingText}>Loading profile...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
        
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: selectedAvatar || avatarUrl }} 
              style={styles.avatar} 
            />
            {isEditing && (
              <TouchableOpacity 
                style={styles.changeAvatarButton}
                onPress={handleAvatarSelect}
              >
                <IconSymbol 
                  name="pencil" 
                  size={16} 
                  color={Colors.BG_LIGHT} 
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.userInfo}>
            {isEditing ? (
              <>
                <Input
                  value={name}
                  onChangeText={setName}
                  placeholder="Full Name"
                  style={styles.nameInput}
                />
                <ThemedText style={styles.userEmail}>{email}</ThemedText>
              </>
            ) : (
              <>
                <ThemedText type="title">{name || 'User'}</ThemedText>
                <ThemedText style={styles.userEmail}>{email}</ThemedText>
              </>
            )}
          </View>
          {!isEditing && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <IconSymbol 
                name="pencil" 
                size={20} 
                color={Colors.ICON} 
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        {isEditing ? (
          <View style={styles.actionButtons}>
            <Button 
              title={isSaving ? "Saving..." : "Save"} 
              onPress={handleSaveProfile}
              disabled={isSaving}
              style={styles.actionButton}
            />
            <Button 
              title="Cancel" 
              variant="secondary" 
              onPress={handleCancelEdit}
              disabled={isSaving}
              style={styles.actionButton}
            />
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <Button 
              title="Logout" 
              variant="secondary" 
              onPress={handleLogout}
              style={styles.logoutButton}
            />
          </View>
        )}

        {/* My Listings */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          My Listings
        </ThemedText>
        {listings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText>No listings yet.</ThemedText>
          </View>
        ) : (
          <View style={styles.listingsContainer}>
            {listings.map((listing) => (
              <View key={listing.id} style={styles.listingItem}>
                <ProductCard 
                  title={listing.title}
                  price={`$${listing.price}`}
                  imageUrl={listing.images?.[0] || 'https://picsum.photos/300/300?random=1'}
                  sellerName={listing.sellerName || (name || 'Unknown Seller')}
                  rating={listing.rating || 0}
                  onPress={() => console.log('Listing pressed')}
                />
                {isEditing && (
                  <View style={styles.listingActions}>
                    <TouchableOpacity 
                      style={[styles.actionIcon, styles.editIcon]}
                      onPress={() => console.log('Edit listing')}
                    >
                      <IconSymbol name="pencil" size={20} color={Colors.BG_LIGHT} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionIcon, styles.deleteIcon]}
                      onPress={() => console.log('Delete listing')}
                    >
                      <IconSymbol name="trash" size={20} color={Colors.BG_LIGHT} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.SECTION_GAP,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: Radii.CIRCLE,
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.PRIMARY_START,
    width: 32,
    height: 32,
    borderRadius: Radii.CIRCLE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.BG_LIGHT,
  },
  userInfo: {
    flex: 1,
    marginLeft: Spacing.COMPONENT,
  },
  nameInput: {
    marginBottom: Spacing.LIST_GAP,
  },
  userEmail: {
    color: Colors.GRAY_MED,
    marginTop: Spacing.LIST_GAP,
  },
  editButton: {
    padding: Spacing.LIST_GAP,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.SECTION_GAP,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: Spacing.LIST_GAP,
  },
  logoutButton: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: Spacing.LIST_GAP,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.SECTION_GAP,
  },
  listingsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  listingItem: {
    width: '48%',
    marginBottom: Spacing.LIST_GAP,
    position: 'relative',
  },
  listingActions: {
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
});