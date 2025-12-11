import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/ui/avatar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';
import { db, auth } from '@/src/firebase';
import { collection, query, orderBy, onSnapshot, where, limit, doc, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ChatListScreen() {
  const router = useRouter();
  const [chatData, setChatData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

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

  // Fetch real chat data from Firestore using onSnapshot
  useEffect(() => {
    if (!currentUser) {
      return;
    }

    // Listen for chat rooms where the current user is a participant
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(chatsQuery,
      async (snapshot) => {
        const chatsPromises = snapshot.docChanges().map(async (change) => {
          const chatData = change.doc.data();
          const chatId = change.doc.id;
          
          // Find the other participant (not the current user)
          const otherParticipantId = chatData.participants.find((id: string) => id !== currentUser.uid);
          
          if (otherParticipantId) {
            // Fetch the latest message in this chat
            const messagesQuery = query(
              collection(db, 'chats', chatId, 'messages'),
              orderBy('timestamp', 'desc'),
              limit(1)
            );
            
            // Use getDocs for queries
            const messagesSnapshot = await getDocs(messagesQuery);
            let lastMessage = null;
            let timestamp = new Date();
            
            if (!messagesSnapshot.empty) {
              const messageDoc = messagesSnapshot.docs[0];
              const messageData = messageDoc.data();
              lastMessage = messageData.text;
              timestamp = messageData.timestamp?.toDate() || new Date();
            }
            
            // Fetch user info for the other participant
            // In a real app, you'd have a users collection
            const otherUserName = `User ${otherParticipantId.substring(0, 6)}`;
            const otherUserAvatar = `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 100)}`;
            
            return {
              id: chatId,
              name: otherUserName,
              lastMessage,
              timestamp,
              unread: 0, // In a real app, you'd track unread messages
              avatar: otherUserAvatar,
              otherUserId: otherParticipantId
            };
          }
          return null;
        });
        
        const chatsResults = await Promise.all(chatsPromises);
        const validChats = chatsResults.filter(chat => chat !== null);
        
        // Update chat data based on the type of change
        setChatData(prevChats => {
          const updatedChats = [...prevChats];
          
          snapshot.docChanges().forEach((change, index) => {
            const chat = validChats[index];
            if (!chat) return;
            
            const existingIndex = updatedChats.findIndex(c => c.id === chat.id);
            
            if (change.type === 'added') {
              if (existingIndex === -1) {
                updatedChats.unshift(chat); // Add to the beginning
              }
            } else if (change.type === 'modified') {
              if (existingIndex !== -1) {
                updatedChats[existingIndex] = chat;
              }
            } else if (change.type === 'removed') {
              if (existingIndex !== -1) {
                updatedChats.splice(existingIndex, 1);
              }
            }
          });
          
          return updatedChats;
        });
        
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching chats:', error);
        setError('Failed to load chats. Please try again later.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleChatPress = (otherUserId: string, chatId: string) => {
    router.push({
      pathname: '/(tabs)/chat-room',
      params: { sellerId: otherUserId, chatId }
    });
  };

  const renderChatItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => handleChatPress(item.otherUserId, item.id)}
    >
      <Avatar source={item.avatar} size={56} />
      <View style={styles.chatInfo}>
        <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
        {item.lastMessage && (
          <ThemedText style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </ThemedText>
        )}
      </View>
      <View style={styles.chatMeta}>
        <ThemedText style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </ThemedText>
        {item.unread > 0 && (
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>{item.unread}</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY_START} />
          <ThemedText style={styles.loadingText}>Loading chats...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ProtectedRoute redirectTo="/(tabs)/chat-list">
      <ThemedView style={styles.container}>
        <FlatList
          data={chatData}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={styles.contentContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconSymbol name="message" size={64} color={Colors.GRAY_MED} />
              <ThemedText style={styles.emptyText}>No conversations yet</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Start chatting with sellers and buyers
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Chats will appear here when you contact sellers
              </ThemedText>
            </View>
          }
        />
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
  contentContainer: {
    padding: Spacing.SCREEN_PADDING,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.LIST_GAP,
    borderBottomWidth: 1,
    borderBottomColor: Colors.GRAY_LIGHT,
  },
  chatInfo: {
    flex: 1,
    marginLeft: Spacing.COMPONENT,
  },
  lastMessage: {
    color: Colors.GRAY_MED,
    marginTop: 4,
  },
  chatMeta: {
    alignItems: 'flex-end',
    marginLeft: Spacing.LIST_GAP,
  },
  timestamp: {
    color: Colors.GRAY_MED,
    fontSize: 12,
  },
  badge: {
    backgroundColor: Colors.PRIMARY_START,
    borderRadius: Radii.CIRCLE,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  badgeText: {
    color: Colors.BG_LIGHT,
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: Spacing.COMPONENT,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: Spacing.LIST_GAP,
    color: Colors.GRAY_MED,
    textAlign: 'center',
  },
});