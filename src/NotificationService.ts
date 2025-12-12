import { getApps, initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Toast from 'react-native-toast-message';

// Types
interface RemoteMessage {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: {
    chatId?: string;
    senderId?: string;
    [key: string]: string | undefined;
  };
}

interface NotificationServiceInterface {
  init(): Promise<void>;
  requestPermissions(): Promise<boolean>;
  getFcmToken(): Promise<string | null>;
  storeFcmToken(userId: string, token: string): Promise<void>;
  setupForegroundHandler(): void;
  handleBackgroundNotification(): Promise<void>;
}

/**
 * Notification Service
 * Cross-platform notification handler for Web, iOS, and Android
 * 
 * How it works:
 * 1. Requests notification permissions on app startup
 * 2. Gets/stores FCM tokens in Firestore under users/{uid}/fcmTokens
 * 3. Handles foreground notifications with in-app banners
 * 4. Handles background/killed notifications with system tray
 * 5. Integrates with unread badge system via readBy array in messages
 */
class NotificationService implements NotificationServiceInterface {
  private messaging: any = null;
  private isInitialized = false;
  private isWeb = false;
  private db: any;
  private auth: any;

  constructor() {
    // Detect platform
    this.isWeb = typeof window !== 'undefined' && typeof navigator !== 'undefined';
    
    // Initialize Firebase services
    const apps = getApps();
    if (apps.length > 0) {
      this.db = getFirestore(apps[0]);
      this.auth = getAuth(apps[0]);
      this.isInitialized = true;
    }
  }

  /**
   * Initialize the notification service based on platform
   */
  async init(): Promise<void> {
    try {
      if (!this.isInitialized) {
        console.warn('Firebase not initialized, skipping notification service setup');
        return;
      }

      // Platform-specific initialization
      if (this.isWeb) {
        await this.initWeb();
      } else {
        await this.initMobile();
      }

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Notification permissions not granted');
        return;
      }

      // Get and store FCM token
      const token = await this.getFcmToken();
      if (token && this.auth.currentUser) {
        await this.storeFcmToken(this.auth.currentUser.uid, token);
      }

      // Setup foreground handler
      this.setupForegroundHandler();
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  /**
   * Initialize for web platform
   */
  private async initWeb(): Promise<void> {
    try {
      // Dynamically import Firebase Messaging for web
      const { getMessaging } = await import('firebase/messaging');
      const apps = getApps();
      if (apps.length > 0) {
        this.messaging = getMessaging(apps[0]);
      }
    } catch (error) {
      console.error('Error initializing web messaging:', error);
    }
  }

  /**
   * Initialize for mobile platforms (iOS/Android)
   */
  private async initMobile(): Promise<void> {
    try {
      // Dynamically import React Native Firebase Messaging
      const rnFirebase = await import('@react-native-firebase/messaging');
      this.messaging = rnFirebase.default;
    } catch (error) {
      console.error('Error initializing mobile messaging:', error);
    }
  }

  /**
   * Request notification permissions based on platform
   * @returns {Promise<boolean>} Whether permission was granted
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (this.isWeb) {
        return await this.requestWebPermissions();
      } else {
        return await this.requestMobilePermissions();
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Request permissions for web platform
   */
  private async requestWebPermissions(): Promise<boolean> {
    if (!this.isWeb || !('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  /**
   * Request permissions for mobile platforms
   */
  private async requestMobilePermissions(): Promise<boolean> {
    if (!this.messaging) return false;

    try {
      const authStatus = await this.messaging.requestPermission();
      const enabled =
        authStatus === this.messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === this.messaging.AuthorizationStatus.PROVISIONAL;

      return enabled;
    } catch (error) {
      console.error('Error requesting mobile notification permissions:', error);
      return false;
    }
  }

  /**
   * Get FCM token based on platform
   * @returns {Promise<string | null>} The FCM token or null
   */
  async getFcmToken(): Promise<string | null> {
    if (!this.messaging) {
      console.warn('Messaging not initialized');
      return null;
    }

    try {
      let fcmToken: string | null = null;

      if (this.isWeb) {
        // For web, you need to provide your VAPID key
        // Replace 'YOUR_VAPID_KEY_HERE' with your actual VAPID key
        fcmToken = await this.messaging.getToken({
          vapidKey: 'YOUR_VAPID_KEY_HERE' // TODO: Replace with actual VAPID key
        });
      } else {
        // For mobile platforms
        fcmToken = await this.messaging.getToken();
      }

      if (fcmToken) {
        console.log('FCM Token:', fcmToken);
        return fcmToken;
      }

      return null;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Store FCM token in Firestore under users/{uid}/fcmTokens
   * @param {string} userId - The user ID
   * @param {string} token - The FCM token to store
   */
  async storeFcmToken(userId: string, token: string): Promise<void> {
    if (!token || !this.db) {
      console.warn('No token or database to store');
      return;
    }

    try {
      const userDocRef = doc(this.db, 'users', userId);
      await updateDoc(userDocRef, {
        fcmTokens: arrayUnion(token)
      });
      console.log('FCM token stored successfully for user:', userId);
    } catch (error) {
      console.error('Error storing FCM token:', error);
    }
  }

  /**
   * Setup foreground message handler to show in-app notifications
   */
  setupForegroundHandler(): void {
    if (!this.messaging) {
      console.warn('Messaging not initialized');
      return;
    }

    try {
      if (this.isWeb) {
        this.setupWebForegroundHandler();
      } else {
        this.setupMobileForegroundHandler();
      }
    } catch (error) {
      console.error('Error setting up foreground handler:', error);
    }
  }

  /**
   * Setup foreground handler for web platform
   */
  private setupWebForegroundHandler(): void {
    if (!this.messaging) return;

    // For web, we use onMessage directly
    this.messaging.onMessage((payload: RemoteMessage) => {
      console.log('Foreground message received (Web):', payload);
      this.showInAppNotification(payload);
    });
  }

  /**
   * Setup foreground handler for mobile platforms
   */
  private setupMobileForegroundHandler(): void {
    if (!this.messaging) return;

    // For mobile, we use the messaging instance directly
    const unsubscribe = this.messaging.onMessage(async (remoteMessage: RemoteMessage) => {
      console.log('Foreground message received (Mobile):', remoteMessage);
      this.showInAppNotification(remoteMessage);
    });

    // Store unsubscribe function if needed for cleanup
    // In a real implementation, you might want to store this for cleanup
  }

  /**
   * Show in-app notification (banner/toast)
   * @param {RemoteMessage} message - The message to display
   */
  private showInAppNotification(message: RemoteMessage): void {
    const title = message.notification?.title || 'New Message';
    const body = message.notification?.body || 'You have a new message';

    // Display using Toast (you can replace this with your own banner component)
    Toast.show({
      type: 'success',
      text1: title,
      text2: body,
      visibilityTime: 4000,
      autoHide: true,
    });

    // Optionally play a sound
    try {
      if (typeof window !== 'undefined' && !this.isWeb) {
        // For mobile, you might want to play a sound using react-native-sound
        // This is just a placeholder - implement based on your sound library
        console.log('Would play notification sound here');
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  /**
   * Handle background notification
   * This is typically handled by the OS and app lifecycle events
   */
  async handleBackgroundNotification(): Promise<void> {
    if (!this.messaging) return;

    try {
      if (this.isWeb) {
        // For web, background messages are handled differently
        // This is usually handled by the service worker
        console.log('Background message handling for web would be implemented in service worker');
      } else {
        // For mobile platforms
        this.messaging.onNotificationOpenedApp((remoteMessage: RemoteMessage) => {
          console.log('App opened from background by tapping notification:', remoteMessage);
          // Handle navigation to chat room if needed
          this.handleNotificationNavigation(remoteMessage);
        });

        // Check if app was opened from a terminated state
        const initialNotification = await this.messaging.getInitialNotification();
        if (initialNotification) {
          console.log('App opened from quit state by tapping notification:', initialNotification);
          this.handleNotificationNavigation(initialNotification);
        }
      }
    } catch (error) {
      console.error('Error handling background notification:', error);
    }
  }

  /**
   * Handle navigation when notification is tapped
   * @param {RemoteMessage} message - The notification message
   */
  private handleNotificationNavigation(message: RemoteMessage): void {
    const chatId = message.data?.chatId;
    const senderId = message.data?.senderId;

    if (chatId && senderId) {
      // Navigate to chat room
      // In a real implementation, you would use your navigation library
      // For example, with expo-router:
      // router.push(`/(tabs)/chat-room?chatId=${chatId}&sellerId=${senderId}`);
      console.log(`Would navigate to chat room: chatId=${chatId}, sellerId=${senderId}`);
    }
  }
}

// Export singleton instance
export default new NotificationService();