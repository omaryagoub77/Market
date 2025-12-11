import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/ui/avatar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';
import { db, auth } from '@/src/firebase';
import { collection, query, orderBy, onSnapshot, where, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ChatRoomScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]); // In a real app, this would come from Firestore
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);
  // In a real app, you would get the chat ID from route params
  const chatId = 'CHAT_ID'; // This would come from route params

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

  // Fetch messages from Firestore based on chat ID
  useEffect(() => {
    if (!chatId || !currentUser) {
      return;
    }

    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    
    const unsubscribe = onSnapshot(messagesQuery, 
      (snapshot) => {
        const messagesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(messagesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages. Please try again later.');
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [chatId, currentUser]);

  const handleSend = async () => {
    if (!message.trim() || !currentUser) return;

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: message.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Anonymous',
        timestamp: serverTimestamp(),
      });

      setMessage('');
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
          inverted
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