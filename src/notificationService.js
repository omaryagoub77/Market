import { getApps, initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, requestPermission, onTokenRefresh } from 'firebase/messaging';
import { db, auth } from './firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import Toast from 'react-native-toast-message';

/**
 * Notification Service
 * Handles FCM token management, permission requests, and foreground message handling
 */

class NotificationService {
  constructor() {
    this.messaging = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the notification service
   * Ensures Firebase is properly initialized before using messaging
   */
  async initialize() {
    try {
      // Check if Firebase app is already initialized
      const apps = getApps();
      if (apps.length === 0) {
        console.warn('Firebase app not initialized. Skipping notification service initialization.');
        return false;
      }

      // Get messaging instance
      this.messaging = getMessaging(apps[0]);
      this.isInitialized = true;
      console.log('Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing notification service:', error);
      return false;
    }
  }

  /**
   * Request user permission for notifications
   * @returns {Promise<boolean>} Whether permission was granted
   */
  async requestUserPermission() {
    if (!this.isInitialized || !this.messaging) {
      console.warn('Notification service not initialized');
      return false;
    }

    try {
      const permission = await requestPermission(this.messaging);
      const enabled = permission === 'granted';
      
      if (enabled) {
        console.log('Notification permission granted');
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Get the FCM token for the device
   * @returns {Promise<string|null>} The FCM token or null if not available
   */
  async getFcmToken() {
    if (!this.isInitialized || !this.messaging) {
      console.warn('Notification service not initialized');
      return null;
    }

    try {
      // You need to provide your VAPID key here for web push notifications
      // For mobile apps, this might not be required
      const fcmToken = await getToken(this.messaging);
      if (fcmToken) {
        console.log('FCM Token retrieved:', fcmToken);
        return fcmToken;
      }
      console.log('No FCM token available');
      return null;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Store FCM token in Firestore under user's document
   * @param {string} userId - The user ID
   * @param {string} fcmToken - The FCM token to store
   */
  async storeFcmToken(userId, fcmToken) {
    if (!fcmToken) {
      console.warn('No FCM token to store');
      return;
    }

    try {
      const userTokensRef = doc(db, 'users', userId);
      // Add the token to the user's fcmTokens array
      await updateDoc(userTokensRef, {
        fcmTokens: arrayUnion(fcmToken)
      });
      console.log('FCM token stored successfully for user:', userId);
    } catch (error) {
      console.error('Error storing FCM token:', error);
    }
  }

  /**
   * Initialize notification service
   * Requests permission, gets token, and sets up listeners
   */
  async init() {
    // Initialize the service first
    const initialized = await this.initialize();
    if (!initialized) {
      console.log('Failed to initialize notification service');
      return;
    }

    // Request user permission
    const permissionGranted = await this.requestUserPermission();
    if (!permissionGranted) {
      console.log('Notification permission not granted');
      return;
    }

    // Get FCM token
    const fcmToken = await this.getFcmToken();
    if (fcmToken) {
      // Store token if we have a logged in user
      const currentUser = auth.currentUser;
      if (currentUser) {
        await this.storeFcmToken(currentUser.uid, fcmToken);
      }
    }

    // Set up foreground message handler
    this.setupForegroundHandler();

    // Handle token refresh
    if (this.messaging && this.isInitialized) {
      onTokenRefresh(this.messaging, async (newToken) => {
        console.log('FCM token refreshed:', newToken);
        const currentUser = auth.currentUser;
        if (currentUser) {
          await this.storeFcmToken(currentUser.uid, newToken);
        }
      });
    }
  }

  /**
   * Set up foreground message handler to show in-app notifications
   */
  setupForegroundHandler() {
    if (!this.isInitialized || !this.messaging) {
      console.warn('Notification service not initialized');
      return;
    }

    try {
      const unsubscribe = onMessage(this.messaging, async (remoteMessage) => {
        console.log('Foreground message received:', remoteMessage);
        
        // Show in-app notification using Toast
        Toast.show({
          type: 'success',
          text1: remoteMessage.notification?.title || 'New Message',
          text2: remoteMessage.notification?.body || 'You have a new message',
          visibilityTime: 4000,
          autoHide: true,
        });
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up foreground message handler:', error);
      return null;
    }
  }

  /**
   * Handle notification when app is opened from quit state
   */
  async handleBackgroundNotification() {
    // This functionality is typically handled by the OS and app lifecycle events
    // For React Native Firebase, this is usually handled automatically
    console.log('Background notification handling would be implemented here if needed');
    return null;
  }
}

// Export singleton instance
export default new NotificationService();