import { db } from '@/src/firebase';
import { collection, doc, setDoc, getDoc, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';

/**
 * Creates a chat room between two users if it doesn't exist
 * @param userId1 - First user ID
 * @param userId2 - Second user ID
 * @returns The chat room ID
 */
export async function createOrGetChatRoom(userId1: string, userId2: string): Promise<string> {
  // Create a deterministic chat ID based on user IDs
  const userIds = [userId1, userId2].sort();
  const chatId = `chat_${userIds.join('_')}`;
  
  try {
    // Check if chat room already exists
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);
    
    if (!chatSnap.exists()) {
      // Create the chat room document
      await setDoc(chatRef, {
        participants: [userId1, userId2],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      // Update the updatedAt timestamp
      await updateDoc(chatRef, {
        updatedAt: new Date()
      });
    }
    
    return chatId;
  } catch (error) {
    console.error('Error creating/getting chat room:', error);
    throw error;
  }
}

/**
 * Gets the chat room ID for two users
 * @param userId1 - First user ID
 * @param userId2 - Second user ID
 * @returns The chat room ID or null if not found
 */
export async function getChatRoomId(userId1: string, userId2: string): Promise<string | null> {
  const userIds = [userId1, userId2].sort();
  return `chat_${userIds.join('_')}`;
}

/**
 * Adds a user to a chat room (for group chats)
 * @param chatId - The chat room ID
 * @param userId - The user ID to add
 */
export async function addUserToChatRoom(chatId: string, userId: string): Promise<void> {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      participants: arrayUnion(userId),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error adding user to chat room:', error);
    throw error;
  }
}