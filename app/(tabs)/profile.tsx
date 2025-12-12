// app/profile/index.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/ui/product-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';
import { auth, db } from '@/src/firebase';
import { doc, deleteDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, updateProfile, User } from 'firebase/auth';
import { getUserProfile, updateUserProfile, createUserProfile } from '@/utils/userProfile';
import { uploadImageToCloudinary } from '@/src/cloudinary';
import * as ImagePicker from 'expo-image-picker';

type Gender = 'male' | 'female' | 'other' | '';

export default function ProfileScreen() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profileExists, setProfileExists] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [gender, setGender] = useState<Gender>('');
  const [age, setAge] = useState('');
  const [homeAddress, setHomeAddress] = useState('');

  // Original values for cancel
  const [original, setOriginal] = useState<any>({});

  const [listings, setListings] = useState<any[]>([]);

  // Auth + profile load
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.replace('/auth/login');
        return;
      }

      setUser(u);
      setName(u.displayName || '');
      setEmail(u.email || '');

      const profile = await getUserProfile(u.uid);
      if (profile) {
        setProfileExists(true);
        setPhoneNumber(profile.phoneNumber || '');
        setLocation(profile.location || '');
        setGender((profile.gender as Gender) || '');
        setAge(profile.age ? String(profile.age) : '');
        setHomeAddress(profile.homeAddress || '');
        setAvatarUrl(profile.photoURL || '');
        
        setOriginal({
          name: u.displayName || '',
          email: u.email || '',
          avatarUrl: profile.photoURL || '',
          phoneNumber: profile.phoneNumber || '',
          location: profile.location || '',
          gender: profile.gender || '',
          age: profile.age ? String(profile.age) : '',
          homeAddress: profile.homeAddress || '',
        });
      } else {
        setProfileExists(false);
        setOriginal({
          name: u.displayName || '',
          email: u.email || '',
          avatarUrl: '',
          phoneNumber: '',
          location: '',
          gender: '',
          age: '',
          homeAddress: '',
        });
      }

      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  // Listings listener
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'products'), where('ownerId', '==', user.uid));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setListings(data);
    });

    return () => unsub();
  }, [user]);

  const startEdit = () => setIsEditing(true);

  const cancelEdit = () => {
    setName(original.name);
    setEmail(original.email);
    setAvatarUrl(original.avatarUrl);
    setPhoneNumber(original.phoneNumber);
    setLocation(original.location);
    setGender(original.gender);
    setAge(original.age);
    setHomeAddress(original.homeAddress);
    setSelectedAvatar(null);
    setError('');
    setIsEditing(false);
  };

  const handleAvatarUpload = async () => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    try {
      setAvatarUploading(true);
      
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
      setError('Failed to select image. Please try again.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const saveProfile = async () => {
    if (!name.trim()) return setError('Name is required');
    if (!email.trim()) return setError('Email is required');
    if (!phoneNumber.trim()) return setError('Phone number is required');
    if (!homeAddress.trim()) return setError('Home address is required');
    if (!age || isNaN(Number(age)) || Number(age) < 13) return setError('Valid age required');

    setSaving(true);
    setError('');

    try {
      let finalUrl = avatarUrl;

      if (selectedAvatar) {
        finalUrl = await uploadImageToCloudinary(selectedAvatar);
      }

      // Update custom profile
      await updateUserProfile(user!.uid, {
        fullname: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        ...(location.trim() && { location: location.trim() }),
        gender,
        age: Number(age),
        ...(homeAddress.trim() && { homeAddress: homeAddress.trim() }),
        photoURL: finalUrl,
      });

      // Update Auth profile name only
      await updateProfile(user!, {
        displayName: name.trim(),
      });

      setAvatarUrl(finalUrl);
      setSelectedAvatar(null);
      setIsEditing(false);
      setShowProfileForm(false);
      setProfileExists(true);
      Alert.alert('Success', 'Profile updated');
    } catch (e: any) {
      setError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const makeProfile = async () => {
    if (!name.trim()) return setError('Name is required');
    if (!email.trim()) return setError('Email is required');
    if (!phoneNumber.trim()) return setError('Phone number is required');
    if (!homeAddress.trim()) return setError('Home address is required');
    if (!age || isNaN(Number(age)) || Number(age) < 13) return setError('Valid age required');

    setSaving(true);
    setError('');

    try {
      let finalUrl = avatarUrl;

      if (selectedAvatar) {
        finalUrl = await uploadImageToCloudinary(selectedAvatar);
      }

      // Create profile
      await createUserProfile({
        uid: user!.uid,
        fullname: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        ...(location.trim() && { location: location.trim() }),
        gender,
        age: Number(age),
        ...(homeAddress.trim() && { homeAddress: homeAddress.trim() }),
        photoURL: finalUrl,
      });

      // Update Auth profile name only
      await updateProfile(user!, {
        displayName: name.trim(),
      });

      setAvatarUrl(finalUrl);
      setSelectedAvatar(null);
      setShowProfileForm(false);
      setProfileExists(true);
      Alert.alert('Success', 'Profile created successfully!');
    } catch (e: any) {
      setError(e.message || 'Profile creation failed');
    } finally {
      setSaving(false);
    }
  };

  const deleteListing = (id: string, title: string) => {
    Alert.alert('Delete', `Remove "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'products', id));
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size="large" color={Colors.PRIMARY_START} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <ThemedView style={styles.profileHeader}>
            {profileExists ? (
              <>
                <ThemedText type="title">{name}</ThemedText>
                <ThemedText>{email}</ThemedText>
                {(selectedAvatar || avatarUrl) ? (
                  <Image 
                    source={{ uri: selectedAvatar || avatarUrl }} 
                    style={styles.avatar} 
                  />
                ) : (
                  <ThemedView style={[styles.avatar, { backgroundColor: Colors.BG_ALT, justifyContent: 'center', alignItems: 'center' }]}>                    <IconSymbol 
                      name="person.fill" 
                      size={40} 
                      color={Colors.GRAY_MED} 
                    />
                  </ThemedView>
                )}
                {isEditing && (
                  <Button 
                    title={avatarUploading ? "Uploading..." : "Change Avatar"} 
                    onPress={handleAvatarUpload}
                    disabled={avatarUploading}
                  />
                )}
                <Button 
                  title={!isEditing ? "Edit Profile" : "Save Changes"} 
                  onPress={!isEditing ? startEdit : saveProfile}
                  style={{ marginTop: Spacing.LIST_GAP }}
                />
                {isEditing && (
                  <Button 
                    title="Cancel" 
                    variant="secondary" 
                    onPress={cancelEdit}
                    style={{ marginTop: Spacing.LIST_GAP }}
                  />
                )}
              </>
            ) : (
              <>
                <ThemedText type="title">Create Your Profile</ThemedText>
                <ThemedText>Please fill in your information to get started</ThemedText>
                <Button 
                  title="Make Profile" 
                  onPress={() => setShowProfileForm(true)}
                />
              </>
            )}
          </ThemedView>

          {showProfileForm && (
            <ThemedView style={styles.profileForm}>
              <Input
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
              />
              <Input
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <Input
                placeholder="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
              <Input
                placeholder="Age"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
              <Input
                placeholder="Home Address"
                value={homeAddress}
                onChangeText={setHomeAddress}
              />
              
              {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

              <ThemedView style={styles.actions}>
                <Button 
                  title={saving ? 'Saving…' : 'Save Profile'} 
                  onPress={makeProfile} 
                  disabled={saving}
                />
                <Button 
                  title="Cancel" 
                  variant="secondary" 
                  onPress={() => setShowProfileForm(false)} 
                  disabled={saving}
                />
              </ThemedView>
            </ThemedView>
          )}

          {profileExists && !showProfileForm && (
            <>
              {isEditing && (
                <ThemedView style={styles.editSection}>
                  <Input
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                  <Input
                    placeholder="Location"
                    value={location}
                    onChangeText={setLocation}
                  />
                  <Input
                    placeholder="Gender"
                    value={gender}
                    onChangeText={(text) => setGender(text as Gender)}
                  />
                  <Input
                    placeholder="Age"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                  />
                  <Input
                    placeholder="Home Address"
                    value={homeAddress}
                    onChangeText={setHomeAddress}
                  />
                </ThemedView>
              )}

              {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

              <ThemedView style={styles.actions}>
                {isEditing ? (
                  <>
                    <Button title={saving ? 'Saving…' : 'Save'} onPress={saveProfile} disabled={saving} />
                    <Button title="Cancel" variant="secondary" onPress={cancelEdit} disabled={saving} />
                  </>
                ) : (
                  <Button
                    title="Logout"
                    variant="secondary"
                    onPress={() => auth.signOut()}
                  />
                )}
              </ThemedView>
            </>
          )}

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            My Listings
          </ThemedText>

          {listings.length === 0 ? (
            <ThemedText style={styles.empty}>No listings yet</ThemedText>
          ) : (
            <ThemedView style={styles.grid}>
              {listings.map((item) => (
                <ThemedView key={item.id} style={styles.listingItem}>
                  <ThemedText>{item.title}</ThemedText>
                  {isEditing && (
                    <Button 
                      title="Delete" 
                      variant="secondary" 
                      onPress={() => deleteListing(item.id, item.title)} 
                    />
                  )}
                </ThemedView>
              ))}
            </ThemedView>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: Spacing.SCREEN_PADDING },
  profileHeader: { alignItems: 'center', marginBottom: Spacing.SECTION_GAP },
  avatar: { width: 100, height: 100, borderRadius: 50, marginVertical: Spacing.COMPONENT },
  editSection: { gap: Spacing.LIST_GAP, marginVertical: Spacing.COMPONENT },
  profileForm: { gap: Spacing.LIST_GAP, marginVertical: Spacing.COMPONENT },
  actions: { gap: Spacing.LIST_GAP, marginVertical: Spacing.SECTION_GAP },
  sectionTitle: { marginTop: Spacing.SECTION_GAP, marginBottom: Spacing.COMPONENT },
  error: { color: Colors.ALERT_RED, textAlign: 'center', marginVertical: Spacing.LIST_GAP },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  listingItem: { 
    width: '48%', 
    padding: Spacing.COMPONENT, 
    backgroundColor: Colors.BG_ALT, 
    borderRadius: Radii.CARD, 
    marginVertical: Spacing.LIST_GAP 
  },
  empty: { textAlign: 'center', color: Colors.GRAY_MED, marginTop: Spacing.SECTION_GAP },
});