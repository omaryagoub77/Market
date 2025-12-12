# Notification System Architecture

This document explains how the notification system works in the chat application.

## Overview

The notification system handles real-time messaging notifications across Web, iOS, and Android platforms using Firebase Cloud Messaging (FCM).

## Components

### 1. NotificationService.ts

The core notification service that handles:
- Platform detection (Web vs Mobile)
- Permission requests
- FCM token management
- Foreground and background notification handling
- In-app notification display

### 2. ChatListScreen.tsx

Displays unread message badges and handles marking messages as read:
- Shows real-time unread counts
- Updates badges when new messages arrive
- Marks messages as read when user opens a chat

### 3. ChatRoomScreen.tsx

Handles chat room interactions:
- Updates chat timestamps
- Integrates with navigation from notifications

### 4. Firebase Cloud Function

Server-side function that sends push notifications:
- Triggered on new message creation
- Identifies recipients
- Sends notifications via FCM

## How It Works

### 1. Token Management

```
User opens app
↓
NotificationService requests permission
↓
FCM token generated
↓
Token stored in Firestore: users/{uid}/fcmTokens
```

### 2. Sending Notifications

```
User sends message
↓
Cloud Function triggered
↓
Recipients identified
↓
Recipient tokens fetched from Firestore
↓
Push notifications sent via FCM
```

### 3. Receiving Notifications

#### Foreground
```
Notification received
↓
NotificationService shows in-app banner
↓
User sees toast notification
```

#### Background/Killed
```
Notification received
↓
System tray displays notification
↓
User taps notification
↓
App navigates to chat room
```

### 4. Unread Badge System

```
New message arrives
↓
ChatListScreen listener triggered
↓
Unread count calculated from messages without user in readBy array
↓
Badge updated in real-time
```

### 5. Marking as Read

```
User opens chat
↓
ChatRoomScreen loads
↓
All messages updated with user ID in readBy array
↓
ChatListScreen badges update automatically
```

## Data Structure

### User Document
```
users/{uid}
├── fcmTokens: ["token1", "token2", ...]
├── fullname: "John Doe"
├── photoURL: "https://..."
└── ...
```

### Message Document
```
chats/{chatId}/messages/{messageId}
├── text: "Hello world!"
├── senderId: "user123"
├── timestamp: Firestore Timestamp
├── readBy: ["user123", "user456"]
└── ...
```

## Platform Differences

### Web
- Uses Firebase v9 modular SDK
- Requires VAPID key for FCM
- Needs service worker for background messages

### Mobile (iOS/Android)
- Uses @react-native-firebase/messaging
- Requires platform-specific setup (APNs for iOS, google-services.json for Android)
- Handles background messages automatically

## Error Handling

The system includes comprehensive error handling for:
- Firebase initialization issues
- Permission denials
- Network failures
- Invalid tokens
- Missing data

## Performance Considerations

1. **Real-time Updates**: Uses Firestore listeners for instant badge updates
2. **Efficient Queries**: Limits message queries to necessary data only
3. **Token Management**: Stores multiple tokens per user for multiple devices
4. **Memory Management**: Cleans up listeners appropriately

## Security

1. **Data Validation**: Validates all incoming notification data
2. **Authentication**: Ensures only authorized users receive notifications
3. **Privacy**: Doesn't include sensitive data in notification payloads
4. **Token Rotation**: Handles token refresh automatically

## Testing

The system can be tested by:
1. Sending messages between users
2. Verifying in-app notifications appear
3. Checking system notifications in background
4. Confirming unread badge updates
5. Validating mark-as-read functionality