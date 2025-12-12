# Notification System Documentation

## Overview

This document explains the implementation of the full notification system for the React Native chat application using Firebase Cloud Messaging (FCM).

## Components

### 1. Client-Side (React Native)

#### Notification Service (`src/notificationService.js`)

The notification service handles:
- Requesting user permission for notifications
- Getting and storing FCM tokens
- Handling foreground messages
- Managing background notifications

##### Key Features:
- **Permission Management**: Requests notification permissions on app start
- **Token Management**: Stores FCM tokens in Firestore under the user document
- **Foreground Handling**: Displays in-app notifications using Toast when the app is active
- **Background Handling**: Manages notifications when the app is in the background or closed

#### Integration Points

1. **App Initialization** (`app/_layout.tsx`)
   - Initializes the notification service when the app starts
   - Sets up all necessary handlers

2. **Chat List Screen** (`app/(tabs)/chat-list.tsx`)
   - Displays unread message badges
   - Marks messages as read when opening a chat

3. **Chat Room Screen** (`app/(tabs)/chat-room.tsx`)
   - Handles navigation from notification taps
   - Updates chat timestamps

### 2. Server-Side (Firebase Cloud Functions)

#### Notification Function (`functions/index.js`)

Triggered when a new message is created in `chats/{chatId}/messages/{messageId}`.

##### Workflow:
1. **Identify Participants**: Gets the chat document to find all participants
2. **Exclude Sender**: Filters out the message sender from notification recipients
3. **Get Sender Info**: Retrieves sender's name from their user profile
4. **Collect Tokens**: Gathers FCM tokens for all recipients from their user documents
5. **Send Notifications**: Sends push notifications to all recipient devices
6. **Handle Failures**: Logs any failed deliveries

## Data Structure

### User Document (Firestore)
```
users/{uid}
├── fcmTokens: [token1, token2, ...]  // Array of FCM tokens for this user
├── fullname: "John Doe"
├── photoURL: "https://..."
└── ... (other user data)
```

### Message Document (Firestore)
```
chats/{chatId}/messages/{messageId}
├── text: "Hello world!"
├── senderId: "user123"
├── timestamp: Firestore Timestamp
├── readBy: ["user123", "user456"]  // Users who have read this message
└── ... (other message data)
```

## Implementation Details

### Unread Message Counting

The chat list screen counts unread messages by:
1. Querying all messages in a chat
2. Checking each message's `readBy` array
3. Incrementing the count for messages that don't include the current user

### Marking Messages as Read

When a user opens a chat room:
1. All messages in that chat are updated
2. Current user's ID is added to each message's `readBy` array using `arrayUnion`
3. Unread badges automatically disappear due to real-time updates

### Push Notifications

When a new message is sent:
1. The Cloud Function triggers on message creation
2. Recipient tokens are fetched from Firestore
3. Notifications are sent with:
   - Title: "New message from {senderName}"
   - Body: The message text
   - Data payload containing chatId and senderId

## Setup Requirements

### Firebase Configuration

Ensure your Firebase project has:
1. Cloud Messaging API enabled
2. Proper APNs (iOS) and FCM (Android) credentials configured
3. Firestore rules allowing users to read their own documents and update their tokens

### Client Setup

1. Install required dependencies:
   ```
   npm install @react-native-firebase/app @react-native-firebase/messaging
   ```

2. Configure platform-specific settings:
   - **Android**: Add required permissions and services in AndroidManifest.xml
   - **iOS**: Configure AppDelegate.m and enable push notifications in Xcode

### Deployment

Deploy the Cloud Function:
```bash
cd functions
firebase deploy --only functions
```

## Testing

### Foreground Notifications
1. Open the app on one device
2. Send a message from another device/account
3. Observe the Toast notification appearing

### Background Notifications
1. Put the app in background on one device
2. Send a message from another device/account
3. Observe the system notification appearing

### Quit State Notifications
1. Completely close the app on one device
2. Send a message from another device/account
3. Tap the notification to open the app and navigate to the chat

## Troubleshooting

### Common Issues

1. **Notifications Not Received**
   - Check FCM token registration
   - Verify platform-specific setup (APNs for iOS, FCM for Android)
   - Ensure Cloud Function is deployed and working

2. **Permission Denied**
   - Make sure users have granted notification permissions
   - Check device settings for notification permissions

3. **Tokens Not Stored**
   - Verify Firestore rules allow token updates
   - Check for errors in the console logs

### Debugging Tips

1. Enable verbose logging in the notification service
2. Check Firebase Console logs for Cloud Function execution
3. Use Firebase Debug View to monitor notification delivery