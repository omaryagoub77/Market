import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/ui/avatar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';
import { db, auth } from '@/src/firebase';
import { collection, query, orderBy, onSnapshot, where, addDoc, serverTimestamp, limit, doc, updateDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { createOrGetChatRoom } from '@/utils/chatUtils';
import { getUserProfile } from '@/utils/userProfile';

export default function ChatRoomScreen() {
  const router = useRouter();
  // Get sellerId and chatId from route params
  const { sellerId, chatId } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user: any) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Generate or use existing chat ID
  useEffect(() => {
    if (!currentUser || !sellerId) return;

    // If chatId was passed from chat list, use it
    if (chatId && typeof chatId === 'string') {
      setChatRoomId(chatId);
      return;
    }

    // Otherwise, create or get chat room
    const initializeChat = async () => {
      try {
        const newChatId = await createOrGetChatRoom(currentUser.uid, sellerId as string);
        setChatRoomId(newChatId);
      } catch (error) {
        console.error('Error initializing chat:', error);
        setError('Failed to initialize chat. Please try again.');
        setLoading(false);
      }
    };

    initializeChat();
  }, [currentUser, sellerId, chatId]);

  // Fetch messages from Firestore based on chat ID
  useEffect(() => {
    if (!chatRoomId || !currentUser) {
      return;
    }

    const messagesQuery = query(
      collection(db, 'chats', chatRoomId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );
    
    const unsubscribe = onSnapshot(messagesQuery, 
      async (snapshot) => {
        // Create a cache for user profiles to avoid repeated fetches
        const userCache: Record<string, { fullname: string; photoURL?: string }> = {};
        
        const messagesData = await Promise.all(snapshot.docs.map(async (doc) => {
          const messageData = doc.data();
          const messageId = doc.id;
          
          // For current user messages, use current user data
          if (messageData.senderId === currentUser?.uid) {
            return {
              id: messageId,
              ...messageData,
              senderName: currentUser.displayName || 'You',
              senderAvatar: currentUser.photoURL || undefined
            };
          }
          
          // For other user messages, fetch from Firestore or cache
          let senderName = messageData.senderName || 'User';
          let senderAvatar = messageData.senderAvatar || undefined;
          
          // Check cache first
          if (userCache[messageData.senderId]) {
            senderName = userCache[messageData.senderId].fullname || senderName;
            senderAvatar = userCache[messageData.senderId].photoURL || senderAvatar;
          } else {
            // Fetch from Firestore if not in cache
            try {
              const userProfile = await getUserProfile(messageData.senderId);
              if (userProfile) {
                senderName = userProfile.fullname || senderName;
                senderAvatar = userProfile.photoURL || senderAvatar;
                // Cache the user profile
                userCache[messageData.senderId] = {
                  fullname: userProfile.fullname,
                  photoURL: userProfile.photoURL
                };
              }
            } catch (error) {
              console.error('Error fetching user profile:', error);
              // Fall back to existing values
            }
          }
          
          return {
            id: messageId,
            ...messageData,
            senderName,
            senderAvatar
          };
        }));
        
        setMessages(messagesData);
        setLoading(false);
        
        // Scroll to bottom when new messages arrive
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
      (error) => {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages. Please try again later.');
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [chatRoomId, currentUser]);

  // Update chat room timestamp when user opens the chat
  useEffect(() => {
    if (!chatRoomId || !currentUser) return;

    const updateChatTimestamp = async () => {
      try {
        const chatRef = doc(db, 'chats', chatRoomId);
        await updateDoc(chatRef, {
          updatedAt: new Date()
        });
      } catch (error) {
        console.error('Error updating chat timestamp:', error);
      }
    };

    updateChatTimestamp();
  }, [chatRoomId, currentUser]);

  const handleSend = async () => {
    if (!message.trim() || !currentUser || !chatRoomId) return;

    try {
      await addDoc(collection(db, 'chats', chatRoomId, 'messages'), {
        text: message.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Anonymous',
        timestamp: serverTimestamp(),
      });

      setMessage('');
      
      // Update chat room timestamp when sending a message
      const chatRef = doc(db, 'chats', chatRoomId);
      await updateDoc(chatRef, {
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isCurrentUser = item.senderId === currentUser?.uid;
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        {!isCurrentUser && (
          <Avatar 
            source={item.senderAvatar || 'https://picsum.photos/200/200?random=5'} 
            size={32} 
          />
        )}
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
        ]}>
          {!isCurrentUser && (
            <ThemedText style={styles.senderName}>{item.senderName}</ThemedText>
          )}
          <ThemedText style={styles.messageText}>{item.text}</ThemedText>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY_START} />
          <ThemedText style={styles.loadingText}>Loading chat...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ProtectedRoute redirectTo="/(tabs)/chat-room">
      <ThemedView style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContainer}
          inverted={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            multiline
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <IconSymbol 
              name="paperplane.fill" 
              size={20} 
              color={message.trim() ? Colors.BG_LIGHT : Colors.GRAY_MED} 
            />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ThemedView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_LIGHT,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.LIST_GAP,
    color: Colors.GRAY_MED,
  },
  messagesContainer: {
    padding: Spacing.SCREEN_PADDING,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: Spacing.LIST_GAP,
  },
  currentUserMessage: {
    justifyContent: 'flex-end',
  },
  otherUserMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: Spacing.LIST_GAP,
    borderRadius: Radii.BUTTON,
  },
  currentUserBubble: {
    backgroundColor: Colors.PRIMARY_START,
    marginLeft: Spacing.COMPONENT,
  },
  otherUserBubble: {
    backgroundColor: Colors.GRAY_LIGHT,
    marginRight: Spacing.COMPONENT,
  },
  senderName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  messageText: {
    color: Colors.TEXT,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.SCREEN_PADDING,
    paddingBottom: Spacing.COMPONENT,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
    borderRadius: Radii.BUTTON,
    padding: Spacing.LIST_GAP,
    maxHeight: 100,
    marginRight: Spacing.LIST_GAP,
  },
  sendButton: {
    backgroundColor: Colors.PRIMARY_START,
    width: 40,
    height: 40,
    borderRadius: Radii.CIRCLE,
    justifyContent: 'center',
    alignItems: 'center',
  },
});