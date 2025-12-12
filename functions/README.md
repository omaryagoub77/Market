# Firebase Cloud Functions

This directory contains the Firebase Cloud Functions for the chat application.

## Functions

### sendNewMessageNotification

Triggered when a new message is created in `chats/{chatId}/messages/{messageId}`.

Sends push notifications to all chat participants except the sender.

## Deployment

To deploy these functions, run:

```bash
firebase deploy --only functions
```

## Development

To test locally, run:

```bash
npm run serve
```