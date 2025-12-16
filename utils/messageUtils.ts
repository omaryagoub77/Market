import { db } from '@/src/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import axios from 'axios';

/**
 * Sends a message and triggers a push notification
 * @param senderId - The ID of the user sending the message
 * @param receiverId - The ID of the user receiving the message
 * @param text - The message text
 * @param chatId - The chat room ID (optional)
 * @returns Promise<boolean> - Whether the message was sent successfully
 */
export async function sendMessageWithNotification(
  senderId: string,
  receiverId: string,
  text: string,
  chatId?: string
): Promise<boolean> {
  try {
    // Save the message in Firestore
    const messageData = {
      senderId,
      receiverId,
      text,
      timestamp: serverTimestamp(),
      chatId: chatId || null
    };

    // Add message to the messages collection
    const docRef = await addDoc(collection(db, 'messages'), messageData);
    console.log('Message sent with ID:', docRef.id);

    // Trigger push notification
    await sendPushNotification(senderId, receiverId, text);
    
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
}

/**
 * Sends a push notification to a user via Expo Push API
 * @param senderId - The ID of the user sending the message
 * @param receiverId - The ID of the user receiving the message
 * @param messageText - The message text
 */
async function sendPushNotification(
  senderId: string,
  receiverId: string,
  messageText: string
): Promise<void> {
  try {
    // Get receiver's Expo push tokens from Firestore
    const userDoc = await getDoc(doc(db, 'users', receiverId));
    if (!userDoc.exists()) {
      console.warn('Receiver user document not found');
      return;
    }

    const userData = userDoc.data();
    const expoTokens = userData.expoTokens || [];
    
    if (!expoTokens.length) {
      console.log('No Expo tokens found for user:', receiverId);
      return;
    }

    // Get sender's name for notification title
    const senderDoc = await getDoc(doc(db, 'users', senderId));
    const senderName = senderDoc.exists() ? (senderDoc.data().fullname || 'Someone') : 'Someone';

    // Send notification to each token
    const notifications = expoTokens.map(token => ({
      to: token,
      sound: 'default',
      title: 'New Message',
      body: messageText,
      data: {
        senderId,
        message: messageText
      }
    }));

    // Send notifications via Expo Push API
    const responses = await Promise.all(
      notifications.map(notification => 
        axios.post('https://exp.host/--/api/v2/push/send', notification)
      )
    );

    console.log('Push notifications sent:', responses.length);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

/**
 * Creates a chat room between two users
 * @param userId1 - First user ID
 * @param userId2 - Second user ID
 * @returns The chat room ID
 */
export async function createOrGetChatRoom(userId1: string, userId2: string): Promise<string> {
  // Create a deterministic chat ID based on user IDs
  const userIds = [userId1, userId2].sort();
  const chatId = `chat_${userIds.join('_')}`;
  
  try {
    // In a real implementation, you would create the chat room document in Firestore
    // For now, we're just returning the ID
    return chatId;
  } catch (error) {
    console.error('Error creating/getting chat room:', error);
    throw error;
  }
}