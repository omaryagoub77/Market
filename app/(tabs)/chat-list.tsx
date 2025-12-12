import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Avatar } from '@/components/ui/avatar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Radii, Shadows } from '@/src/theme';
import { db, auth } from '@/src/firebase';
import { collection, query, orderBy, onSnapshot, where, limit, doc, getDocs, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getUserProfile } from '@/utils/userProfile';

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
            let isSentByCurrentUser = false;
            
            if (!messagesSnapshot.empty) {
              const messageDoc = messagesSnapshot.docs[0];
              const messageData = messageDoc.data();
              lastMessage = messageData.text;
              timestamp = messageData.timestamp?.toDate() || new Date();
              isSentByCurrentUser = messageData.senderId === currentUser.uid;
            }
            
            // Count unread messages
            let unreadCount = 0;
            try {
              // Query all messages in the chat
              const allMessagesQuery = query(
                collection(db, 'chats', chatId, 'messages')
              );
              
              const allMessagesSnapshot = await getDocs(allMessagesQuery);
              
              // Count messages that haven't been read by the current user
              allMessagesSnapshot.forEach((msgDoc) => {
                const msgData = msgDoc.data();
                // Check if readBy array exists and doesn't include current user
                if (!msgData.readBy || !msgData.readBy.includes(currentUser.uid)) {
                  unreadCount++;
                }
              });
            } catch (error) {
              console.error('Error counting unread messages:', error);
            }
            
            // Fetch user info for the other participant from Firestore
            let otherUserName = `User ${otherParticipantId.substring(0, 6)}`;
            let otherUserAvatar = `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 100)}`;
            
            try {
              const userProfile = await getUserProfile(otherParticipantId);
              if (userProfile) {
                otherUserName = userProfile.fullname || otherUserName;
                otherUserAvatar = userProfile.photoURL || otherUserAvatar;
              }
            } catch (error) {
              console.error('Error fetching user profile:', error);
              // Fall back to placeholder values
            }
            
            return {
              id: chatId,
              name: otherUserName,
              lastMessage,
              timestamp,
              unread: unreadCount,
              avatar: otherUserAvatar,
              otherUserId: otherParticipantId,
              isSentByCurrentUser
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

  const handleChatPress = async (otherUserId: string, chatId: string) => {
    // Mark messages as read when entering chat
    try {
      const messagesSnap = await getDocs(collection(db, 'chats', chatId, 'messages'));
      const updatePromises = messagesSnap.docs.map(async (docMsg) => {
        const msgRef = doc(db, 'chats', chatId, 'messages', docMsg.id);
        return updateDoc(msgRef, {
          readBy: arrayUnion(currentUser.uid)
        });
      });
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
    
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
      <View style={styles.avatarContainer}>
        <Avatar source={item.avatar} size={56} />
        {item.unread > 0 && (
          <View style={styles.unreadBadge}>
            <ThemedText style={styles.unreadText}>{item.unread}</ThemedText>
          </View>
        )}
      </View>
      <View style={styles.chatInfo}>
        <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
        <View style={styles.lastMessageContainer}>
          {item.lastMessage && (
            <ThemedText style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage}
            </ThemedText>
          )}
          {item.lastMessage && (
            <View style={styles.messageIndicator}>
              {item.isSentByCurrentUser ? (
                <IconSymbol name="chevron.right" size={12} color={Colors.GRAY_MED} />
              ) : (
                <IconSymbol name="chevron.left" size={12} color={Colors.PRIMARY_START} />
              )}
            </View>
          )}
        </View>
      </View>
      <View style={styles.chatMeta}>
        <ThemedText style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </ThemedText>
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
  avatarContainer: {
    position: 'relative',
  },
  messageIndicator: {
    marginLeft: 4,
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  unreadBadge: {
    backgroundColor: Colors.PRIMARY_START,
    borderRadius: 8,
    minWidth: 16,
    paddingHorizontal: 4,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  unreadText: {
    color: Colors.BG_LIGHT,
    fontSize: 10,
    fontWeight: 'bold',
  },
});