# Push Notification System Implementation

This document describes the complete implementation of the push notification system for the React Native app using Expo and Firebase.

## Overview

The push notification system consists of:

1. **Client-side** - Expo Notifications for handling device tokens and receiving notifications
2. **Server-side** - Firebase Cloud Functions for sending notifications when messages are created
3. **Database** - Firestore for storing user tokens
4. **Messaging** - Firestore collections for storing chat messages

## Components

### 1. Expo Notification Service (`src/expoNotificationService.js`)

Handles:
- Requesting notification permissions
- Getting Expo push tokens
- Storing tokens in Firestore
- Setting up notification listeners
- Sending local notifications (for testing)

### 2. Firebase Cloud Function (`functions/index.js`)

Triggers:
- When a new message is created in `chats/{chatId}/messages/{messageId}`
- Sends notifications via both FCM and Expo Push API
- Retrieves recipient tokens from Firestore
- Handles token validation and cleanup

### 3. Chat Utilities (`utils/messageUtils.ts`)

Provides:
- Functions for sending messages with notification support
- Integration with Firestore for message storage
- Expo Push API integration for sending notifications

### 4. UI Integration (`app/screens/chat-room.tsx`)

Implements:
- Notification listeners for foreground and response handling
- Message sending with automatic notification triggering
- User experience enhancements

## Setup Instructions

### 1. Dependencies Installation

The following dependencies were added to the project:

```bash
npm install expo-notifications expo-device axios
```

### 2. Firebase Function Dependencies

In the `functions` directory:

```bash
npm install axios
```

### 3. Configuration

No additional configuration is required beyond what's already in `app.json`.

## How It Works

### Registration Flow

1. When a user logs in, the `AuthContext` automatically initializes the notification service
2. The service requests permission to send notifications
3. If granted, it retrieves the Expo push token
4. The token is stored in the user's Firestore document under `expoTokens` array

### Message Sending Flow

1. User sends a message in the chat room
2. Message is saved to Firestore in `chats/{chatId}/messages`
3. Firebase Cloud Function is triggered on message creation
4. Function retrieves recipient's Expo tokens from Firestore
5. Function sends push notification via Expo Push API
6. Recipient receives notification on their device

### Notification Handling

1. When app is in foreground: Notification is received but not shown as alert (handled in code)
2. When app is in background: System notification is shown
3. When user taps notification: App opens and can navigate to the chat

## Testing

### Local Notification Testing

You can test the notification system by calling:

```javascript
import expoNotificationService from '@/src/expoNotificationService';

// Send a test notification
expoNotificationService.sendLocalNotification({
  title: 'Test Notification',
  body: 'This is a test notification',
  data: { test: 'data' }
});
```

### End-to-End Testing

1. Log in with two different user accounts on separate devices
2. Start a chat between the users
3. Send a message from one user to another
4. The recipient should receive a push notification

## Android Specifics

For Android, the app automatically creates a default notification channel with:
- Max importance
- Vibration pattern
- LED color settings

## iOS Specifics

For iOS, ensure the app has proper permissions configured in the Expo project settings.

## Error Handling

The system handles various error conditions:
- Permission denial
- Token retrieval failures
- Network issues when sending notifications
- Invalid tokens (with automatic cleanup planned)

## Security Considerations

- Tokens are stored securely in Firestore under user documents
- Only authenticated users can access their own tokens
- Firebase Functions run with appropriate security rules

## Future Enhancements

1. **Token Cleanup**: Implement automatic removal of invalid tokens
2. **Notification Categories**: Add different notification types for different actions
3. **Rich Notifications**: Support for images and action buttons in notifications
4. **Delivery Receipts**: Track notification delivery and read status
5. **Rate Limiting**: Prevent spamming of notifications

## Troubleshooting

### No Notifications Received

1. Check that permissions were granted
2. Verify that Expo tokens are stored in Firestore
3. Confirm that the Firebase Function is deployed and running
4. Check the Firebase Console logs for errors

### Permission Issues

1. On iOS, ensure proper entitlements are configured
2. On Android, check that the app has notification permissions enabled

### Token Problems

1. Tokens may expire - the system handles refresh automatically
2. If tokens become invalid, they should be removed from Firestore

## Code Structure

```
src/
  expoNotificationService.js     # Client-side notification handling
utils/
  messageUtils.ts               # Message sending with notification support
functions/
  index.js                      # Firebase Cloud Functions for notification sending
app/
  screens/
    chat-room.tsx              # Chat UI with notification integration
```

This implementation provides a robust, scalable push notification system that works across both Android and iOS devices.