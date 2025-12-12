# Firebase Cloud Messaging (FCM) Setup Guide

This guide explains how to set up FCM for Web, iOS, and Android platforms in your React Native + Expo chat application.

## Prerequisites

1. Firebase project created in the Firebase Console
2. Firebase app configured with proper credentials
3. `@react-native-firebase/messaging` installed for mobile platforms
4. Firebase v9 SDK installed for web

## Web Platform Setup

### 1. Get VAPID Key

1. Go to Firebase Console → Project Settings → Cloud Messaging
2. In the Web configuration section, copy your "Web Push certificates" key pair
3. If you don't have one, click "Generate Key Pair"

### 2. Update NotificationService.ts

Replace `'YOUR_VAPID_KEY_HERE'` with your actual VAPID key:

```typescript
fcmToken = await this.messaging.getToken({
  vapidKey: 'YOUR_ACTUAL_VAPID_KEY_HERE'
});
```

### 3. Add Firebase Configuration

Ensure your `firebase.js` includes the messagingSenderId:

```javascript
const firebaseConfig = {
  // ... other config
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  // ... other config
};
```

### 4. Service Worker Setup (Optional but Recommended)

Create a `firebase-messaging-sw.js` file in your public directory:

```javascript
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js');

const firebaseConfig = {
  // Your Firebase config
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

## iOS Platform Setup

### 1. Enable Push Notifications Capability

1. In Xcode, select your project target
2. Go to Signing & Capabilities
3. Click "+ Capability"
4. Add "Push Notifications"

### 2. Configure APNs Certificates

1. Go to Apple Developer Portal
2. Create an App ID with Push Notifications enabled
3. Create a Development/Distribution SSL Certificate for Push Notifications
4. Download and install the certificate
5. Create a .p12 file and upload to Firebase Console:
   - Firebase Console → Project Settings → Cloud Messaging
   - Upload the APNs Authentication Key

### 3. Update Info.plist (if needed)

Add background modes if you want to handle background messages:

```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

## Android Platform Setup

### 1. Add Google Services Plugin

In your `android/build.gradle`:

```gradle
buildscript {
  dependencies {
    classpath 'com.google.gms:google-services:4.3.10'
  }
}
```

In your `android/app/build.gradle`:

```gradle
apply plugin: 'com.google.gms.google-services'
```

### 2. Add google-services.json

1. Download `google-services.json` from Firebase Console
2. Place it in `android/app/` directory

### 3. Configure AndroidManifest.xml

Add permissions and services to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.VIBRATE" />

<application>
  <!-- Other config -->
  
  <service android:name="io.invertase.firebase.messaging.RNFirebaseMessagingService"
           android:exported="false">
    <intent-filter>
      <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
  </service>
  
  <service android:name="io.invertase.firebase.messaging.RNFirebaseInstanceIdService"
           android:exported="false">
    <intent-filter>
      <action android:name="com.google.firebase.INSTANCE_ID_EVENT"/>
    </intent-filter>
  </service>
</application>
```

## Firebase Cloud Function Setup

### 1. Deploy the Function

Create `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendNewMessageNotification = functions.firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    try {
      // Get the newly created message data
      const messageData = snap.data();
      const chatId = context.params.chatId;
      const messageId = context.params.messageId;
      
      console.log('New message created:', messageId, 'in chat:', chatId);
      
      // Get the chat document to identify participants
      const chatDoc = await admin.firestore().doc(`chats/${chatId}`).get();
      if (!chatDoc.exists) {
        console.log('Chat document not found');
        return null;
      }
      
      const chatData = chatDoc.data();
      const participants = chatData.participants || [];
      
      // Identify the sender and other participants
      const senderId = messageData.senderId;
      const otherParticipants = participants.filter(participantId => participantId !== senderId);
      
      if (otherParticipants.length === 0) {
        console.log('No other participants to notify');
        return null;
      }
      
      // Get sender's user profile to get their name
      const senderDoc = await admin.firestore().doc(`users/${senderId}`).get();
      let senderName = 'Someone';
      
      if (senderDoc.exists) {
        const senderData = senderDoc.data();
        senderName = senderData.fullname || senderData.displayName || 'Someone';
      }
      
      // Prepare notification payload
      const notificationPayload = {
        notification: {
          title: `New message from ${senderName}`,
          body: messageData.text || 'You have a new message',
        },
        data: {
          chatId: chatId,
          senderId: senderId,
          messageId: messageId,
          type: 'NEW_MESSAGE'
        }
      };
      
      // Collect FCM tokens for all other participants
      const tokensPromises = otherParticipants.map(async (participantId) => {
        try {
          const userDoc = await admin.firestore().doc(`users/${participantId}`).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            // Return array of FCM tokens for this user
            return userData.fcmTokens || [];
          }
          return [];
        } catch (error) {
          console.error('Error fetching user data for participant:', participantId, error);
          return [];
        }
      });
      
      // Wait for all token fetches to complete
      const tokensArrays = await Promise.all(tokensPromises);
      
      // Flatten the arrays of tokens into a single array
      const allTokens = tokensArrays.flat().filter(token => token); // Remove any falsy values
      
      if (allTokens.length === 0) {
        console.log('No FCM tokens found for participants');
        return null;
      }
      
      console.log(`Sending notifications to ${allTokens.length} devices`);
      
      // Send multicast notification
      const response = await admin.messaging().sendMulticast({
        tokens: allTokens,
        ...notificationPayload
      });
      
      // Log results
      console.log('Notification sent successfully:', response.successCount, 'success,', response.failureCount, 'failures');
      
      // Clean up invalid tokens if any failed
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(allTokens[idx]);
            console.error('Failed to send notification to token:', allTokens[idx], resp.error);
          }
        });
      }
      
      return response;
    } catch (error) {
      console.error('Error in sendNewMessageNotification function:', error);
      return null;
    }
  });
```

### 2. Deploy to Firebase

```bash
cd functions
npm install
firebase deploy --only functions
```

## Testing Notifications

### 1. Web Testing

1. Serve your app locally
2. Open in browser
3. Accept notification permissions
4. Send a message from another user
5. Observe the in-app notification

### 2. Mobile Testing

1. Build and deploy to device (simulator won't receive push notifications)
2. Accept notification permissions
3. Put app in background
4. Send a message from another user
5. Observe system notification

## Troubleshooting

### Common Issues

1. **"No Firebase App '[DEFAULT]' has been created"**
   - Ensure Firebase is initialized before using any services
   - Check that `firebase.initializeApp()` is called during app startup

2. **Notifications not received on mobile**
   - Ensure you're testing on a physical device, not simulator
   - Check APNs certificates for iOS
   - Verify google-services.json for Android

3. **VAPID key error on web**
   - Make sure you've replaced `'YOUR_VAPID_KEY_HERE'` with actual key
   - Check that messagingSenderId is in your Firebase config

4. **Permission denied**
   - Ensure users have granted notification permissions
   - Check device settings for notification permissions

### Debugging Tips

1. Enable verbose logging in NotificationService
2. Check Firebase Console logs for Cloud Function execution
3. Use Firebase Debug View to monitor notification delivery
4. Test with Firebase CLI: `firebase functions:shell`

## Security Considerations

1. Validate all data coming from notifications
2. Don't store sensitive information in notification payloads
3. Implement proper authentication checks in Cloud Functions
4. Regularly clean up invalid FCM tokens