import { db } from '@/src/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  fullname: string;
  phoneNumber: string;
  location?: string;
  email: string;
  gender: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Creates a new user profile in Firestore
 * @param userData - The user profile data to store
 * @returns Promise<void>
 */
export async function createUserProfile(userData: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<void> {
  try {
    const userRef = doc(db, 'users', userData.uid);
    const userProfile: UserProfile = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(userRef, userProfile);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

/**
 * Updates an existing user profile in Firestore
 * @param uid - The user ID
 * @param userData - The user profile data to update
 * @returns Promise<void>
 */
export async function updateUserProfile(uid: string, userData: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const updateData = {
      ...userData,
      updatedAt: new Date()
    };
    
    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Gets a user profile from Firestore
 * @param uid - The user ID
 * @returns Promise<UserProfile | null>
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}