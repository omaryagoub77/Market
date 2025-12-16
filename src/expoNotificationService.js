import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { db, auth } from './firebase';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import Constants from 'expo-constants';

/**
 * Expo Notification Service
 * Handles Expo push token management, permission requests, and notification handling
 */

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class ExpoNotificationService {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Register for push notifications
   * Requests permission and gets Expo push token
   * @returns {Promise<string|null>} The Expo push token or null if not available
   */
  async registerForPushNotificationsAsync() {
    try {
      // Check if device supports notifications
      if (!Device.isDevice) {
        console.log('Must use physical device for push notifications');
        return null;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      // Get Expo push token
      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId || '7e41ad09-250a-4be1-9fd8-fc1e320140be',
      })).data;

      console.log('Expo Push Token:', token);
      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Store Expo push token in Firestore under user's document
   * @param {string} userId - The user ID
   * @param {string} expoToken - The Expo push token to store
   */
  async storeExpoToken(userId, expoToken) {
    if (!expoToken) {
      console.warn('No Expo token to store');
      return;
    }

    try {
      const userTokensRef = doc(db, 'users', userId);
      // Add the token to the user's expoTokens array
      await updateDoc(userTokensRef, {
        expoTokens: arrayUnion(expoToken)
      });
      console.log('Expo token stored successfully for user:', userId);
    } catch (error) {
      console.error('Error storing Expo token:', error);
    }
  }

  /**
   * Initialize notification service
   * Requests permission, gets token, and sets up listeners
   */
  async init() {
    try {
      // Register for push notifications
      const expoToken = await this.registerForPushNotificationsAsync();
      
      if (expoToken) {
        // Store token if we have a logged in user
        const currentUser = auth.currentUser;
        if (currentUser) {
          await this.storeExpoToken(currentUser.uid, expoToken);
        }
        return expoToken;
      }
      
      return null;
    } catch (error) {
      console.error('Error initializing notification service:', error);
      return null;
    }
  }

  /**
   * Set up notification listeners
   * @param {Function} onReceived - Callback for received notifications
   * @param {Function} onResponse - Callback for notification response (tap)
   */
  setupNotificationListeners(onReceived, onResponse) {
    try {
      // Handle received notifications (when app is in foreground)
      const receivedListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
        if (onReceived) {
          onReceived(notification);
        }
      });

      // Handle notification response (when user taps on notification)
      const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response received:', response);
        if (onResponse) {
          onResponse(response);
        }
      });

      return [receivedListener, responseListener];
    } catch (error) {
      console.error('Error setting up notification listeners:', error);
      return [null, null];
    }
  }

  /**
   * Remove notification listeners
   * @param {Array} listeners - Array of listener subscriptions to remove
   */
  removeNotificationListeners(listeners) {
    listeners.forEach(listener => {
      if (listener) {
        listener.remove();
      }
    });
  }

  /**
   * Send a local notification (for testing)
   * @param {Object} content - Notification content
   */
  async sendLocalNotification(content) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title || 'New Notification',
          body: content.body || 'You have a new notification',
          data: content.data || {},
        },
        trigger: null, // Trigger immediately
      });
      
      console.log('Local notification sent with ID:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error sending local notification:', error);
      return null;
    }
  }
}

// Export singleton instance
export default new ExpoNotificationService();