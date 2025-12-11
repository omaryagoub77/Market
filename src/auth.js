import { auth } from '@/src/firebase';
import { signOut } from 'firebase/auth';

export const logout = async () => {
  try {
    await signOut(auth);
    console.log('User signed out successfully');
    // In a real app, you would also navigate to the login screen
    // router.replace('/auth/login');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};